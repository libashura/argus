import httpx
import asyncio
from typing import List, Dict, Any


async def run(target_url: str, auth_token: str = None) -> List[Dict[str, Any]]:
    """
    Test for Excessive Data Exposure
    Checks if responses contain sensitive fields
    """
    findings = []
    
    sensitive_fields = [
        "password",
        "password_hash",
        "secret",
        "token",
        "api_key",
        "ssn",
        "credit_card",
        "credit_card_number",
        "private_key",
        "access_token",
        "refresh_token"
    ]
    
    async with httpx.AsyncClient(timeout=10) as client:
        headers = {}
        if auth_token:
            headers["Authorization"] = f"Bearer {auth_token}"
        
        endpoints = [
            "/api/users",
            "/api/users/1",
            "/api/profile",
            "/api/admin"
        ]
        
        for endpoint in endpoints:
            try:
                response = await client.get(f"{target_url}{endpoint}", headers=headers)
                
                if response.status_code == 200:
                    try:
                        data = response.json()
                        
                        # Check if response is a list
                        if isinstance(data, list):
                            for item in data:
                                if isinstance(item, dict):
                                    exposed = [f for f in sensitive_fields if f in item]
                                    if exposed:
                                        findings.append({
                                            "test_name": "Excessive Data Exposure",
                                            "severity": "HIGH",
                                            "status": "VULNERABLE",
                                            "endpoint": endpoint,
                                            "evidence": f"Response contains sensitive fields: {', '.join(exposed)}",
                                            "recommendation": "Remove sensitive fields from API responses per OWASP API3:2023",
                                            "owasp_category": "API3:2023 Excessive Data Exposure",
                                            "cvss_score": 6.5
                                        })
                                        break
                        elif isinstance(data, dict):
                            exposed = [f for f in sensitive_fields if f in data]
                            if exposed:
                                findings.append({
                                    "test_name": "Excessive Data Exposure",
                                    "severity": "HIGH",
                                    "status": "VULNERABLE",
                                    "endpoint": endpoint,
                                    "evidence": f"Response contains sensitive fields: {', '.join(exposed)}",
                                    "recommendation": "Remove sensitive fields from API responses per OWASP API3:2023",
                                    "owasp_category": "API3:2023 Excessive Data Exposure",
                                    "cvss_score": 6.5
                                })
                    except:
                        pass
            except Exception as e:
                pass
    
    return findings
