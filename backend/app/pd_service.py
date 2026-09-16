import datetime
import httpx
import uuid
import random
from typing import Tuple, Optional
from .config import settings

def send_pagerduty_event(
    action: str,  # trigger, acknowledge, resolve
    dedup_key: str,
    summary: str,
    severity: str = "critical",
    service_name: str = "claims-service"
) -> Tuple[Optional[str], str]:
    """
    Sends an event to PagerDuty Events API v2.
    Returns (pagerduty_id, status_message)
    """
    if settings.OFFLINE_MODE or not settings.PAGERDUTY_ROUTING_KEY:
        # Mocked PagerDuty response
        mock_pd_id = f"PD-{uuid.uuid4().hex[:12].upper()}"
        if action == "trigger":
            return mock_pd_id, f"Mocked trigger event sent successfully. Dedup key: {dedup_key}"
        elif action == "acknowledge":
            return dedup_key, f"Mocked ack event sent successfully. Dedup key: {dedup_key}"
        else:
            return dedup_key, f"Mocked resolve event sent successfully. Dedup key: {dedup_key}"

    # Real PagerDuty integration
    url = "https://events.pagerduty.com/v2/enqueue"
    
    # Severity mapping for PagerDuty Events API v2 (must be critical, error, warning, or info)
    valid_severities = {"critical", "error", "warning", "info"}
    pd_severity = severity.lower() if severity.lower() in valid_severities else "warning"

    payload = {
        "routing_key": settings.PAGERDUTY_ROUTING_KEY,
        "event_action": action,
        "dedup_key": dedup_key
    }

    if action == "trigger":
        payload["client"] = "Dynatrace Event Management Engine"
        payload["client_url"] = "http://localhost:5173"
        payload["payload"] = {
            "summary": summary,
            "source": f"Dynatrace - {service_name}",
            "severity": pd_severity,
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            "component": service_name,
            "group": "Claims Processing POC",
            "class": "Application Service Failure"
        }

    try:
        with httpx.Client() as client:
            response = client.post(url, json=payload, timeout=10.0)
            if response.status_code == 202:
                data = response.json()
                return data.get("dedup_key"), "Event accepted by PagerDuty."
            else:
                return None, f"PagerDuty rejected event ({response.status_code}): {response.text}"
    except Exception as e:
        return None, f"Failed to connect to PagerDuty: {str(e)}"

def sync_servicenow_incident(
    action: str,  # create, resolve
    pd_incident_id: str,
    summary: str,
    service_id: str
) -> Tuple[str, str]:
    """
    Simulates sync with ServiceNow IT Service Management (ITSM).
    Returns (servicenow_id, status_message)
    """
    # Simulate API call latency
    mock_snow_id = f"INC{random.randint(1000000, 9999999)}"
    if action == "create":
        msg = f"ServiceNow incident created. CMDB Item: {service_id} mapped. Linked to PD: {pd_incident_id}"
        return mock_snow_id, msg
    else:
        return pd_incident_id, f"ServiceNow incident resolved. Linked to PD: {pd_incident_id}"

def get_pagerduty_incidents(api_token: str, active_only: bool = True) -> list:
    """
    Polls the PagerDuty REST API for incidents.
    Enriches each incident with the alert_key (= our dedup_key) by fetching
    the /incidents/{id}/alerts sub-resource.
    If active_only is True, fetches only 'triggered' and 'acknowledged' incidents
    to minimize API calls and avoid sequential read timeouts.
    """
    url = "https://api.pagerduty.com/incidents"
    headers = {
        "Authorization": f"Token token={api_token}",
        "Accept": "application/vnd.pagerduty+json;version=2"
    }
    params = [
        ("statuses[]", "triggered"),
        ("statuses[]", "acknowledged")
    ]
    if not active_only:
        params.append(("statuses[]", "resolved"))

    params.extend([
        ("limit", "50"),
        ("sort_by", "created_at:desc"),
    ])
    try:
        with httpx.Client(timeout=15.0) as client:
            response = client.get(url, headers=headers, params=params)
            if response.status_code != 200:
                import logging
                logging.getLogger("nexus").warning(
                    f"PagerDuty REST API returned {response.status_code}: {response.text[:300]}"
                )
                return []

            incidents = response.json().get("incidents", [])

            # Enrich each incident with its alert_key (= our dedup_key)
            for inc in incidents:
                inc_id = inc.get("id")
                if not inc_id:
                    continue
                try:
                    alerts_resp = client.get(
                        f"https://api.pagerduty.com/incidents/{inc_id}/alerts",
                        headers=headers,
                        params=[("limit", "1")]
                    )
                    if alerts_resp.status_code == 200:
                        alerts = alerts_resp.json().get("alerts", [])
                        if alerts:
                            inc["_alert_key"] = alerts[0].get("alert_key")
                except Exception:
                    inc["_alert_key"] = None

            return incidents

    except Exception as e:
        import logging
        logging.getLogger("nexus").warning(f"PagerDuty REST API exception: {e}")
        return []

