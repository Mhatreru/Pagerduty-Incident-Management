import json
import httpx
from typing import Dict, Any
from .config import settings

STRUCTURED_DATABASE_LATENCY_RCA = {
    "summary": "Claims Processing Database is experiencing high connection latency (>4,000ms), causing cascading timeouts in downstream applications (claims-api, claims-portal).",
    "root_cause": "PostgreSQL connection pool exhaustion triggered by unindexed batch query execution during peak load.",
    "confidence": 94,
    "risk_level": "HIGH",
    "technical_impact": "Downstream API latency spiked from 45ms to 5,200ms; HTTP 500 error rate exceeded 18%.",
    "business_impact": "Estimated 12,500 active portal users affected. Revenue exposure: ~$22,500/hr. SLA is at risk.",
    "evidence": [
        "Active DB connections spiked from 45 baseline to 150 limit.",
        "pg_stat_activity shows 14 blocked queries on claims_records table.",
        "Dynatrace Smartscape confirms cascading timeouts in API Gateway."
    ],
    "recommended_runbook": "rb-db-pool-recovery",
    "recommended_actions": [
        "1. Terminate stagnant queries in pg_stat_activity.",
        "2. Temporarily increase max_connections pool to 250.",
        "3. Throttle billing batch consumers by 50% until latency stabilizes."
    ],
    "similar_incidents": [
        {"incident_id": "INC-1024", "summary": "DB pool exhaustion during monthly billing run", "resolved_in_min": 12, "successful_runbook": "rb-db-pool-recovery"},
        {"incident_id": "INC-987", "summary": "Cascading gateway timeouts from DB lock contention", "resolved_in_min": 18, "successful_runbook": "rb-db-pool-recovery"}
    ],
    "escalation_team": "Data Platform & Core SRE"
}

STRUCTURED_DEFAULT_RCA = {
    "summary": "Service degradation reported on primary application node.",
    "root_cause": "Traffic spike and dependency resource contention detected.",
    "confidence": 88,
    "risk_level": "MEDIUM",
    "technical_impact": "Service response latency elevated beyond baseline threshold.",
    "business_impact": "Customer checkout experiences minor delays; SLA healthy.",
    "evidence": [
        "Synthetic health check response latency > 3000ms.",
        "CPU utilization on host node increased by 35%."
    ],
    "recommended_runbook": "rb-gateway-traffic-rebalance",
    "recommended_actions": [
        "1. Flush ephemeral gateway route caches.",
        "2. Validate upstream service response codes.",
        "3. Review distributed trace correlation logs."
    ],
    "similar_incidents": [
        {"incident_id": "INC-855", "summary": "Transient gateway routing degradation", "resolved_in_min": 7, "successful_runbook": "rb-gateway-traffic-rebalance"}
    ],
    "escalation_team": "Application SRE"
}

def generate_incident_insights(
    service_id: str,
    alert_message: str,
    topology_info: str
) -> str:
    """
    Generates structured AI root-cause analysis, confidence score, evidence,
    and runbook recommendations. Falls back gracefully in offline mode or on error.
    """
    is_db = "database" in service_id.lower() or "db" in service_id.lower() or "latency" in alert_message.lower()
    base_rca = STRUCTURED_DATABASE_LATENCY_RCA if is_db else STRUCTURED_DEFAULT_RCA

    if settings.OFFLINE_MODE or not settings.GEMINI_API_KEY:
        return json.dumps(base_rca, indent=2)

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
    prompt = f"""
    You are an expert AI SRE Copilot. Return ONLY valid JSON with this exact schema:
    {{
        "summary": "Short explanation of failure",
        "root_cause": "Probable root cause",
        "confidence": 92,
        "risk_level": "HIGH",
        "technical_impact": "Technical impact on systems",
        "business_impact": "Impact on users, transactions, SLA",
        "evidence": ["evidence item 1", "evidence item 2"],
        "recommended_runbook": "rb-db-pool-recovery",
        "recommended_actions": ["Action 1", "Action 2"],
        "similar_incidents": [{{"incident_id": "INC-102", "summary": "similar issue", "resolved_in_min": 10, "successful_runbook": "rb-db-pool-recovery"}}],
        "escalation_team": "Team name"
    }}

    Context:
    Service: {service_id}
    Alert Message: {alert_message}
    Topology:
    {topology_info}
    """

    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }

    try:
        with httpx.Client(timeout=8.0) as client:
            resp = client.post(url, json=payload)
            if resp.status_code == 200:
                raw_text = resp.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
                # Clean markdown json code blocks if present
                if raw_text.startswith("```json"):
                    raw_text = raw_text[7:]
                if raw_text.startswith("```"):
                    raw_text = raw_text[3:]
                if raw_text.endswith("```"):
                    raw_text = raw_text[:-3]
                parsed = json.loads(raw_text.strip())
                return json.dumps(parsed, indent=2)
            else:
                return json.dumps(base_rca, indent=2)
    except Exception:
        return json.dumps(base_rca, indent=2)


