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

# 1. Update incident #23 (id: 'Q18NRU07IKGEOA') status to acknowledged in PagerDuty
incident_id = 'Q18NRU07IKGEOA'
url = f'https://api.pagerduty.com/incidents/{incident_id}'

def update_status(status):
    payload = {
        'incident': {
            'type': 'incident',
            'status': status
        }
    }
    r = httpx.put(url, headers=headers, json=payload)
    if r.status_code == 200:
        print(f"Successfully set PagerDuty incident status to '{status}'")
        return True
    else:
        print(f"Failed to set status to '{status}': {r.status_code} - {r.text}")
        return False

# Step A: Acknowledge in PagerDuty
if not update_status('acknowledged'):
    sys.exit(1)

# Step B: Run sync endpoint immediately
time.sleep(2)
sync_r = httpx.post('http://localhost:8000/api/sync/pagerduty')
print("Sync Response (after ack):", json.dumps(sync_r.json(), indent=2))

# Step C: Resolve in PagerDuty
time.sleep(2)
if not update_status('resolved'):
    sys.exit(1)

# Step D: Run sync endpoint immediately
time.sleep(2)
sync_r2 = httpx.post('http://localhost:8000/api/sync/pagerduty')
print("Sync Response (after resolve):", json.dumps(sync_r2.json(), indent=2))
