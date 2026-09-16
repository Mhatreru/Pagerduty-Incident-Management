# Synthetic US Insurance Data for Demo Claims Application

SYNTHETIC_POLICIES = [
    {
        "id": "POL-99102",
        "policyholder": "John Smith",
        "state": "TX",
        "type": "Auto",
        "premium": 150.00,
        "coverage_limit": 50000
    },
    {
        "id": "POL-88291",
        "policyholder": "Maria Garcia",
        "state": "FL",
        "type": "Home",
        "premium": 280.00,
        "coverage_limit": 250000
    },
    {
        "id": "POL-77382",
        "policyholder": "Robert Johnson",
        "state": "IL",
        "type": "Health",
        "premium": 420.00,
        "coverage_limit": 1000000
    },
    {
        "id": "POL-66471",
        "policyholder": "Patricia Williams",
        "state": "CA",
        "type": "Auto",
        "premium": 185.00,
        "coverage_limit": 100000
    },
    {
        "id": "POL-55562",
        "policyholder": "James Brown",
        "state": "NY",
        "type": "Home",
        "premium": 310.00,
        "coverage_limit": 350000
    }
]

SYNTHETIC_CLAIMS = [
    {
        "id": "CLM-40192",
        "policy_id": "POL-99102",
        "claimant": "John Smith",
        "state": "TX",
        "loss_type": "Auto Collision",
        "description": "Rear-end collision at intersection on I-35 Austin.",
        "estimated_cost": 4200.00,
        "status": "APPROVED"
    },
    {
        "id": "CLM-50281",
        "policy_id": "POL-88291",
        "claimant": "Maria Garcia",
        "state": "FL",
        "loss_type": "Wind & Hail Damage",
        "description": "Roof damage caused by high winds from tropical storm.",
        "estimated_cost": 12500.00,
        "status": "PROCESSING"
    },
    {
        "id": "CLM-60372",
        "policy_id": "POL-77382",
        "claimant": "Robert Johnson",
        "state": "IL",
        "loss_type": "Medical Claim",
        "description": "Inpatient knee arthroplasty surgery at Chicago Northwestern.",
        "estimated_cost": 28000.00,
        "status": "APPROVED"
    },
    {
        "id": "CLM-70461",
        "policy_id": "POL-66471",
        "claimant": "Patricia Williams",
        "state": "CA",
        "loss_type": "Comprehensive Theft",
        "description": "Catalytic converter theft from driveway overnight.",
        "estimated_cost": 1850.00,
        "status": "PENDING"
    }
]

SYNTHETIC_ADJUSTERS = [
    {
        "name": "Sarah Connor",
        "region": "South/Texas",
        "active_cases": 12
    },
    {
        "name": "Michael Chang",
        "region": "West/California",
        "active_cases": 8
    },
    {
        "name": "Emily Watson",
        "region": "East/New York",
        "active_cases": 15
    }
]
