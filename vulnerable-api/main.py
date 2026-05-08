from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
import httpx
from datetime import datetime, timedelta
from typing import Optional
import json

app = FastAPI(
    title="Vulnerable API Demo",
    version="0.1.0",
    description="Deliberately vulnerable API for security testing",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock database with demo users
demo_users = [
    {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com",
        "password": "admin123",  # VULNERABLE: password in response
        "password_hash": "hashed_password_123",  # VULNERABLE: hash in response
        "role": "user",
        "is_admin": False,
    },
    {
        "id": 2,
        "username": "user1",
        "email": "user1@example.com",
        "password": "password123",  # VULNERABLE: password in response
        "password_hash": "hashed_password_456",  # VULNERABLE: hash in response
        "role": "user",
        "is_admin": False,
    },
    {
        "id": 3,
        "username": "user2",
        "email": "user2@example.com",
        "password": "password456",  # VULNERABLE: password in response
        "password_hash": "hashed_password_789",  # VULNERABLE: hash in response
        "role": "user",
        "is_admin": False,
    },
]

request_count = {}


@app.on_event("startup")
async def startup():
    """Initialize on startup"""
    pass


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Vulnerable API Demo", "version": "0.1.0"}


@app.get("/docs")
async def get_docs():
    """API documentation is at /docs"""
    return {"message": "Go to /docs for API documentation"}


# ===== AUTHENTICATION ENDPOINTS (VULNERABLE) =====

@app.post("/auth/login")
async def login(username: str, password: str):
    """
    VULNERABLE: No rate limiting, accepts any password
    """
    # No rate limiting - VULNERABLE to brute force
    # No password validation - VULNERABLE
    
    user = next((u for u in demo_users if u["username"] == username), None)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Return JWT (mock) - no proper validation
    return {
        "access_token": "mock_jwt_token_" + username,
        "token_type": "bearer",
        "user_id": user["id"]
    }


# ===== USER ENDPOINTS (VULNERABLE TO BOLA + EXCESSIVE EXPOSURE) =====

@app.get("/api/users")
async def get_users():
    """
    VULNERABLE: No authentication check (BOLA)
    VULNERABLE: Returns sensitive data like password_hash (Excessive Exposure)
    """
    return demo_users  # Returns all sensitive data


@app.get("/api/users/{user_id}")
async def get_user(user_id: int):
    """
    VULNERABLE: No authorization check - allows accessing other users' data (BOLA)
    VULNERABLE: Returns sensitive fields (Excessive Exposure)
    """
    user = next((u for u in demo_users if u["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Returns full user object including password_hash - VULNERABLE
    return user


@app.put("/api/users/{user_id}")
async def update_user(user_id: int, data: dict):
    """
    VULNERABLE: Mass assignment - accepts any fields including role, is_admin
    """
    user = next((u for u in demo_users if u["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # VULNERABLE: Accepts and applies any field from input
    for key, value in data.items():
        user[key] = value  # No validation - accepts role, is_admin, etc.
    
    return user


@app.post("/api/users")
async def create_user(data: dict):
    """
    VULNERABLE: Mass assignment - accepts any fields including role, is_admin
    """
    new_user = {
        "id": len(demo_users) + 1,
    }
    
    # VULNERABLE: Accepts and applies any field from input
    for key, value in data.items():
        new_user[key] = value
    
    demo_users.append(new_user)
    return new_user


# ===== SEARCH ENDPOINT (VULNERABLE TO SSRF) =====

@app.get("/api/search")
async def search(url: str):
    """
    VULNERABLE: Server-Side Request Forgery (SSRF)
    Allows fetching arbitrary URLs from server
    """
    try:
        # VULNERABLE: No URL validation or restrictions
        async with httpx.AsyncClient(timeout=5) as client:
            response = await client.get(url, follow_redirects=False)
            return {
                "status_code": response.status_code,
                "content": response.text[:500],  # Return response content
            }
    except Exception as e:
        return {
            "status_code": 200,  # Still return 200 for SSRF detection
            "error": str(e),
        }


@app.post("/api/request")
async def request_endpoint(data: dict):
    """
    VULNERABLE: Server-Side Request Forgery in request body
    """
    url = data.get("url")
    if not url:
        raise HTTPException(status_code=400, detail="Missing url parameter")
    
    try:
        # VULNERABLE: No URL validation
        async with httpx.AsyncClient(timeout=5) as client:
            response = await client.get(url, follow_redirects=False)
            return {
                "status_code": response.status_code,
                "content": response.text[:500],
            }
    except Exception as e:
        return {
            "status_code": 200,
            "error": str(e),
        }


# ===== ADMIN ENDPOINTS (VULNERABLE) =====

@app.get("/api/admin")
async def admin_panel():
    """
    VULNERABLE: No authentication, returns admin data
    """
    return {
        "admin_users": [u for u in demo_users if u.get("is_admin")],
        "total_users": len(demo_users),
        "database_config": "postgresql://localhost/vulndb",  # VULNERABLE: Exposure
    }


@app.get("/health")
async def health():
    """Health check"""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
