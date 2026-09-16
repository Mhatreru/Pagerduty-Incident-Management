import random
from typing import Tuple, Optional
from .base import ITSMConnector
from ..config import settings

class ServiceNowConnector(ITSMConnector):
    def __init__(self):
        self._mock_enabled = settings.SERVICENOW_MOCK_ENABLED

    def name(self) -> str:
        return "ServiceNow"

    def create_ticket(self, incident_id: str, summary: str, service_id: str, priority: str = "P2") -> Tuple[str, str]:
        ticket_id = f"INC{random.randint(1000000, 9999999)}"
        msg = f"ServiceNow ticket {ticket_id} opened. CMDB Configuration Item: {service_id}, Priority: {priority}, Linked PD: {incident_id}"
        return ticket_id, msg

    def update_status(self, ticket_id: str, status: str, notes: Optional[str] = None) -> Tuple[bool, str]:
        return True, f"ServiceNow {ticket_id} status updated to {status}. {notes or ''}"

    def resolve_ticket(self, ticket_id: str, resolution_notes: str) -> Tuple[bool, str]:
        return True, f"ServiceNow {ticket_id} resolved. Resolution: {resolution_notes}"

servicenow_connector = ServiceNowConnector()
