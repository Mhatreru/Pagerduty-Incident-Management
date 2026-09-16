import os
from pathlib import Path

def _load_env():
    """Load .env file into os.environ."""
    env_path = Path(__file__).resolve().parent.parent / ".env"
    if env_path.exists():
        with open(env_path, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    os.environ.setdefault(key.strip(), val.strip())

# Load .env on import
_load_env()

class Settings:
    PROJECT_NAME: str = "PagerDuty Event Management Enhancement POC"

    @property
    def DATABASE_URL(self) -> str:
        return os.environ.get("DATABASE_URL", "sqlite:///./pagerduty_poc.db")

    @property
    def GEMINI_API_KEY(self) -> str:
        return os.environ.get("GEMINI_API_KEY", "")

    @property
    def PAGERDUTY_ROUTING_KEY(self) -> str:
        return os.environ.get("PAGERDUTY_ROUTING_KEY", "")

    @property
    def PAGERDUTY_API_TOKEN(self) -> str:
        return os.environ.get("PAGERDUTY_API_TOKEN", "")

    @property
    def DYNATRACE_TENANT_URL(self) -> str:
        return os.environ.get("DYNATRACE_TENANT_URL", "")

    @property
    def DYNATRACE_API_TOKEN(self) -> str:
        return os.environ.get("DYNATRACE_API_TOKEN", "")

    @property
    def DYNATRACE_POLLING_ENABLED(self) -> bool:
        return os.environ.get("DYNATRACE_POLLING_ENABLED", "false").lower() == "true"

    @property
    def OFFLINE_MODE(self) -> bool:
        return os.environ.get("OFFLINE_MODE", "true").lower() == "true"

    @property
    def INTEGRATION_MODE(self) -> str:
        # event_driven, polling, hybrid
        return os.environ.get("INTEGRATION_MODE", "event_driven")

    def set_integration_mode(self, mode: str):
        os.environ["INTEGRATION_MODE"] = mode

    SERVICENOW_MOCK_ENABLED: bool = True

settings = Settings()

