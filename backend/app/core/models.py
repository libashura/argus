from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.core.database import Base


class RiskLevel(str, enum.Enum):
    """Risk severity levels"""
    INFO = "INFO"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ScanStatus(str, enum.Enum):
    """Scan status"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETE = "complete"
    FAILED = "failed"


class FindingStatus(str, enum.Enum):
    """Finding status"""
    VULNERABLE = "VULNERABLE"
    SAFE = "SAFE"
    ERROR = "ERROR"


class Scan(Base):
    """Scan record in database"""
    __tablename__ = "scans"
    
    id = Column(String, primary_key=True, index=True)
    target_url = Column(String, nullable=False)
    status = Column(SQLEnum(ScanStatus), default=ScanStatus.PENDING, nullable=False)
    overall_risk = Column(SQLEnum(RiskLevel), nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    total_findings = Column(Integer, default=0)
    auth_token = Column(String, nullable=True)
    
    # Relationships
    findings = relationship("Finding", back_populates="scan", cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            "id": self.id,
            "target_url": self.target_url,
            "status": self.status.value,
            "overall_risk": self.overall_risk.value if self.overall_risk else None,
            "started_at": self.started_at.isoformat(),
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "total_findings": self.total_findings,
        }


class Finding(Base):
    """Finding from a scan"""
    __tablename__ = "findings"
    
    id = Column(String, primary_key=True, index=True)
    scan_id = Column(String, ForeignKey("scans.id"), nullable=False, index=True)
    test_name = Column(String, nullable=False)
    severity = Column(SQLEnum(RiskLevel), nullable=False)
    status = Column(SQLEnum(FindingStatus), nullable=False)
    endpoint = Column(String, nullable=False)
    evidence = Column(String, nullable=True)
    recommendation = Column(String, nullable=True)
    owasp_category = Column(String, nullable=False)
    cvss_score = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    scan = relationship("Scan", back_populates="findings")
    
    def to_dict(self):
        return {
            "id": self.id,
            "scan_id": self.scan_id,
            "test_name": self.test_name,
            "severity": self.severity.value,
            "status": self.status.value,
            "endpoint": self.endpoint,
            "evidence": self.evidence,
            "recommendation": self.recommendation,
            "owasp_category": self.owasp_category,
            "cvss_score": self.cvss_score,
        }
