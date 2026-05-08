import httpx
import asyncio
from typing import List, Dict, Any


async def run(target_url: str, auth_token: str = None) -> List[Dict[str, Any]]:
    """
    Test for Mass Assignment vulnerability
    Sends POST/PUT requests with extra fields like role, is_admin
    """
    findings = []
    
    async with httpx.AsyncClient(timeout=10) as client:
        headers = {}
        if auth_token:
            headers["Authorization"] = f"Bearer {auth_token}"
        
        try:
            # Test mass assignment on user creation/update
            payload = {
                "username": "testuser",
                "email": "test@example.com",
                "role": "admin",
                "is_admin": True,
                "permissions": ["read", "write", "delete"]
            }
            
            # Test POST
            response = await client.post(
                f"{target_url}/api/users",
                json=payload,
                headers=headers
            )
            
            if response.status_code in [200, 201]:
                try:
                    data = response.json()
                    if data.get("is_admin") or data.get("role") == "admin":
                        findings.append({
                            "test_name": "Mass Assignment",
                            "severity": "HIGH",
                            "status": "VULNERABLE",
                            "endpoint": "/api/users",
                            "evidence": "Server accepted unauthorized fields (role, is_admin) in POST request",
                            "recommendation": "Use allowlists for input validation per OWASP API6:2023",
                            "owasp_category": "API6:2023 Unrestricted Access to Sensitive Business Flows",
                            "cvss_score": 7.2
                        })
                except:
                    pass
            
            # Test PUT
            response = await client.put(
                f"{target_url}/api/users/1",
                json=payload,
                headers=headers
            )
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if data.get("is_admin") or data.get("role") == "admin":
                        findings.append({
                            "test_name": "Mass Assignment",
                            "severity": "HIGH",
                            "status": "VULNERABLE",
                            "endpoint": "/api/users/1",
                            "evidence": "Server accepted unauthorized fields (role, is_admin) in PUT request",
                            "recommendation": "Use allowlists for input validation per OWASP API6:2023",
                            "owasp_category": "API6:2023 Unrestricted Access to Sensitive Business Flows",
                            "cvss_score": 7.2
                        })
                except:
                    pass
        except Exception as e:
            pass
    
    return findings
