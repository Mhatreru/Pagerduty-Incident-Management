import uuid
from typing import Dict, Any
from .base import MonitoringConnector

class DynatraceConnector(MonitoringConnector):
    def name(self) -> str:
        return "Dynatrace"

    def normalize(self, raw_payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalizes Dynatrace Problem notification or API v2 problem into standard NEXUS canonical dictionary.
        """
        prob_id = raw_payload.get("ProblemID") or raw_payload.get("problemId") or str(uuid.uuid4())[:8]
        title = raw_payload.get("ProblemTitle") or raw_payload.get("title") or "Dynatrace Anomaly"
        entity = raw_payload.get("ImpactedEntity") or "claims-database"

        # Map Dynatrace severity keywords
        raw_sev = (raw_payload.get("ProblemSeverity") or raw_payload.get("severityLevel") or "WARNING").upper()
        sev_map = {
            "AVAILABILITY": "CRITICAL",
            "CRITICAL": "CRITICAL",
            "ERROR": "ERROR",
            "PERFORMANCE": "WARNING",
            "RESOURCE_CONTENTION": "WARNING",
            "CUSTOM_ALERT": "WARNING"
        }
        severity = sev_map.get(raw_sev, "WARNING")

        state = (raw_payload.get("State") or raw_payload.get("status") or "OPEN").upper()

        return {
            "event_id": f"EVT-DT-{prob_id}",
            "correlation_id": f"CORR-DT-{prob_id}",
            "source": "dynatrace",
            "service_id": entity.lower().replace(" ", "-"),
            "environment": "production",
            "severity": severity,
            "status": "OPEN" if state == "OPEN" else "RESOLVED",
            "problem_type": "database_latency" if "database" in entity.lower() else "service_degradation",
            "entity": entity,
            "message": f"Dynatrace Problem {prob_id}: {title}",
            "tags": ["dynatrace", "production", severity.lower()],
            "metadata": raw_payload
        }

dynatrace_connector = DynatraceConnector()
