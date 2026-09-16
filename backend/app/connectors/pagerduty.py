import datetime
import httpx
import uuid
from typing import Optional, Tuple, Dict, Any
from .base import IncidentManagementConnector
from ..config import settings

class PagerDutyConnector(IncidentManagementConnector):
    def __init__(self):
        self._routing_key = settings.PAGERDUTY_ROUTING_KEY
        self._api_token = settings.PAGERDUTY_API_TOKEN
        self._offline_mode = settings.OFFLINE_MODE

    def name(self) -> str:
        return 'PagerDuty'

    def create_incident(
        self,
        dedup_key: str,
        summary: str,
        severity: str,
        service: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Tuple[Optional[str], str]:
        if self._offline_mode or not self._routing_key:
            mock_id = f'PD-{uuid.uuid4().hex[:10].upper()}'
            return mock_id, f'Mocked incident triggered: {dedup_key}'

        url = 'https://events.pagerduty.com/v2/enqueue'
        valid_severities = {'critical', 'error', 'warning', 'info'}
        pd_severity = severity.lower() if severity.lower() in valid_severities else 'warning'

        payload = {
            'routing_key': self._routing_key,
            'event_action': 'trigger',
            'dedup_key': dedup_key,
            'client': 'NEXUS Event Intelligence Platform',
            'client_url': 'http://localhost:5173',
            'payload': {
                'summary': summary,
                'source': f'NEXUS - {service}',
                'severity': pd_severity,
                'timestamp': datetime.datetime.utcnow().isoformat() + 'Z',
                'component': service,
                'group': 'Enterprise Operations',
                'class': 'Application Service Outage',
                'custom_details': metadata or {}
            }
        }

        try:
            with httpx.Client(timeout=10.0) as client:
                resp = client.post(url, json=payload)
                if resp.status_code == 202:
                    data = resp.json()
                    return data.get('dedup_key', dedup_key), 'Event accepted by PagerDuty Events API v2.'
                return None, f'PagerDuty returned {resp.status_code}: {resp.text[:200]}'
        except Exception as e:
            return None, f'PagerDuty connection failed: {str(e)}'

    def acknowledge_incident(self, dedup_key: str, incident_id: Optional[str] = None) -> Tuple[bool, str]:
        if self._offline_mode or not self._routing_key:
            return True, f'Mocked acknowledge for {dedup_key}'

        url = 'https://events.pagerduty.com/v2/enqueue'
        payload = {
            'routing_key': self._routing_key,
            'event_action': 'acknowledge',
            'dedup_key': dedup_key
        }
        try:
            with httpx.Client(timeout=10.0) as client:
                resp = client.post(url, json=payload)
                return resp.status_code == 202, f'PagerDuty ack status: {resp.status_code}'
        except Exception as e:
            return False, str(e)

    def resolve_incident(self, dedup_key: str, incident_id: Optional[str] = None) -> Tuple[bool, str]:
        if self._offline_mode or not self._routing_key:
            return True, f'Mocked resolution for {dedup_key}'

        url = 'https://events.pagerduty.com/v2/enqueue'
        payload = {
            'routing_key': self._routing_key,
            'event_action': 'resolve',
            'dedup_key': dedup_key
        }
        try:
            with httpx.Client(timeout=10.0) as client:
                resp = client.post(url, json=payload)
                return resp.status_code == 202, f'PagerDuty resolve status: {resp.status_code}'
        except Exception as e:
            return False, str(e)

    def add_note(self, incident_id: str, note_content: str) -> bool:
        if not self._api_token or self._offline_mode:
            return True
        url = f'https://api.pagerduty.com/incidents/{incident_id}/notes'
        headers = {
            'Authorization': f'Token token={self._api_token}',
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.pagerduty+json;version=2',
            'From': 'nexus-sre@company.com'
        }
        payload = {'note': {'content': note_content}}
        try:
            with httpx.Client(timeout=10.0) as client:
                resp = client.post(url, json=payload, headers=headers)
                return resp.status_code == 201
        except Exception:
            return False

pagerduty_connector = PagerDutyConnector()
