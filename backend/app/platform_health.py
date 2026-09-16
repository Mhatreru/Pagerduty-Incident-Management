import datetime
from typing import Dict, Any
from sqlalchemy.orm import Session
from .config import settings
from .event_bus import event_bus
from . import models

def get_nexus_health(db: Session) -> Dict[str, Any]:
    """
    Self-monitoring and observability metrics for NEXUS itself.
    """
    # Test DB responsiveness
    db_status = "HEALTHY"
    try:
        db.execute(models.Service.__table__.select().limit(1))
    except Exception:
        db_status = "DEGRADED"

    bus_stats = event_bus.get_stats()

    connectors_health = {
        "dynatrace": "CONNECTED" if (settings.DYNATRACE_API_TOKEN and settings.DYNATRACE_TENANT_URL) else "NOT_CONFIGURED",
        "pagerduty": "CONNECTED" if settings.PAGERDUTY_ROUTING_KEY else "OFFLINE_MOCK",
        "gemini_ai": "CONNECTED" if settings.GEMINI_API_KEY else "OFFLINE_MOCK",
        "servicenow": "MOCK_ACTIVE"
    }

    overall_status = "HEALTHY" if db_status == "HEALTHY" and bus_stats["queue_depth"] < 500 else "DEGRADED"

    return {
        "status": overall_status,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "version": "v2.0.0-enterprise",
        "database": db_status,
        "event_bus": bus_stats,
        "connectors": connectors_health,
        "ingestion_mode": settings.INTEGRATION_MODE if hasattr(settings, "INTEGRATION_MODE") else "event_driven"
    }