def get_pagerduty_incident_by_key(api_token: str, key: str) -> Optional[dict]:
    """
    Specifically queries PagerDuty REST API for incidents matching a given incident_key (dedup_key).
    Returns the latest incident object (active or resolved) if found.
    """
    url = "https://api.pagerduty.com/incidents"
    headers = {
        "Authorization": f"Token token={api_token}",
        "Accept": "application/vnd.pagerduty+json;version=2"
    }
    # Query with incident_key and statuses representing all states
    params = [
        ("incident_key", key),
        ("statuses[]", "triggered"),
        ("statuses[]", "acknowledged"),
        ("statuses[]", "resolved"),
        ("limit", "5"),
        ("sort_by", "created_at:desc")
    ]
    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.get(url, headers=headers, params=params)
            if response.status_code == 200:
                incidents = response.json().get("incidents", [])
                if incidents:
                    # Return the latest one (sorted by created_at desc)
                    return incidents[0]
            return None
    except Exception as e:
        import logging
        logging.getLogger("nexus").warning(f"Failed to query PagerDuty incident by key {key}: {e}")
        return None

def get_pagerduty_incident_by_id(api_token: str, pd_id: str) -> Optional[dict]:
    """
    Queries PagerDuty REST API specifically for an incident by its unique PagerDuty ID.
    Returns the incident object if found.
    """
    url = f"https://api.pagerduty.com/incidents/{pd_id}"
    headers = {
        "Authorization": f"Token token={api_token}",
        "Accept": "application/vnd.pagerduty+json;version=2"
    }
    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.get(url, headers=headers)
            if response.status_code == 200:
                return response.json().get("incident")
            return None
    except Exception as e:
        import logging
        logging.getLogger("nexus").warning(f"Failed to query PagerDuty incident by ID {pd_id}: {e}")
        return None

DEFAULT_PD_EMAIL = "rugved-umesh.mhatre@capgemini.com"

def resolve_pagerduty_incident_rest(
    pd_incident_id: str,
    api_token: Optional[str] = None,
    from_email: str = DEFAULT_PD_EMAIL,
    resolution_note: str = "Resolved automatically via NEXUS SRE remediation runbook."
) -> Tuple[bool, str]:
    """
    Directly resolves an incident on PagerDuty via REST API v2 (PUT /incidents/{id}).
    Guarantees immediate and synchronous resolution on the PagerDuty dashboard.
    """
    token = api_token or settings.PAGERDUTY_API_TOKEN
    if not token or settings.OFFLINE_MODE:
        return True, "Mocked REST resolve success"

    # If pd_incident_id contains colon, extract the second part
    if ":" in pd_incident_id:
        pd_incident_id = pd_incident_id.split(":")[1]

    url = f"https://api.pagerduty.com/incidents/{pd_incident_id}"
    headers = {
        "Authorization": f"Token token={token}",
        "Accept": "application/vnd.pagerduty+json;version=2",
        "Content-Type": "application/json",
        "From": from_email
    }
    payload = {
        "incident": {
            "type": "incident_reference",
            "status": "resolved",
            "resolution": resolution_note
        }
    }
    try:
        with httpx.Client(timeout=10.0) as client:
            res = client.put(url, headers=headers, json=payload)
            if res.status_code in [200, 201]:
                return True, f"PagerDuty incident {pd_incident_id} successfully resolved via REST API."
            else:
                return False, f"PagerDuty REST resolve returned {res.status_code}: {res.text[:200]}"
    except Exception as e:
        return False, f"PagerDuty REST resolve exception: {str(e)}"

def resolve_incident_everywhere(
    pagerduty_id_field: str,
    summary: str = "Incident resolved",
    service_id: str = "claims-database"
) -> Tuple[bool, str]:
    """
    Resolves the incident across both PagerDuty Events API v2 (by dedup_key)
    AND PagerDuty REST API v2 (by incident ID), finding the incident ID if needed.
    """
    parts = pagerduty_id_field.split(":") if pagerduty_id_field else []
    dedup_key = parts[0] if len(parts) > 0 else ""
    pd_incident_id = parts[1] if len(parts) > 1 else None

    # 1. Fire Events API v2 resolve
    event_ok, event_msg = False, ""
    if dedup_key:
        event_res, event_msg = send_pagerduty_event(
            action="resolve",
            dedup_key=dedup_key,
            summary=summary,
            severity="info",
            service_name=service_id
        )
        event_ok = bool(event_res)

    # 2. If pd_incident_id not known, query active incidents in PagerDuty to find it
    if not pd_incident_id and settings.PAGERDUTY_API_TOKEN and not settings.OFFLINE_MODE:
        try:
            active_list = get_pagerduty_incidents(settings.PAGERDUTY_API_TOKEN, active_only=True)
            for pd_inc in active_list:
                key = pd_inc.get("_alert_key") or pd_inc.get("incident_key")
                # match by dedup_key or title similarity
                if (key and (key == dedup_key or dedup_key in str(key) or str(key) in dedup_key)) or \
                   (service_id in pd_inc.get("title", "").lower()):
                    pd_incident_id = pd_inc.get("id")
                    break
        except Exception as e:
            pass

    # 3. Fire REST API v2 resolve
    rest_ok, rest_msg = False, ""
    if pd_incident_id:
        rest_ok, rest_msg = resolve_pagerduty_incident_rest(pd_incident_id)

    return (event_ok or rest_ok), f"Events API: {event_msg} | REST API: {rest_msg or 'skipped'}"







