import httpx
import asyncio
from typing import List, Dict, Any


async def run(target_url: str, auth_token: str = None) -> List[Dict[str, Any]]:
    """
    Test for Broken Authentication
    Tests missing auth headers, expired/malformed JWT tokens
    """
    findings = []
    
    async with httpx.AsyncClient(timeout=10) as client:
        endpoints = [
            "/api/users",
            "/api/admin",
            "/api/profile"
        ]
        
        for endpoint in endpoints:
            try:
                # Test without auth header
                response = await client.get(f"{target_url}{endpoint}")
                if response.status_code == 200:
                    findings.append({
                        "test_name": "Broken Authentication",
                        "severity": "CRITICAL",
                        "status": "VULNERABLE",
                        "endpoint": endpoint,
                        "evidence": "Endpoint accessible without authentication",
                        "recommendation": "Implement proper authentication (OAuth2, JWT, API Keys) per OWASP API2:2023",
                        "owasp_category": "API2:2023 Broken Authentication",
                        "cvss_score": 8.6
                    })
                
                # Test with malformed JWT
                malformed_jwt = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.invalid"
                response = await client.get(
                    f"{target_url}{endpoint}",
                    headers={"Authorization": malformed_jwt}
                )
                if response.status_code == 200:
                    findings.append({
                        "test_name": "Broken Authentication",
                        "severity": "HIGH",
                        "status": "VULNERABLE",
                        "endpoint": endpoint,
                        "evidence": "Endpoint accepts malformed JWT token",
                        "recommendation": "Validate and verify JWT tokens properly",
                        "owasp_category": "API2:2023 Broken Authentication",
                        "cvss_score": 7.5
                    })
                
                # Test with expired token
                expired_jwt = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDAwMDAwMDB9.invalid"
                response = await client.get(
                    f"{target_url}{endpoint}",
                    headers={"Authorization": expired_jwt}
                )
                if response.status_code == 200:
                    findings.append({
                        "test_name": "Broken Authentication",
                        "severity": "HIGH",
                        "status": "VULNERABLE",
                        "endpoint": endpoint,
                        "evidence": "Endpoint accepts expired JWT token",
                        "recommendation": "Validate token expiration times",
                        "owasp_category": "API2:2023 Broken Authentication",
                        "cvss_score": 7.3
                    })
            except Exception as e:
                pass
    
    return findings
