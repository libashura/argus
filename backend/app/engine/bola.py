import httpx
import asyncio
from typing import List, Dict, Any


async def run(target_url: str, auth_token: str = None) -> List[Dict[str, Any]]:
    """
    Test for Broken Object Level Authorization (BOLA)
    Makes requests to user endpoints with and without auth token
    """
    findings = []
    
    async with httpx.AsyncClient(timeout=10) as client:
        headers = {}
        if auth_token:
            headers["Authorization"] = f"Bearer {auth_token}"
        
        # Test accessing different user IDs
        for user_id in [1, 2, 3]:
            try:
                # Try with auth token if provided
                if auth_token:
                    response = await client.get(
                        f"{target_url}/api/users/{user_id}",
                        headers=headers
                    )
                    if response.status_code == 200:
                        # Check if data is accessible
                        data = response.json()
                        if data and "id" in data and data["id"] != 1:  # Accessing other user's data
                            findings.append({
                                "test_name": "BOLA",
                                "severity": "CRITICAL",
                                "status": "VULNERABLE",
                                "endpoint": f"/api/users/{user_id}",
                                "evidence": f"Accessed user {user_id} data without proper authorization",
                                "recommendation": "Implement object-level authorization checks per OWASP API1:2023",
                                "owasp_category": "API1:2023 Broken Object Level Authorization",
                                "cvss_score": 8.1
                            })
                
                # Try without auth token
                response = await client.get(f"{target_url}/api/users/{user_id}")
                if response.status_code == 200:
                    findings.append({
                        "test_name": "BOLA",
                        "severity": "CRITICAL",
                        "status": "VULNERABLE",
                        "endpoint": f"/api/users/{user_id}",
                        "evidence": f"Accessed user {user_id} data without authentication",
                        "recommendation": "Implement authentication and authorization checks per OWASP API1:2023",
                        "owasp_category": "API1:2023 Broken Object Level Authorization",
                        "cvss_score": 8.5
                    })
            except Exception as e:
                pass
    
    return findings
