import httpx
import asyncio
from typing import List, Dict, Any


async def run(target_url: str, auth_token: str = None) -> List[Dict[str, Any]]:
    """
    Test for Server-Side Request Forgery (SSRF)
    Injects localhost/internal IP URLs to check for SSRF
    """
    findings = []
    
    ssrf_payloads = [
        "http://127.0.0.1",
        "http://localhost",
        "http://169.254.169.254",
        "http://127.0.0.1:8000",
        "http://localhost:5432",
    ]
    
    async with httpx.AsyncClient(timeout=10, follow_redirects=False) as client:
        headers = {}
        if auth_token:
            headers["Authorization"] = f"Bearer {auth_token}"
        
        # Test URL parameter injection
        endpoint = "/api/search"
        for payload in ssrf_payloads:
            try:
                response = await client.get(
                    f"{target_url}{endpoint}",
                    params={"url": payload},
                    headers=headers,
                    timeout=5
                )
                
                if response.status_code == 200:
                    findings.append({
                        "test_name": "SSRF",
                        "severity": "CRITICAL",
                        "status": "VULNERABLE",
                        "endpoint": endpoint,
                        "evidence": f"Server accepted and processed SSRF payload: {payload}",
                        "recommendation": "Validate and restrict URL parameters to allowed domains per OWASP API10:2023",
                        "owasp_category": "API10:2023 Unsafe Consumption of APIs",
                        "cvss_score": 8.6
                    })
                    break
            except Exception as e:
                pass
        
        # Test request body injection
        try:
            response = await client.post(
                f"{target_url}/api/request",
                json={"url": "http://127.0.0.1:8000"},
                headers=headers,
                timeout=5
            )
            
            if response.status_code == 200:
                findings.append({
                    "test_name": "SSRF",
                    "severity": "CRITICAL",
                    "status": "VULNERABLE",
                    "endpoint": "/api/request",
                    "evidence": "Server accepted SSRF payload in request body",
                    "recommendation": "Validate and restrict URL parameters to allowed domains per OWASP API10:2023",
                    "owasp_category": "API10:2023 Unsafe Consumption of APIs",
                    "cvss_score": 8.6
                })
        except Exception as e:
            pass
    
    return findings
