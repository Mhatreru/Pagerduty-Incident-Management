import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, PageBreak, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        canvas.Canvas.__init__(self, *args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(40, 36, letter[0] - 40, 36)
        
        self.drawString(40, 24, "NEXUS Autonomous Remediation Platform — 10-Minute In-Depth Demo Script")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(letter[0] - 40, 24, page_str)
        self.restoreState()

def build_pdf():
    pdf_path = "NEXUS_10_MINUTE_COMPREHENSIVE_DEMO_SCRIPT.pdf"
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=46
    )

    styles = getSampleStyleSheet()

    header_title_style = ParagraphStyle(
        'HeaderTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=17,
        leading=21,
        textColor=colors.HexColor("#ffffff")
    )
    header_sub_style = ParagraphStyle(
        'HeaderSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#94a3b8")
    )
    badge_style = ParagraphStyle(
        'HeaderBadge',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9,
        textColor=colors.HexColor("#ffffff")
    )
    meta_label_style = ParagraphStyle(
        'MetaLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9,
        textColor=colors.HexColor("#94a3b8")
    )
    meta_val_style = ParagraphStyle(
        'MetaVal',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#38bdf8")
    )

    act_header_style = ParagraphStyle(
        'ActHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=13.5,
        textColor=colors.HexColor("#0f172a")
    )
    time_badge_style = ParagraphStyle(
        'TimeBadge',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#4338ca"),
        alignment=2
    )
    action_style = ParagraphStyle(
        'ActionStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#0369a1")
    )
    speech_style = ParagraphStyle(
        'SpeechStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor("#1e293b")
    )
    tech_under_hood_style = ParagraphStyle(
        'TechUnderHood',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11.5,
        textColor=colors.HexColor("#475569")
    )
    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#334155")
    )
    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#ffffff")
    )

    story = []

    # 1. HEADER BANNER
    badge_p = Paragraph("<font color='#a5b4fc'>FULL ARCHITECTURE & FUNCTIONAL WALKTHROUGH</font>", badge_style)
    title_p = Paragraph("NEXUS Autonomous Remediation Platform", header_title_style)
    sub_p = Paragraph("10-Minute Comprehensive Demo Script • Every Function & Underlying Mechanism Explained", header_sub_style)

    meta_cells = [
        [
            Paragraph("TARGET APPLICATION", meta_label_style),
            Paragraph("APM ENGINE", meta_label_style),
            Paragraph("ON-CALL ROSTER", meta_label_style),
            Paragraph("BUSINESS IMPACT", meta_label_style)
        ],
        [
            Paragraph("Farmers Quoting Hub", meta_val_style),
            Paragraph("Dynatrace Synthetic", meta_val_style),
            Paragraph("Rugved, Samruddhi, Aarzoo", meta_val_style),
            Paragraph("MTTR: 45m ➔ 3.8m (92% cut)", meta_val_style)
        ]
    ]
    meta_table = Table(meta_cells, colWidths=[125, 125, 150, 140])
    meta_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))

    header_table_data = [
        [badge_p],
        [title_p],
        [sub_p],
        [Spacer(1, 4)],
        [meta_table]
    ]
    header_table = Table(header_table_data, colWidths=[540])
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#0f172a")),
        ('ROUNDEDCORNERS', [8, 8, 8, 8]),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 14),
        ('RIGHTPADDING', (0,0), (-1,-1), 14),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 8))

    # 2. 10-MINUTE ROADMAP TABLE
    t_headers = [
        Paragraph("Timestamp", table_header_style),
        Paragraph("Functional Area", table_header_style),
        Paragraph("Detailed Functional Scope & Mechanism", table_header_style)
    ]
    t_rows = [
        [
            Paragraph("<b>0:00 – 1:30</b>", table_cell_style),
            Paragraph("<b>Stage 0: Overview Cockpit</b><br/>(<code>/</code>)", table_cell_style),
            Paragraph("Explain the SRE Cockpit: 4-stage lifecycle pipeline, 6 microservices health cards, tier classification, SLA tracking, and why traditional NOC monitoring breaks down during storms.", table_cell_style)
        ],
        [
            Paragraph("<b>1:30 – 3:00</b>", table_cell_style),
            Paragraph("<b>Stage 1: Dynatrace APM</b><br/>(<code>/monitoring</code>)", table_cell_style),
            Paragraph("Explain the Dynatrace Synthetic probe: HTTP Monitor ID <code>HTTP_MONITOR-06513F5EBB018508</code>, Farmers Intelligent Quoting Hub live URL, 4 core KPI tiles (Status, Availability, N. Virginia location, 357ms performance), and granular network telemetry (DNS, TCP, TLS, TTFB).", table_cell_style)
        ],
        [
            Paragraph("<b>3:00 – 4:15</b>", table_cell_style),
            Paragraph("<b>Fault Injection & Correlation</b><br/>(Simulation Bar)", table_cell_style),
            Paragraph("Explain the chaos engine: triggering connection pool starvation. Show the cascade across upstream services and explain how <code>correlation.py</code> compresses 12 raw telemetry alerts into 1 incident (92% noise reduction) with dynamic deduplication keys.", table_cell_style)
        ],
        [
            Paragraph("<b>4:15 – 6:00</b>", table_cell_style),
            Paragraph("<b>Stage 2: Gemini AI War Room</b><br/>(<code>/incidents</code>)", table_cell_style),
            Paragraph("Explain the AI diagnostic pipeline: plain-text root cause analysis (sanitized of asterisk markdown), financial impact modeling (,500/min risk), automated runbook mapping (<code>rb-db-pool-recovery</code>), and the 'Simulate Dry Run' engine that verifies DB locks and blast radius safety.", table_cell_style)
        ],
        [
            Paragraph("<b>6:00 – 7:30</b>", table_cell_style),
            Paragraph("<b>Stage 3: PagerDuty On-Call</b><br/>(<code>/incident-response</code>)", table_cell_style),
            Paragraph("Explain the incident response dispatch: Tier 1 Primary (Rugved Mhatre via Push & SMS), multi-level escalation policy ladder (Samruddhi Kakade, Aarzoo Sharma), automated ServiceNow CMDB ticket generation (INC0089241), and bi-directional acknowledgment sync.", table_cell_style)
        ],
        [
            Paragraph("<b>7:30 – 9:00</b>", table_cell_style),
            Paragraph("<b>Stage 4: Automated Recovery</b><br/>(Remediation Engine)", table_cell_style),
            Paragraph("Explain human-in-the-loop execution: clicking 'Approve & Execute Remediation'. Detail the 3 underlying remediation steps (kill zombie connections, scale pool, health check) and the dual-channel synchronous PagerDuty resolution (Events API v2 + REST API PUT).", table_cell_style)
        ],
        [
            Paragraph("<b>9:00 – 10:00</b>", table_cell_style),
            Paragraph("<b>Audit, Postmortem & ROI</b><br/>(<code>/audit</code> & Wrap-Up)", table_cell_style),
            Paragraph("Explain governance & traceability: cryptographically auditable runbook logs, automated postmortem generation, and macro business ROI (MTTR dropped from 45 min to under 4 min, zero manual ticketing).", table_cell_style)
        ]
    ]
    summary_table = Table([t_headers] + t_rows, colWidths=[75, 140, 325])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1e293b")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#ffffff"), colors.HexColor("#f8fafc")]),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 8))

    def make_detailed_act_box(title, time_str, action_text, speech_text, tech_text):
        h_row = [
            Paragraph(f"<b>{title}</b>", act_header_style),
            Paragraph(f"<b>{time_str}</b>", time_badge_style)
        ]
        h_table = Table([h_row], colWidths=[380, 140])
        h_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f1f5f9")),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMBORDER', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
        ]))

        action_p = Paragraph(f"<b>Interactive On-Screen Flow:</b> {action_text}", action_style)
        action_table = Table([[action_p]], colWidths=[524])
        action_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f0f9ff")),
            ('LINELEFT', (0,0), (0,-1), 2.5, colors.HexColor("#0284c7")),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))

        speech_p = Paragraph(f"<b>What to Say (Verbatim Narrative):</b> \"{speech_text}\"", speech_style)
        
        tech_p = Paragraph(f"<b>Under the Hood (Technical Architecture Explanation):</b> {tech_text}", tech_under_hood_style)
        tech_table = Table([[tech_p]], colWidths=[524])
        tech_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
            ('LINELEFT', (0,0), (0,-1), 2, colors.HexColor("#64748b")),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))

        content_table = Table([[action_table], [Spacer(1, 3)], [speech_p], [Spacer(1, 4)], [tech_table]], colWidths=[524])
        content_table.setStyle(TableStyle([
            ('TOPPADDING', (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,0), (-1,-1), 0),
            ('LEFTPADDING', (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ]))

        wrapper = Table([[h_table], [content_table]], colWidths=[540])
        wrapper.setStyle(TableStyle([
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
            ('BACKGROUND', (0,1), (-1,-1), colors.HexColor("#ffffff")),
            ('TOPPADDING', (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,1), (-1,-1), 6),
            ('LEFTPADDING', (0,1), (-1,-1), 8),
            ('RIGHTPADDING', (0,1), (-1,-1), 8),
        ]))
        return KeepTogether([wrapper, Spacer(1, 8)])

    # ACT 1
    story.append(make_detailed_act_box(
        "Act I: SRE Cockpit & Microservices Health Matrix",
        "0:00 – 1:30 (90s)",
        "Open <b>http://127.0.0.1:5173/</b>. Point cursor to: 1) System Health Gauge (100%), 2) The 4-Stage Lifecycle Flow Tracker, and 3) The Microservices Grid below.",
        "Good morning team. In modern distributed cloud architectures, when an infrastructure bottleneck occurs, operations teams face three critical failures: alert fatigue from hundreds of raw alerts, prolonged Mean Time to Identify while engineers manually read logs, and execution delays while waiting for human runbook approval.<br/><br/>"
        "This is <b>NEXUS</b>: an Autonomous Incident Remediation Platform that connects <b>Dynatrace APM</b>, <b>Google Gemini AI</b>, and <b>PagerDuty</b> into a self-healing operational loop.<br/><br/>"
        "Notice our cockpit layout: across the center is our <b>4-Stage Lifecycle Flow Tracker</b>: Deep Observability, AI Correlation & War Room, Incident Response & On-Call, and Automated Runbook Recovery. Below it, our <b>Microservices Matrix</b> monitors our 6 core services: Claims Database, API Gateway, Policy Engine, Auth Service, and Payment Processor, tracking real-time latency and SLA adherence.",
        "<b>Cockpit Architecture:</b> The frontend polls <code>/api/services</code> and <code>/api/analytics</code> via WebSocket and React state. Each service tile dynamically tracks SLA (99.9% target), response latency in ms, error percentages, and dependencies in the directed acyclic graph (DAG)."
    ))

    # ACT 2
    story.append(make_detailed_act_box(
        "Act II: Dynatrace APM Deep Observability & Synthetic Probes",
        "1:30 – 3:00 (90s)",
        "Click <b>'Stage 1: Dynatrace APM'</b> in the sidebar. Highlight the top monitor card: <b>NEXUS POC - Claims Portal</b>, click the bracketed link: <code>([Farmers Intelligent Quoting Hub])</code> in a new tab, and explain the 4 KPI tiles.",
        "Let's step into <b>Stage 1: Deep Observability</b> powered by <b>Dynatrace APM</b>.<br/><br/>"
        "Rather than using synthetic mock data, NEXUS is connected directly to an active Dynatrace HTTP Synthetic Monitor: <b>NEXUS POC - Claims Portal</b> (Monitor ID: <code>HTTP_MONITOR-06513F5EBB018508</code>). Below the title, you can see our direct link to the live production target: the <b>Farmers Intelligent Quoting Hub</b>.<br/><br/>"
        "Look at our 4 core Dynatrace KPI tiles: <b>Last Status: Success</b>, <b>Availability: 100%</b>, <b>Location: 1 probe in N. Virginia</b> running every 60 seconds, and <b>Performance: 357 milliseconds</b> baseline. Beneath these tiles is our granular network breakdown: 14ms DNS lookup, 28ms TCP handshake, 38ms TLS negotiation, and 277ms Time-To-First-Byte (TTFB). Synthetic monitors serve as our critical canary—detecting end-user degradation before users even report it.",
        "<b>APM Telemetry Pipeline:</b> The backend <code>dynatrace.py</code> connector integrates with the Dynatrace Environment API v2. When healthy, probes register 200 OK responses with sub-second latency. When latency exceeds thresholds, Dynatrace emits event anomalies that stream into NEXUS."
    ))

    # Page Break for Clean Layout
    story.append(PageBreak())

    # ACT 3
    story.append(make_detailed_act_box(
        "Act III: Outage Fault Injection & Event Storm Correlation",
        "3:00 – 4:15 (75s)",
        "In the top Simulation Bar, click <b>'DB Connection Pool Exhaustion'</b>. Show the latency jumping to 4,000+ ms, the status turning CRITICAL, and the raw alert feed filling with 12 alerts.",
        "Now, let's trigger a realistic enterprise disaster. I will click <b>'DB Connection Pool Exhaustion'</b> on our claims database.<br/><br/>"
        "Immediately, look at what happens: our Dynatrace Synthetic Monitor fails, latency spikes from 357ms to over <b>4,200ms</b>, and cascading timeouts explode across the Claims API, Payment Gateway, and Customer Portal.<br/><br/>"
        "In a conventional NOC, this triggers an <b>Event Storm</b>: 12 to 15 distinct alerts firing simultaneously across monitoring tools, paging 3 different on-call engineers.<br/><br/>"
        "Watch how NEXUS handles this: our event correlation engine (<code>correlation.py</code>) instantly captures all incoming alerts, clusters them by topology dependency and time window, and delivers <b>92% noise reduction</b>. Instead of 12 distinct tickets, NEXUS opens exactly ONE correlated master incident linked to the true root cause: <b>claims-database</b>.",
        "<b>Deduplication Engine:</b> <code>correlation.py</code> calculates topological distance using BFS over the microservice graph. Alerts within a 60-second window are correlated into an existing incident using a unique timestamped key (<code>nexus-{service}-{timestamp}</code>), preventing duplicate spam."
    ))

    # ACT 4
    story.append(make_detailed_act_box(
        "Act IV: Gemini AI Incident War Room & Dry-Run Safety Engine",
        "4:15 – 6:00 (105s)",
        "Click <b>'Stage 2: Incident Management'</b>. Open the active CRITICAL incident card. Walk through: 1) Gemini AI Analysis, 2) Business Impact calculation, and 3) Click <b>'Simulate Dry Run'</b>.",
        "Now let's enter <b>Stage 2: AI Correlation & Incident War Room</b>.<br/><br/>"
        "When an incident triggers, our embedded <b>Google Gemini AI Copilot</b> automatically ingests the error logs, topology, and stack traces. Notice the output: it provides a clean, executive-ready explanation of the failure mechanism without clutter or formatting asterisks.<br/><br/>"
        "Gemini accomplishes three crucial tasks here:<br/>"
        "1. <b>Root Cause Diagnosis:</b> It identifies that active connections have reached 100/100 capacity with 45 queries waiting in queue due to unindexed lookups.<br/>"
        "2. <b>Financial & Blast Radius Calculation:</b> It calculates business impact: 1,420 affected policyholders, 4 critical downstream services degraded, and an estimated revenue risk of <b>,500 per minute</b>.<br/>"
        "3. <b>Runbook Recommendation:</b> It scans our operational runbook registry and pre-stages the exact remediation script: <code>rb-db-pool-recovery</code>.<br/><br/>"
        "Before touching production, safety is paramount. Watch as I click <b>'Simulate Dry Run'</b>. NEXUS executes non-destructive verification: validating DB read-locks, verifying pool memory overhead, and confirming zero data loss risk before any live execution.",
        "<b>Gemini Copilot Architecture:</b> <code>gemini_service.py</code> formats prompt context with system metrics, calls the Gemini model, and programmatically strips markdown asterisks for clean rendering. The dry-run engine checks connection limits against maximum safe thresholds."
    ))

    # ACT 5
    story.append(make_detailed_act_box(
        "Act V: PagerDuty Live Mobilization & Bi-Directional Sync",
        "6:00 – 7:30 (90s)",
        "Click <b>'Stage 3: Incident Response'</b> in sidebar. Point out Tier 1 Primary: <b>Rugved Mhatre</b>, Escalation Ladder (Samruddhi, Aarzoo), and the active P1 incident. Click <b>'Acknowledge'</b>.",
        "While AI was analyzing the problem, how was the human team mobilized? Let's navigate to <b>Stage 3: Incident Response</b>.<br/><br/>"
        "NEXUS pushed a high-urgency incident to <b>PagerDuty Events API v2</b>. Look at our on-call roster: <b>Rugved Mhatre</b>, our Tier 1 Core SRE Lead, was paged via mobile push and SMS notification. Standing by on our escalation policy ladder are <b>Samruddhi Kakade</b> at Level 2 (+15m) and <b>Aarzoo Sharma</b> at Level 3 (+30m).<br/><br/>"
        "Simultaneously, an enterprise IT ticket—<b>INC0089241</b>—was automatically created in <b>ServiceNow</b> with full CMDB asset mapping.<br/><br/>"
        "Now watch this: when Rugved clicks <b>'Acknowledge'</b> on screen (or taps acknowledge on the PagerDuty mobile app), NEXUS bi-directional sync immediately updates the incident status to ACKNOWLEDGED in both NEXUS and PagerDuty within seconds.",
        "<b>PagerDuty Sync Engine:</b> <code>pd_service.py</code> manages bi-directional synchronization. It maps internal incidents to PagerDuty dedup keys and incident IDs, polling every 15s and syncing acknowledgments and notes directly into PagerDuty's REST API."
    ))

    # Page Break for Clean Layout
    story.append(PageBreak())

    # ACT 6
    story.append(make_detailed_act_box(
        "Act VI: Automated Runbook Execution & Dual-Channel Auto-Resolve",
        "7:30 – 9:00 (90s)",
        "Return to Incident Modal (or War Room). Click green button: <b>'Approve & Execute Remediation'</b>. Watch the 3-step progress bar execute. Show incident turning to RESOLVED and services turning green.",
        "Now comes the most powerful capability of the platform: <b>Automated Remediation with Human-in-the-Loop Governance</b>.<br/><br/>"
        "Rather than leaving automation completely unguided, NEXUS requires an authorized SRE to approve execution. I will click <b>'Approve & Execute Remediation'</b>.<br/><br/>"
        "Watch the 3 automated remediation phases execute live:<br/>"
        "1. <b>Step 1: Drain & Terminate:</b> Safely kills zombie transactions and idle connections older than 30 seconds.<br/>"
        "2. <b>Step 2: Dynamic Pool Scaling:</b> Expands max pool size from 100 to 250 connections with zero container restarts.<br/>"
        "3. <b>Step 3: Synthetic Health Verification:</b> Probes the database endpoint to verify active response times.<br/><br/>"
        "Notice the resolution: the incident immediately transitions to <b>RESOLVED</b>. And here is our critical integration: NEXUS triggers a <b>dual-channel synchronous auto-resolution</b>—sending a resolve event to PagerDuty Events API v2 AND a direct REST API PUT to <code>/incidents/{id}</code>. Pagers are silenced, ServiceNow tickets close, and Dynatrace returns to 100% availability.",
        "<b>Dual-Channel Resolution Engine:</b> Implemented in <code>remediation_engine.py</code> and <code>pd_service.py</code> (<code>resolve_incident_everywhere</code>). It executes OS/database runbook steps, logs execution outputs, and guarantees synchronous PagerDuty resolution across both API channels."
    ))

    # ACT 7
    story.append(make_detailed_act_box(
        "Act VII: Audit Trail, Postmortem Generation & Business ROI",
        "9:00 – 10:00 (60s)",
        "Click <b>'Audit Trail'</b> or return to <b>Overview Cockpit</b>. Point to: 1) Cryptographic audit log entry, 2) Zero active outages, and 3) 3.8 min MTTR.",
        "To conclude our demonstration, let's look at post-incident governance.<br/><br/>"
        "In enterprise environments, automation must be 100% auditable. In our <b>Audit Trail</b>, every single action—who was paged, when dry-run was simulated, who clicked approve, and the raw terminal outputs of each runbook step—is immutably recorded for compliance.<br/><br/>"
        "Furthermore, Gemini AI automatically drafted a standardized postmortem report including timeline, root cause, and follow-up preventative action items.<br/><br/>"
        "Let's review the business results:<br/>"
        "• <b>92% Alert Noise Reduction:</b> 12 noisy alerts compressed to 1 actionable incident.<br/>"
        "• <b>Zero Manual Ticketing Toil:</b> Bi-directional PagerDuty and ServiceNow synchronization.<br/>"
        "• <b>MTTR Slashed by 91%:</b> Mean Time to Resolution dropped from a 45-minute manual war room down to <b>under 4 minutes of automated self-healing</b>.<br/><br/>"
        "Thank you very much. I welcome any questions or technical deep dives.",
        "<b>Governance & Compliance:</b> All audit events are stored with ISO timestamps and user IDs. The postmortem engine compiles telemetry windows into a Markdown/PDF postmortem ready for SRE retrospective reviews."
    ))

    # SPEAKER TIPS BOX
    tip_text = Paragraph(
        "<b>💡 Executive Presenter Guidelines (10-Minute Pacing):</b><br/>"
        "• <b>Don't Rush the Explanations:</b> Spend full time explaining <i>why</i> Dynatrace Synthetic monitoring is better than simple ping checks, and <i>why</i> dual-channel PagerDuty resolution matters.<br/>"
        "• <b>Highlight Human-in-the-Loop:</b> Enterprise leaders love AI automation, but fear unguided changes. Emphasize that NEXUS requires human approval and executes safe dry-runs first.<br/>"
        "• <b>Team Personalization:</b> Pointing out Rugved Mhatre, Samruddhi Kakade, and Aarzoo Sharma demonstrates a real, production-ready on-call rota rather than an abstract demo.",
        ParagraphStyle(
            'TipStyle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8,
            leading=11.5,
            textColor=colors.HexColor("#78350f")
        )
    )
    tip_table = Table([[tip_text]], colWidths=[540])
    tip_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#fffbeb")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#fef3c7")),
        ('LINELEFT', (0,0), (0,-1), 3, colors.HexColor("#f59e0b")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(KeepTogether([tip_table]))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Comprehensive 10-Min PDF created successfully at: {os.path.abspath(pdf_path)}")

if __name__ == '__main__':
    build_pdf()
