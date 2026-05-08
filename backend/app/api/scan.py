import uuid
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional, List

from app.core.database import get_db
from app.core.models import Scan, Finding, ScanStatus
from app.engine.orchestrator import run_scan

router = APIRouter(prefix="/api", tags=["scan"])


class ScanRequest(BaseModel):
    """Request model for creating a scan"""
    target_url: str
    auth_token: Optional[str] = None
    tests: Optional[List[str]] = None


class ScanResponse(BaseModel):
    """Response model for scan"""
    id: str
    target_url: str
    status: str
    overall_risk: Optional[str] = None
    started_at: str
    completed_at: Optional[str] = None
    total_findings: int


class FindingResponse(BaseModel):
    """Response model for finding"""
    id: str
    test_name: str
    severity: str
    status: str
    endpoint: str
    evidence: Optional[str] = None
    recommendation: Optional[str] = None
    owasp_category: str
    cvss_score: float


class DetailedScanResponse(ScanResponse):
    """Response model with findings"""
    findings: List[FindingResponse] = []


@router.post("/scan")
async def create_scan(
    request: ScanRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
) -> dict:
    """
    Create a new security scan
    """
    scan_id = str(uuid.uuid4())
    
    # Create scan record
    scan = Scan(
        id=scan_id,
        target_url=request.target_url,
        auth_token=request.auth_token,
    )
    db.add(scan)
    await db.commit()
    
    # Run scan in background
    background_tasks.add_task(
        run_scan,
        scan_id=scan_id,
        target_url=request.target_url,
        auth_token=request.auth_token,
        db=db,
        tests=request.tests
    )
    
    return {
        "scan_id": scan_id,
        "status": "pending"
    }


@router.get("/scan/{scan_id}", response_model=DetailedScanResponse)
async def get_scan(scan_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get scan details with all findings
    """
    stmt = select(Scan).where(Scan.id == scan_id)
    scan = (await db.execute(stmt)).scalars().first()
    
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    # Get findings
    stmt = select(Finding).where(Finding.scan_id == scan_id)
    findings = (await db.execute(stmt)).scalars().all()
    
    return {
        "id": scan.id,
        "target_url": scan.target_url,
        "status": scan.status.value,
        "overall_risk": scan.overall_risk.value if scan.overall_risk else None,
        "started_at": scan.started_at.isoformat(),
        "completed_at": scan.completed_at.isoformat() if scan.completed_at else None,
        "total_findings": scan.total_findings,
        "findings": [
            {
                "id": f.id,
                "test_name": f.test_name,
                "severity": f.severity.value,
                "status": f.status.value,
                "endpoint": f.endpoint,
                "evidence": f.evidence,
                "recommendation": f.recommendation,
                "owasp_category": f.owasp_category,
                "cvss_score": f.cvss_score,
            }
            for f in findings
        ]
    }


@router.get("/scans", response_model=List[ScanResponse])
async def list_scans(db: AsyncSession = Depends(get_db)):
    """
    Get list of all past scans
    """
    stmt = select(Scan).order_by(desc(Scan.started_at))
    scans = (await db.execute(stmt)).scalars().all()
    
    return [
        {
            "id": scan.id,
            "target_url": scan.target_url,
            "status": scan.status.value,
            "overall_risk": scan.overall_risk.value if scan.overall_risk else None,
            "started_at": scan.started_at.isoformat(),
            "completed_at": scan.completed_at.isoformat() if scan.completed_at else None,
            "total_findings": scan.total_findings,
        }
        for scan in scans
    ]