def ask_gemini_copilot(query: str, incident_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Interactive AI Copilot for incident operators.
    Accepts questions from the operator and responds with contextual analysis,
    remediation guidance, rollback evaluation, and stakeholder updates.
    """
    inc_info = incident_data or {}
    service = inc_info.get("primary_service_id", "claims-database")
    summary = inc_info.get("summary", "PostgreSQL database connection latency spike causing downstream timeouts")
    runbook = inc_info.get("runbook_id", "rb-db-pool-recovery")

    # Offline / fallback responses for fast testing or when key not configured
    offline_reply = (
        "Gemini SRE Analysis:\n"
        f"The incident on '{service}' is caused by connection pool contention. "
        f"The recommended runbook is '{runbook}', which terminates stagnant queries and increases the pool limit to 250 connections. "
        "Safety verification: Downstream latency on API Gateway will drop below 120ms within 45 seconds of applying the fix."
    )

    if "rollback" in query.lower():
        offline_reply = (
            "Rollback vs. Remediation Assessment:\n"
            f"1. Remediation via '{runbook}' (Recommended): Low risk, no code deployment needed. Resets connection limits live without restarting containers.\n"
            "2. Pod/Service Rollback: High risk. Rolling back the deployment will sever active client connections and trigger an initial latency spike while cold-starting."
        )
    elif "announcement" in query.lower() or "status" in query.lower() or "stakeholder" in query.lower():
        offline_reply = (
            "Draft Customer Status Update:\n"
            "Title: Investigating Claims Portal Latency\n"
            "Status: Identified & Remediating\n"
            "Message: Our engineering team has identified database lock contention impacting portal transactions. "
            "An automated connection pool recovery is underway. Normal response times are expected to restore shortly."
        )
    elif "runbook" in query.lower() or "command" in query.lower():
        offline_reply = (
            f"Runbook Command Explanation ('{runbook}'):\n"
            "SELECT pg_terminate_backend(pid) ... terminates inactive sessions idling for >30s.\n"
            "ALTER SYSTEM SET max_connections = 250; SELECT pg_reload_conf(); expands connection headroom from 150 to 250 without a full server restart."
        )

    suggestions = [
        "What does the remediation runbook do?",
        "Evaluate Rollback vs Pool Expansion",
        "Draft Stakeholder Status Page update",
        "Explain root cause in simple terms"
    ]

    if settings.OFFLINE_MODE or not settings.GEMINI_API_KEY:
        clean_offline = offline_reply.replace("*", "").strip()
        return {"reply": clean_offline, "suggestions": suggestions}

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
    system_prompt = f"""
    You are an expert Google DeepMind / SRE Copilot in the NEXUS Incident Intelligence platform.
    An on-call incident operator is asking you a question during an active production incident.
    Be concise, technical yet crystal clear, and highly actionable.

    CRITICAL FORMATTING INSTRUCTION:
    DO NOT USE ANY ASTERISK SYMBOLS (*) IN YOUR RESPONSE UNDER ANY CIRCUMSTANCES.
    Never use bold markdown like **word**, italics like *word*, or bullet points with asterisks like * item.
    Use clean plain text, colons for labels, numbers (1., 2.) or hyphens (-) for lists, and backticks for commands/code.

    Current Incident Context:
    - Service: {service}
    - Summary: {summary}
    - Recommended Runbook: {runbook}
    - Details: {json.dumps(inc_info)}

    User Operator Question:
    {query}
    """

    payload = {
        "contents": [{"parts": [{"text": system_prompt}]}]
    }

    try:
        with httpx.Client(timeout=10.0) as client:
            resp = client.post(url, json=payload)
            if resp.status_code == 200:
                answer = resp.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
                clean_answer = answer.replace("*", "").strip()
                return {"reply": clean_answer, "suggestions": suggestions}
    except Exception as e:
        print(f"Gemini API request failed: {e}")

    clean_fallback = offline_reply.replace("*", "").strip()
    return {"reply": clean_fallback, "suggestions": suggestions}
