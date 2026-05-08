import httpx
import asyncio
from typing import List, Dict, Any
import time


async def run(target_url: str, auth_token: str = None) -> List[Dict[str, Any]]:
    """
    Test for Rate Limiting issues
    Sends rapid requests to check if rate limiting is implemented
    """
    findings = []
    
    async with httpx.AsyncClient(timeout=10) as client:
        headers = {}
        if auth_token:
            headers["Authorization"] = f"Bearer {auth_token}"
        
        # Send 50 rapid requests to an auth endpoint
        endpoint = "/auth/login"
        rate_limited = False
        
        try:
            for i in range(50):
                response = await client.post(
                    f"{target_url}{endpoint}",
                    json={"username": f"user{i}", "password": "password"},
                    headers=headers
                )
                
                # Check for rate limit response
                if response.status_code == 429:
                    rate_limited = True
                    break
            
            # If not rate limited after 50 requests
            if not rate_limited:
                findings.append({
                    "test_name": "Missing Rate Limiting",
                    "severity": "HIGH",
                    "status": "VULNERABLE",
                    "endpoint": endpoint,
                    "evidence": "No rate limiting detected after 50 rapid requests",
                    "recommendation": "Implement rate limiting to prevent brute force attacks per OWASP API4:2023",
                    "owasp_category": "API4:2023 Unrestricted Resource Consumption",
                    "cvss_score": 7.5
                })
        except Exception as e:
            pass
    
    return findings
