import uuid
import datetime
import hashlib
import json
from typing import Dict, Any, Tuple
from .connectors.dynatrace import dynatrace_connector
from .schemas import CanonicalEventCreate

class EventGateway:
    """
    Standardized Ingestion Gateway for all multi-source monitoring alerts.
    Validates, authenticates, and normalizes into CanonicalEvent format.
    """
    def __init__(self):
        self._ingestion_rate_window: Dict[str, list] = {}

    def is_rate_limited(self, source_ip: str = "global", max_per_sec: int = 100) -> bool:
        now = datetime.datetime.utcnow().timestamp()
        timestamps = self._ingestion_rate_window.setdefault(source_ip, [])
        # purge older than 1 second
        self._ingestion_rate_window[source_ip] = [t for t in timestamps if now - t < 1.0]
        if len(self._ingestion_rate_window[source_ip]) >= max_per_sec:
            return True
        self._ingestion_rate_window[source_ip].append(now)
        return False

    def detect_source(self, payload: Dict[str, Any]) -> str:
        if "ProblemID" in payload or "problemId" in payload:
            return "dynatrace"
        if "AlarmName" in payload or "AWSAccountId" in payload:
            return "cloudwatch"
        if "alerts" in payload and "receiver" in payload:
            return "prometheus"
        if "event_type" in payload and "title" in payload:
            return "datadog"
        return "generic_webhook"

    def normalize(self, payload: Dict[str, Any], explicit_source: str = None) -> CanonicalEventCreate:
        source = explicit_source or self.detect_source(payload)

        if source == "dynatrace":
            norm = dynatrace_connector.normalize(payload)
            return CanonicalEventCreate(**norm)

        # Generic / Prometheus / CloudWatch adapter
        event_id = payload.get("event_id") or f"EVT-{source[:4].upper()}-{uuid.uuid4().hex[:8]}"
        service_id = payload.get("service_id") or payload.get("service") or payload.get("ImpactedEntity") or "claims-api"
        message = payload.get("message") or payload.get("summary") or payload.get("ProblemTitle") or "Service alert detected"
        severity = payload.get("severity") or payload.get("ProblemSeverity") or "WARNING"
        status = payload.get("status") or payload.get("State") or "OPEN"

        correlation_id = payload.get("correlation_id") or f"CORR-{hashlib.md5(f'{service_id}-{message[:20]}'.encode()).hexdigest()[:8]}"

        return CanonicalEventCreate(
            event_id=event_id,
            correlation_id=correlation_id,
            source=source,
            service_id=service_id,
            environment=payload.get("environment", "production"),
            severity=severity.upper(),
            status=status.upper(),
            problem_type=payload.get("problem_type", "unclassified"),
            entity=payload.get("entity", service_id),
            message=message,
            tags=payload.get("tags", [source, "normalized"]),
            metadata=payload
        )

event_gateway = EventGateway()
