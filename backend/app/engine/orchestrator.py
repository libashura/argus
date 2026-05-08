import asyncio
import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update, select

from app.core.models import Scan, Finding, ScanStatus, RiskLevel, FindingStatus
from app.engine import bola, broken_auth, rate_limit, mass_assignment, excessive_exposure, ssrf


async def run_scan(scan_id: str, target_url: str, auth_token: str = None, db: AsyncSession = None, tests: list = None):
    """
    Orchestrate running all security tests concurrently
    """
    if db is None:
        return
    
    # Default to all tests if none specified
    if tests is None:
        tests = ["bola", "broken_auth", "rate_limit", "mass_assignment", "excessive_exposure", "ssrf"]
    
    test_modules = {
        "bola": bola,
        "broken_auth": broken_auth,
        "rate_limit": rate_limit,
        "mass_assignment": mass_assignment,
        "excessive_exposure": excessive_exposure,
        "ssrf": ssrf,
    }
    
    try:
        # Update scan status to running
        stmt = update(Scan).where(Scan.id == scan_id).values(status=ScanStatus.RUNNING)
        await db.execute(stmt)
        await db.commit()
        
        # Prepare tasks for selected tests
        tasks = []
        for test_name in tests:
            if test_name in test_modules:
                tasks.append(test_modules[test_name].run(target_url, auth_token))
        
        # Run all tests concurrently
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results and save findings
        all_findings = []
        for result in results:
            if isinstance(result, list):
                all_findings.extend(result)
        
        # Save findings to database
        findings_by_severity = {}
        for finding_data in all_findings:
            finding_id = str(uuid.uuid4())
            severity = RiskLevel(finding_data.get("severity", "INFO"))
            
            finding = Finding(
                id=finding_id,
                scan_id=scan_id,
                test_name=finding_data.get("test_name", "Unknown"),
                severity=severity,
                status=FindingStatus(finding_data.get("status", "ERROR")),
                endpoint=finding_data.get("endpoint", "unknown"),
                evidence=finding_data.get("evidence", ""),
                recommendation=finding_data.get("recommendation", ""),
                owasp_category=finding_data.get("owasp_category", "Unknown"),
                cvss_score=finding_data.get("cvss_score", 0.0),
            )
            db.add(finding)
            
            # Track findings by severity for risk calculation
            if severity not in findings_by_severity:
                findings_by_severity[severity] = 0
            findings_by_severity[severity] += 1
        
        await db.commit()
        
        # Calculate overall risk level
        overall_risk = RiskLevel.INFO
        if RiskLevel.CRITICAL in findings_by_severity:
            overall_risk = RiskLevel.CRITICAL
        elif RiskLevel.HIGH in findings_by_severity:
            overall_risk = RiskLevel.HIGH
        elif RiskLevel.MEDIUM in findings_by_severity:
            overall_risk = RiskLevel.MEDIUM
        elif RiskLevel.LOW in findings_by_severity:
            overall_risk = RiskLevel.LOW
        
        # Update scan with completion info
        stmt = (
            update(Scan)
            .where(Scan.id == scan_id)
            .values(
                status=ScanStatus.COMPLETE,
                overall_risk=overall_risk,
                total_findings=len(all_findings),
                completed_at=datetime.utcnow()
            )
        )
        await db.execute(stmt)
        await db.commit()
    
    except Exception as e:
        # Update scan status to failed
        stmt = (
            update(Scan)
            .where(Scan.id == scan_id)
            .values(
                status=ScanStatus.FAILED,
                completed_at=datetime.utcnow()
            )
        )
        await db.execute(stmt)
        await db.commit()
