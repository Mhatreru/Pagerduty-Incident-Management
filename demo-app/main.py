import time
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List
from claims_data import SYNTHETIC_POLICIES, SYNTHETIC_CLAIMS, SYNTHETIC_ADJUSTERS

app = FastAPI(title="Demo Claims Processing Application")

@app.get("/")
def root():
    return {
        "application": "Demo Claims Processing Application",
        "description": "Monitored by Dynatrace OneAgent",
        "endpoints": {
            "GET /health": "Application health check",
            "GET /claims": "List all insurance claims",
            "GET /policies": "List all insurance policies",
            "GET /adjusters": "List all claims adjusters",
            "GET /demo/status": "Current simulation state",
            "POST /demo/database-latency/start": "Inject DB latency",
            "POST /demo/database-latency/stop": "Clear DB latency",
            "POST /demo/service-failure/start": "Inject service failure",
            "POST /demo/service-failure/stop": "Clear service failure"
        }
    }

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simulation states
simulation_state = {
    "database_latency_active": False,
    "service_failure_active": False
}

def simulate_latency_if_active():
    if simulation_state["database_latency_active"]:
        time.sleep(5.0)

def verify_service_health():
    if simulation_state["service_failure_active"]:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal Server Error: Database Connection Unavailable"
        )

@app.get("/health")
def get_health():
    verify_service_health()
    simulate_latency_if_active()
    return {"status": "healthy", "service": "claims-app"}

@app.get("/claims", response_model=List[Dict[str, Any]])
def get_claims():
    verify_service_health()
    simulate_latency_if_active()
    return SYNTHETIC_CLAIMS

@app.get("/claims/{claim_id}", response_model=Dict[str, Any])
def get_claim(claim_id: str):
    verify_service_health()
    simulate_latency_if_active()
    for claim in SYNTHETIC_CLAIMS:
        if claim["id"] == claim_id:
            return claim
    raise HTTPException(status_code=404, detail="Claim not found")

@app.post("/claims", response_model=Dict[str, Any])
def create_claim(claim: Dict[str, Any]):
    verify_service_health()
    simulate_latency_if_active()
    SYNTHETIC_CLAIMS.append(claim)
    return {"status": "created", "claim": claim}

@app.get("/policies/{policy_id}", response_model=Dict[str, Any])
def get_policy(policy_id: str):
    verify_service_health()
    simulate_latency_if_active()
    for policy in SYNTHETIC_POLICIES:
        if policy["id"] == policy_id:
            return policy
    raise HTTPException(status_code=404, detail="Policy not found")

@app.get("/adjusters", response_model=List[Dict[str, Any]])
def get_adjusters():
    verify_service_health()
    simulate_latency_if_active()
    return SYNTHETIC_ADJUSTERS

# --- SIMULATOR TOGGLES ---

@app.post("/demo/database-latency/start")
def start_database_latency():
    simulation_state["database_latency_active"] = True
    return {"status": "database latency active", "state": simulation_state}

@app.post("/demo/database-latency/stop")
def stop_database_latency():
    simulation_state["database_latency_active"] = False
    return {"status": "database latency cleared", "state": simulation_state}

@app.post("/demo/service-failure/start")
def start_service_failure():
    simulation_state["service_failure_active"] = True
    return {"status": "service failure active", "state": simulation_state}

@app.post("/demo/service-failure/stop")
def stop_service_failure():
    simulation_state["service_failure_active"] = False
    return {"status": "service failure cleared", "state": simulation_state}

@app.get("/demo/status")
def get_simulation_status():
    return simulation_state
