from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.models import Scan
from app.pdf.generator import generate_pdf

router = APIRouter(prefix="/api", tags=["report"])


@router.get("/report/{scan_id}/pdf")
async def get_report_pdf(scan_id: str, db: AsyncSession = Depends(get_db)):
    """
    Generate and download PDF report for a scan
    """
    stmt = select(Scan).where(Scan.id == scan_id)
    scan = (await db.execute(stmt)).scalars().first()
    
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    # Generate PDF
    pdf_bytes = await generate_pdf(scan_id, db)
    
    return FileResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        filename=f"probeblade-report-{scan_id}.pdf"
    )
