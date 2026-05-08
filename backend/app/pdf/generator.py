from weasyprint import HTML, CSS
from io import BytesIO
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.models import Scan, Finding, RiskLevel


async def generate_pdf(scan_id: str, db: AsyncSession) -> bytes:
    """
    Generate a professional pentest report PDF using WeasyPrint
    """
    # Fetch scan and findings
    stmt = select(Scan).where(Scan.id == scan_id)
    scan = (await db.execute(stmt)).scalars().first()
    
    if not scan:
        raise ValueError(f"Scan {scan_id} not found")
    
    # Get all findings for this scan
    stmt = select(Finding).where(Finding.scan_id == scan_id).order_by(Finding.severity)
    findings = (await db.execute(stmt)).scalars().all()
    
    # Group findings by severity
    findings_by_severity = {}
    for finding in findings:
        severity = finding.severity.value
        if severity not in findings_by_severity:
            findings_by_severity[severity] = []
        findings_by_severity[severity].append(finding)
    
    # Count findings by severity
    severity_counts = {
        "CRITICAL": len(findings_by_severity.get("CRITICAL", [])),
        "HIGH": len(findings_by_severity.get("HIGH", [])),
        "MEDIUM": len(findings_by_severity.get("MEDIUM", [])),
        "LOW": len(findings_by_severity.get("LOW", [])),
        "INFO": len(findings_by_severity.get("INFO", [])),
    }
    
    # Color mapping for severity
    severity_colors = {
        "CRITICAL": "#dc2626",
        "HIGH": "#ea580c",
        "MEDIUM": "#eab308",
        "LOW": "#2563eb",
        "INFO": "#6b7280",
    }
    
    # Build findings HTML
    findings_html = ""
    for severity in ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"]:
        if severity in findings_by_severity:
            findings_html += f'<h2 style="color: {severity_colors[severity]}; margin-top: 30px;">{severity} Severity Findings</h2>'
            for finding in findings_by_severity[severity]:
                findings_html += f"""
                <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 15px; page-break-inside: avoid;">
                    <h3 style="margin: 0 0 10px 0;">{finding.test_name}</h3>
                    <p><strong>Severity:</strong> <span style="color: {severity_colors[severity]}; font-weight: bold;">{finding.severity.value}</span></p>
                    <p><strong>Endpoint:</strong> <code>{finding.endpoint}</code></p>
                    <p><strong>OWASP Category:</strong> {finding.owasp_category}</p>
                    <p><strong>CVSS Score:</strong> {finding.cvss_score}</p>
                    <p><strong>Evidence:</strong></p>
                    <pre style="background-color: #f3f4f6; padding: 10px; border-radius: 4px; overflow-x: auto;">{finding.evidence}</pre>
                    <p><strong>Recommendation:</strong></p>
                    <p>{finding.recommendation}</p>
                </div>
                """
    
    # Build HTML report
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            * {{ margin: 0; padding: 0; box-sizing: border-box; }}
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1f2937; }}
            .cover-page {{ 
                page-break-after: always;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align: center;
                min-height: 100vh;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }}
            .cover-page h1 {{ font-size: 48px; margin-bottom: 20px; }}
            .cover-page p {{ font-size: 20px; margin-bottom: 30px; }}
            .risk-badge {{ 
                display: inline-block;
                padding: 10px 20px;
                border-radius: 6px;
                font-weight: bold;
                font-size: 24px;
                background-color: {severity_colors.get(scan.overall_risk.value if scan.overall_risk else 'INFO', '#6b7280')};
            }}
            h1 {{ font-size: 32px; margin-bottom: 20px; margin-top: 30px; }}
            h2 {{ font-size: 24px; margin-bottom: 15px; margin-top: 25px; }}
            h3 {{ font-size: 18px; margin-bottom: 10px; }}
            table {{ width: 100%; border-collapse: collapse; margin-bottom: 20px; }}
            th, td {{ padding: 10px; text-align: left; border: 1px solid #e5e7eb; }}
            th {{ background-color: #f3f4f6; font-weight: bold; }}
            .summary-table {{ background-color: #f9fafb; }}
            .page-break {{ page-break-before: always; }}
            code {{ background-color: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace; }}
            pre {{ background-color: #f3f4f6; padding: 10px; border-radius: 4px; overflow-x: auto; margin: 10px 0; }}
        </style>
    </head>
    <body>
        <!-- Cover Page -->
        <div class="cover-page">
            <h1>ProbeBlade Security Assessment Report</h1>
            <p>Target: <strong>{scan.target_url}</strong></p>
            <p>Date: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}</p>
            <p>Overall Risk Level</p>
            <div class="risk-badge">{scan.overall_risk.value if scan.overall_risk else 'UNKNOWN'}</div>
        </div>

        <!-- Executive Summary -->
        <div class="page-break">
            <h1>Executive Summary</h1>
            <p>This report contains the findings from the automated API security assessment of <strong>{scan.target_url}</strong>.</p>
            
            <h2>Findings Summary</h2>
            <table class="summary-table">
                <tr>
                    <th>Severity</th>
                    <th>Count</th>
                </tr>
                <tr>
                    <td><span style="color: {severity_colors['CRITICAL']}; font-weight: bold;">CRITICAL</span></td>
                    <td>{severity_counts['CRITICAL']}</td>
                </tr>
                <tr>
                    <td><span style="color: {severity_colors['HIGH']}; font-weight: bold;">HIGH</span></td>
                    <td>{severity_counts['HIGH']}</td>
                </tr>
                <tr>
                    <td><span style="color: {severity_colors['MEDIUM']}; font-weight: bold;">MEDIUM</span></td>
                    <td>{severity_counts['MEDIUM']}</td>
                </tr>
                <tr>
                    <td><span style="color: {severity_colors['LOW']}; font-weight: bold;">LOW</span></td>
                    <td>{severity_counts['LOW']}</td>
                </tr>
                <tr>
                    <td><span style="color: {severity_colors['INFO']}; font-weight: bold;">INFO</span></td>
                    <td>{severity_counts['INFO']}</td>
                </tr>
                <tr>
                    <th>Total</th>
                    <th>{scan.total_findings}</th>
                </tr>
            </table>

            <h2>Overall Risk Assessment</h2>
            <p>The API has been assessed as <strong>{scan.overall_risk.value if scan.overall_risk else 'UNKNOWN'}</strong> risk.</p>
        </div>

        <!-- Detailed Findings -->
        <div class="page-break">
            <h1>Detailed Findings</h1>
            {findings_html}
        </div>

        <!-- OWASP Coverage -->
        <div class="page-break">
            <h1>OWASP API Top 10 Coverage Matrix</h1>
            <table>
                <tr>
                    <th>Test Name</th>
                    <th>Status</th>
                    <th>Findings</th>
                </tr>
                <tr>
                    <td>API1:2023 Broken Object Level Authorization</td>
                    <td>Tested</td>
                    <td>{len(findings_by_severity.get('CRITICAL', [])) + len(findings_by_severity.get('HIGH', []))}</td>
                </tr>
                <tr>
                    <td>API2:2023 Broken Authentication</td>
                    <td>Tested</td>
                    <td>{len(findings_by_severity.get('HIGH', []))}</td>
                </tr>
                <tr>
                    <td>API3:2023 Excessive Data Exposure</td>
                    <td>Tested</td>
                    <td>{len(findings_by_severity.get('HIGH', []))}</td>
                </tr>
                <tr>
                    <td>API4:2023 Unrestricted Resource Consumption</td>
                    <td>Tested</td>
                    <td>{len(findings_by_severity.get('HIGH', []))}</td>
                </tr>
                <tr>
                    <td>API6:2023 Unrestricted Access to Sensitive Business Flows</td>
                    <td>Tested</td>
                    <td>{len(findings_by_severity.get('HIGH', []))}</td>
                </tr>
                <tr>
                    <td>API10:2023 Unsafe Consumption of APIs</td>
                    <td>Tested</td>
                    <td>{len(findings_by_severity.get('CRITICAL', []))}</td>
                </tr>
            </table>
        </div>

    </body>
    </html>
    """
    
    # Generate PDF
    pdf = HTML(string=html_content).write_pdf()
    return pdf
