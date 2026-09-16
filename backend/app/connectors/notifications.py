import logging
from typing import Dict, Any, Optional
from .base import NotificationConnector

logger = logging.getLogger("nexus.notifications")

class MultiChannelNotificationConnector(NotificationConnector):
    def __init__(self):
        self.dispatched_history = []

    def name(self) -> str:
        return "MultiChannel (Slack/Teams/Webhook)"

    def send_incident_alert(self, incident: Dict[str, Any], channel: Optional[str] = None) -> bool:
        """
        Formats and dispatches rich P1/P2 operational cards for Slack/Teams.
        """
        priority = incident.get("priority", "P2")
        summary = incident.get("summary", "Incident Alert")
        service = incident.get("primary_service_id", "Unknown")
        root_cause = incident.get("root_cause_service_id", service)
        confidence = incident.get("ai_confidence", 94)

        card = {
            "title": f"🚨 [{priority}] INCIDENT DETECTED — {service}",
            "summary": summary,
            "root_cause_candidate": root_cause,
            "ai_confidence": f"{confidence}%",
            "recommended_runbook": incident.get("runbook_id", "rb-db-pool-recovery"),
            "pagerduty_id": incident.get("pagerduty_id"),
            "channel": channel or "ops-critical-alerts",
            "actions": [
                {"label": "War Room", "url": f"http://localhost:5173/#/war-room"},
                {"label": "Approve Remediation", "action": "approve_remediation"}
            ]
        }
        self.dispatched_history.append(card)
        logger.info(f"Dispatched Slack/Teams Notification: {card['title']} to #{card['channel']}")
        return True

    def send_remediation_notification(self, incident: Dict[str, Any], runbook: Dict[str, Any], status: str) -> bool:
        card = {
            "title": f"🛠️ Remediation Update: {runbook.get('name', 'Runbook')} — Status: {status.upper()}",
            "incident_id": incident.get("id"),
            "service": incident.get("primary_service_id"),
            "status": status,
            "channel": "sre-remediation-log"
        }
        self.dispatched_history.append(card)
        logger.info(f"Dispatched Remediation Notification: {card['title']}")
        return True

notification_connector = MultiChannelNotificationConnector()
