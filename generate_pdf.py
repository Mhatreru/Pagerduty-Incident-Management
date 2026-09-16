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
        
        # Footer text
        self.drawString(40, 24, "NEXUS Autonomous Remediation Platform — 7-Minute Executive Demo Script")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(letter[0] - 40, 24, page_str)
        self.restoreState()

def build_pdf():
    pdf_path = "NEXUS_7_MINUTE_DEMO_SCRIPT.pdf"
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=38,
        rightMargin=38,
        topMargin=38,
        bottomMargin=48
    )

    styles = getSampleStyleSheet()

    # Custom styles
    header_title_style = ParagraphStyle(
        'HeaderTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#ffffff"),
        alignment=0
    )
    header_sub_style = ParagraphStyle(
        'HeaderSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor("#94a3b8"),
        alignment=0
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
        fontSize=11,
        leading=14,
        textColor=colors.HexColor("#0f172a")
    )
    time_badge_style = ParagraphStyle(
        'TimeBadge',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
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
        fontSize=9,
        leading=13.5,
        textColor=colors.HexColor("#1e293b")
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
    badge_p = Paragraph("<font color='#a5b4fc'>EXECUTIVE SRE DEMO GUIDE</font>", badge_style)
    title_p = Paragraph("NEXUS Autonomous Remediation Platform", header_title_style)
    sub_p = Paragraph("7-Minute High-Impact Script • Dynatrace APM, Gemini AI & PagerDuty Integration", header_sub_style)

    meta_cells = [
        [
            Paragraph("TARGET APPLICATION", meta_label_style),
            Paragraph("APM MONITOR", meta_label_style),
            Paragraph("ON-CALL ROSTER", meta_label_style),
            Paragraph("TARGET MTTR", meta_label_style)
        ],
        [
            Paragraph("Farmers Quoting Hub", meta_val_style),
            Paragraph("Dynatrace Synthetic", meta_val_style),
            Paragraph("Rugved, Samruddhi, Aarzoo", meta_val_style),
            Paragraph("&lt; 4.0 Minutes (92% faster)", meta_val_style)
        ]
    ]
    meta_table = Table(meta_cells, colWidths=[125, 125, 150, 130])
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
    header_table = Table(header_table_data, colWidths=[536])
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#0f172a")),
        ('ROUNDEDCORNERS', [8, 8, 8, 8]),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 14),
        ('RIGHTPADDING', (0,0), (-1,-1), 14),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 10))

    # 2. TIMELINE ROADMAP TABLE
    t_headers = [
        Paragraph("Timestamp", table_header_style),
        Paragraph("Platform Area", table_header_style),
        Paragraph("Key Executive Takeaway", table_header_style)
    ]
    t_rows = [
        [
            Paragraph("<b>0:00 – 1:00</b>", table_cell_style),
            Paragraph("Stage 0: Overview Cockpit", table_cell_style),
            Paragraph("Alert fatigue crisis & 4-stage closed-loop architecture", table_cell_style)
        ],
        [
            Paragraph("<b>1:00 – 2:15</b>", table_cell_style),
            Paragraph("Stage 1: Dynatrace APM", table_cell_style),
            Paragraph("Real Synthetic probe on Farmers Quoting Hub (357ms baseline, 100% SLA)", table_cell_style)
        ],
        [
            Paragraph("<b>2:15 – 3:30</b>", table_cell_style),
            Paragraph("Fault Simulation Bar", table_cell_style),
            Paragraph("DB connection exhaustion; event storm compressed 12 alerts ➔ 1 incident (92% noise cut)", table_cell_style)
        ],
        [
            Paragraph("<b>3:30 – 4:45</b>", table_cell_style),
            Paragraph("Stage 2: AI War Room", table_cell_style),
            Paragraph("Gemini AI diagnosis, blast radius estimation, and dry-run safety validation", table_cell_style)
        ],
        [
            Paragraph("<b>4:45 – 5:45</b>", table_cell_style),
            Paragraph("Stage 3: PagerDuty Dispatch", table_cell_style),
            Paragraph("Push/SMS to Rugved Mhatre (Tier 1), escalation path, and instant acknowledgment", table_cell_style)
        ],
        [
            Paragraph("<b>5:45 – 6:45</b>", table_cell_style),
            Paragraph("Stage 4: Automated Recovery", table_cell_style),
            Paragraph("1-click runbook execution; synchronous dual-channel PagerDuty auto-resolution", table_cell_style)
        ],
        [
            Paragraph("<b>6:45 – 7:15</b>", table_cell_style),
            Paragraph("Executive Wrap-Up", table_cell_style),
            Paragraph("MTTR slashed from 45m to &lt;4m; zero manual toil or ticket logging", table_cell_style)
        ]
    ]
    summary_table = Table([t_headers] + t_rows, colWidths=[80, 140, 316])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1e293b")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#ffffff"), colors.HexColor("#f8fafc")]),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 10))

    def make_act_box(title, time_str, action_text, speech_text):
        h_row = [
            Paragraph(f"<b>{title}</b>", act_header_style),
            Paragraph(f"<b>{time_str}</b>", time_badge_style)
        ]
        h_table = Table([h_row], colWidths=[380, 140])
        h_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f1f5f9")),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMBORDER', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
        ]))

        action_p = Paragraph(f"<b>On-Screen Action:</b> {action_text}", action_style)
        action_table = Table([[action_p]], colWidths=[520])
        action_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f0f9ff")),
            ('LINELEFT', (0,0), (0,-1), 2.5, colors.HexColor("#0284c7")),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))

        speech_p = Paragraph(f"<b>What to Say:</b> \"{speech_text}\"", speech_style)
        content_table = Table([[action_table], [Spacer(1, 4)], [speech_p]], colWidths=[520])
        content_table.setStyle(TableStyle([
            ('TOPPADDING', (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,0), (-1,-1), 0),
            ('LEFTPADDING', (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ]))

        wrapper = Table([[h_table], [content_table]], colWidths=[536])
        wrapper.setStyle(TableStyle([
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
            ('BACKGROUND', (0,1), (-1,-1), colors.HexColor("#ffffff")),
            ('TOPPADDING', (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,1), (-1,-1), 8),
            ('LEFTPADDING', (0,1), (-1,-1), 8),
            ('RIGHTPADDING', (0,1), (-1,-1), 8),
        ]))
        return KeepTogether([wrapper, Spacer(1, 8)])

    # ACT 1
    story.append(make_act_box(
        "Act I: The Hook & Overview Cockpit",
        "0:00 – 1:00 (60s)",
        "Open <b>http://127.0.0.1:5173/</b>. Point cursor at the 4-Stage Lifecycle Flow Tracker across the center.",
        "Good morning team. During an enterprise outage today, SREs face alert fatigue from hundreds of duplicate alerts, high MTTR manually parsing logs, and delayed runbook execution. This is <b>NEXUS</b>—an Autonomous Incident Remediation Platform connecting <b>Dynatrace APM</b>, <b>Gemini AI</b>, and <b>PagerDuty</b> into a self-healing loop. Notice our 4-stage flow tracker on screen: Deep Observability, AI Correlation, Incident Response, and Automated Recovery. Let's see the system in healthy steady-state."
    ))

    # ACT 2
    story.append(make_act_box(
        "Act II: Dynatrace APM & Synthetic Probes",
        "1:00 – 2:15 (75s)",
        "Click <b>'Stage 1: Dynatrace APM'</b> in sidebar. Hover over <b>NEXUS POC - Claims Portal</b> and the <b>([Farmers Intelligent Quoting Hub])</b> link. Highlight 4 tiles: 357ms, 100% Availability.",
        "Here in Stage 1, NEXUS integrates with our enterprise APM, <b>Dynatrace</b>. Rather than mocking data, this is connected to an active Dynatrace HTTP Synthetic Monitor probing our live target application—the <b>Farmers Intelligent Quoting Hub</b>. You can see our baseline: 100% availability, probing every minute from N. Virginia with a clean response time of 357ms. Now, let's inject a realistic production failure."
    ))

    # Page break for clean flow
    story.append(PageBreak())

    # ACT 3
    story.append(make_act_box(
        "Act III: Outage Injection & Noise Correlation",
        "2:15 – 3:30 (75s)",
        "In top simulation bar, click <b>'DB Connection Pool Exhaustion'</b>. Show latency spiking past 4,000ms and the live event storm of 12 incoming alerts.",
        "I've simulated a critical failure: Database Connection Pool Exhaustion on our claims database. Immediately, synthetic probes fail, latency jumps past 4,000 ms, and cascading alerts fire across payment and portal gateways. In standard operations, this triggers 15 disparate alerts and wakes up multiple teams. NEXUS instantly deduplicates this event storm with <b>92% noise reduction</b>, correlating all downstream symptoms to the single root cause."
    ))

    # ACT 4
    story.append(make_act_box(
        "Act IV: Gemini AI War Room & Dry-Run Simulation",
        "3:30 – 4:45 (75s)",
        "Click <b>'Stage 2: Incident Management'</b>. Click the active CRITICAL card to open the <b>AI Incident Modal</b>. Click <b>'Simulate Dry Run'</b> and observe the live safety checks passing.",
        "Inside the Incident War Room, our embedded <b>Gemini AI Copilot</b> analyzed the telemetry in real time. It generated an executive summary of the root failure, quantified financial and SLA blast-radius, and matched the approved recovery runbook: <b>rb-db-pool-recovery</b>. Before modifying production, the engineer clicks <b>Simulate Dry Run</b>. As shown on screen, NEXUS validates database locks, connection overhead, and blast-radius safety in advance."
    ))

    # ACT 5
    story.append(make_act_box(
        "Act V: PagerDuty Live Mobilization & Acknowledgment",
        "4:45 – 5:45 (60s)",
        "Click <b>'Stage 3: Incident Response'</b>. Point out Tier 1 Primary: <b>Rugved Mhatre</b>, Escalation Ladder (Samruddhi, Aarzoo), and active P1 incident. Click <b>'Acknowledge'</b>.",
        "Now let's examine on-call response. NEXUS enqueued a high-urgency event to <b>PagerDuty Events API v2</b>. Tier 1 primary SRE <b>Rugved Mhatre</b> was paged via mobile push and SMS, with <b>Samruddhi Kakade</b> and <b>Aarzoo Sharma</b> standing by on the escalation ladder. Simultaneously, a ServiceNow CMDB ticket was opened. When I click <b>Acknowledge</b>, bi-directional sync immediately acknowledges the incident in both NEXUS and PagerDuty."
    ))

    # ACT 6
    story.append(make_act_box(
        "Act VI: 1-Click Remediation & Dual-Channel Auto-Resolve",
        "5:45 – 6:45 (60s)",
        "In the Incident Modal, click green <b>'Approve & Execute Remediation'</b>. Watch runbook execute, status change to <b>RESOLVED</b>, and services turn green.",
        "Now for the resolution. With human-in-the-loop governance, the engineer simply clicks <b>Approve & Execute Remediation</b>. NEXUS terminates hanging zombie queries, expands connection pool limits, and verifies healthy ping responses. Crucially, NEXUS performs a <b>dual-channel sync</b>: it automatically updates PagerDuty via REST API and Events API to resolved. Pagers are silenced, ServiceNow tickets close, and Dynatrace returns to 100% health."
    ))

    # ACT 7
    story.append(make_act_box(
        "Act VII: Closing Summary & Measurable ROI",
        "6:45 – 7:15 (30s)",
        "Return to <b>Overview Cockpit</b>. Point to green indicators: <b>100% Platform Health</b>, <b>Zero Active Outages</b>, <b>3.8m MTTR</b>.",
        "To summarize the business value delivered by NEXUS: We reduced alert noise by <b>over 90%</b>, eliminated manual triage with <b>Gemini AI Root Cause Analysis</b>, and compressed MTTR from <b>45+ minutes down to under 4 minutes</b> through automated self-healing. Thank you, and I am happy to open the floor for any questions."
    ))

    # SPEAKER TIPS BOX
    tip_text = Paragraph(
        "<b>💡 3 Golden Rules for Flawless Demo Delivery:</b><br/>"
        "• <b>Pacing:</b> Pause for 1–2 seconds after clicking so the audience notices status color changes and badge updates.<br/>"
        "• <b>Live vs Mocked:</b> Emphasize that Dynatrace is polling the live <i>Farmers Intelligent Quoting Hub</i> and PagerDuty alerts are real API requests.<br/>"
        "• <b>Business Value:</b> Remind stakeholders that automation eliminates costly downtime (,500/min in claims) while keeping human engineers in control.",
        ParagraphStyle(
            'TipStyle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8.5,
            leading=12.5,
            textColor=colors.HexColor("#78350f")
        )
    )
    tip_table = Table([[tip_text]], colWidths=[536])
    tip_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#fffbeb")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#fef3c7")),
        ('LINELEFT', (0,0), (0,-1), 3, colors.HexColor("#f59e0b")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(KeepTogether([tip_table]))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF created successfully at: {os.path.abspath(pdf_path)}")

if __name__ == '__main__':
    build_pdf()
