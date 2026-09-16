from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, Tuple, List

class MonitoringConnector(ABC):
    @abstractmethod
    def name(self) -> str:
        pass

    @abstractmethod
    def normalize(self, raw_payload: Dict[str, Any]) -> Dict[str, Any]:
        pass

class IncidentManagementConnector(ABC):
    @abstractmethod
    def name(self) -> str:
        pass

    @abstractmethod
    def create_incident(self, dedup_key: str, summary: str, severity: str, service: str, metadata: Optional[Dict[str, Any]] = None) -> Tuple[Optional[str], str]:
        pass

    @abstractmethod
    def acknowledge_incident(self, dedup_key: str, incident_id: Optional[str] = None) -> Tuple[bool, str]:
        pass

    @abstractmethod
    def resolve_incident(self, dedup_key: str, incident_id: Optional[str] = None) -> Tuple[bool, str]:
        pass

    @abstractmethod
    def add_note(self, incident_id: str, note_content: str) -> bool:
        pass

class ITSMConnector(ABC):
    @abstractmethod
    def name(self) -> str:
        pass

    @abstractmethod
    def create_ticket(self, incident_id: str, summary: str, service_id: str, priority: str = 'P2') -> Tuple[str, str]:
        pass

    @abstractmethod
    def update_status(self, ticket_id: str, status: str, notes: Optional[str] = None) -> Tuple[bool, str]:
        pass

    @abstractmethod
    def resolve_ticket(self, ticket_id: str, resolution_notes: str) -> Tuple[bool, str]:
        pass

class NotificationConnector(ABC):
    @abstractmethod
    def name(self) -> str:
        pass

    @abstractmethod
    def send_incident_alert(self, incident: Dict[str, Any], channel: Optional[str] = None) -> bool:
        pass

    @abstractmethod
    def send_remediation_notification(self, incident: Dict[str, Any], runbook: Dict[str, Any], status: str) -> bool:
        pass
