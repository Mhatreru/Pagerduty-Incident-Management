# NEXUS — PagerDuty Event Management & Incident Intelligence Platform

> An enterprise-grade, event-driven Incident Intelligence, Event Correlation, AI-assisted Root Cause Analysis, and Controlled Automated Remediation platform.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6.svg)](https://www.typescriptlang.org/)
[![Python Tests](https://img.shields.io/badge/Tests-7%2F7%20Passing-brightgreen.svg)]()

---

## ⚡ Key Highlights & Capabilities

- **Canonical Event Gateway (`POST /api/v1/events`)**: Ingests, authenticates, and normalizes alerts from Dynatrace, Prometheus, Datadog, AWS, and custom sources into a standard v1.0 schema with SHA256 deduplication and regex suppression.
- **Topological Cascade Correlation**: Ingests 5 cascading alerts across a service dependency chain and consolidates them into **1 root cause P1 incident**, delivering an immediate **80% noise reduction**.
- **Dynamic Prioritization & Financial Blast Radius**: Computes P1–P4 priorities in real time by factoring in service criticality tiers, downstream dependencies, and estimated financial exposure ($/hr).
- **Gemini AI SRE Copilot**: Produces structured root cause analyses (RCA), confidence scores (0–100%), evidence checklists, and recommends tailored runbooks.
- **Controlled Automated Remediation**: Curated runbook catalog (`rb-db-pool-recovery`, `rb-scale-batch-workers`, etc.) featuring RBAC permissions, dry-run simulation, and human-in-the-loop approval gates for high-risk actions.
- **Bidirectional Ecosystem Sync**: Seamless integration with PagerDuty (Events API v2 & Webhooks), ServiceNow Incident Management, and multi-channel notifications (Slack / MS Teams).
- **High-Density NOC Operations Dashboard**: Built for enterprise command centers with zero unnecessary whole-page scrolling, real-time ReactFlow topology mapping, and an integrated Incident War Room.

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- Valid PagerDuty & Dynatrace credentials configured in `backend/.env`

### 2. Start the Backend API Server
```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*The database automatically seeds services, synthetic monitors, and suppression rules upon startup.*
- API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/api/v1/health/nexus](http://localhost:8000/api/v1/health/nexus)

### 3. Start the Frontend NOC Dashboard
```powershell
cd frontend
npm install
npm run dev
```
- Dashboard UI: [http://localhost:5173](http://localhost:5173)

### 4. Running the Automated Test Suite
```powershell
cd backend
.\venv\Scripts\python -m pytest app/tests/test_correlation.py -v
```

---

## 🖥️ Live POC Demonstration Scenarios

Use the **Simulation Bar** at the top of the dashboard:
1. **Trigger Cascade**: Emits 5 cascading alerts (`claims-database` -> `payment-processor` -> `auth-service` -> `api-gateway` -> `frontend-portal`).
   - Observe how NEXUS suppresses secondary noise and generates a single **P1 Critical Incident**.
   - Click the incident to open the **Major Incident War Room**.
   - Review the **Gemini AI Root Cause Analysis** and confidence score.
2. **Execute Remediation**:
   - Run a **Dry Run** to safely verify database connection pool thresholds.
   - Click **Approve & Execute** to apply the remediation runbook.
   - Observe the incident transitioning to `RESOLVED` and self-healing telemetry updating across the dashboard.
3. **Download Postmortem**: Click **Generate Postmortem** inside the War Room to inspect and download an automated Markdown post-incident review.

---

## 📚 Architecture & System Design
For comprehensive technical details, schema definitions, and sequence diagrams, refer to [ARCHITECTURE.md](./ARCHITECTURE.md).
