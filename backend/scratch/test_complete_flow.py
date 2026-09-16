import httpx
import json
import sys
import time

token = 'u+BTjbQLeQ6Dz1vCtuQA'
email = 'rugved-umesh.mhatre@capgemini.com'
headers = {
    'Authorization': f'Token token={token}',
    'Accept': 'application/vnd.pagerduty+json;version=2',
    'Content-Type': 'application/json',
    'From': email
}

# 1. Send Dynatrace alert to trigger new incident
# We append a random integer to ProblemID to prevent it from matching existing problems and getting deduplicated
import random
prob_id = f"dt-problem-{random.randint(100000, 999999)}"

trigger_payload = {
    "ProblemID": prob_id,
    "ProblemTitle": "Claims Database Failure Connection Spiked",
    "State": "OPEN",
    "ImpactedEntity": "claims-database",
    "ProblemSeverity": "CRITICAL",
    "Message": f"Dynatrace Problem {prob_id}: Connection latency spiked to 9200ms"
}

print(f"Step 1: Sending Dynatrace trigger alert with ProblemID: {prob_id}...")
r = httpx.post('http://localhost:8000/api/alerts/dynatrace', json=trigger_payload, timeout=10.0)
if r.status_code != 200:
    print(f"Failed to trigger alert: {r.status_code} - {r.text}")
    sys.exit(1)

trigger_data = r.json()
incident_id = trigger_data.get("incident_id")
initial_pd_id = trigger_data.get("pagerduty_id")
print(f"Created local Incident #{incident_id} with initial pagerduty_id: {initial_pd_id}")

# 2. Wait for PagerDuty to create the incident and for us to find it in active list
print("\nStep 2: Waiting 7 seconds for PagerDuty to index...")
time.sleep(7)

# 3. Call sync to bind the PagerDuty Incident ID
print("Step 3: Triggering NEXUS sync to bind PagerDuty Incident ID...")
sync_r = httpx.post('http://localhost:8000/api/sync/pagerduty')
sync_data = sync_r.json()
print("Sync Response:", json.dumps(sync_data, indent=2))

# Fetch updated local incident to verify binding format
db_incident_r = httpx.get('http://localhost:8000/api/incidents')
db_incident = [inc for inc in db_incident_r.json() if inc.get("id") == incident_id][0]
bound_pd_id = db_incident.get("pagerduty_id")
print(f"Updated local Incident #{incident_id} pagerduty_id: {bound_pd_id}")

if ":" not in bound_pd_id:
    print("Error: PagerDuty Incident ID was not bound via colon splitting!")
    sys.exit(1)

pd_incident_id = bound_pd_id.split(":")[1]
print(f"Extracted PagerDuty Incident ID: {pd_incident_id}")

# 4. Acknowledge in PagerDuty
print(f"\nStep 4: Setting PagerDuty incident {pd_incident_id} to 'acknowledged'...")
pd_url = f'https://api.pagerduty.com/incidents/{pd_incident_id}'
payload = {
    'incident': {
        'type': 'incident',
        'status': 'acknowledged'
    }
}
r = httpx.put(pd_url, headers=headers, json=payload)
if r.status_code != 200:
    print(f"Failed to set status to acknowledged: {r.status_code} - {r.text}")
    sys.exit(1)
print("Successfully acknowledged in PagerDuty.")

# 5. Call sync to verify state transitions to ACKNOWLEDGED
print("Step 5: Triggering NEXUS sync to verify ACKNOWLEDGED state...")
time.sleep(2)
sync_r = httpx.post('http://localhost:8000/api/sync/pagerduty')
print("Sync Response:", json.dumps(sync_r.json(), indent=2))

# 6. Resolve in PagerDuty
print(f"\nStep 6: Setting PagerDuty incident {pd_incident_id} to 'resolved'...")
payload['incident']['status'] = 'resolved'
r = httpx.put(pd_url, headers=headers, json=payload)
if r.status_code != 200:
    print(f"Failed to set status to resolved: {r.status_code} - {r.text}")
    sys.exit(1)
print("Successfully resolved in PagerDuty.")

# 7. Call sync to verify state transitions to RESOLVED
print("Step 7: Triggering NEXUS sync to verify RESOLVED state...")
time.sleep(2)
sync_r = httpx.post('http://localhost:8000/api/sync/pagerduty')
print("Sync Response:", json.dumps(sync_r.json(), indent=2))

# 8. Check final DB state
db_incident_r = httpx.get('http://localhost:8000/api/incidents')
db_incident = [inc for inc in db_incident_r.json() if inc.get("id") == incident_id][0]
print(f"\nFinal Local Incident #{incident_id} Status: {db_incident.get('status')}")
if db_incident.get('status') == "RESOLVED":
    print("🎉 SUCCESS! Bidirectional status sync test passed completely!")
else:
    print("❌ Failed: status was not resolved locally.")
    sys.exit(1)
