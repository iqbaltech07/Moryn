"""Quick test to verify imports, schemas, and FastAPI route registration."""
from fastapi.testclient import TestClient
from app.main import app as _app

client = TestClient(_app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    print("[PASS] Root healthcheck:", data)

def test_health_v1():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    print("[PASS] API v1 healthcheck:", data)

if __name__ == "__main__":
    print("Running Moryn AI Engine Smoke Tests...")
    test_root()
    test_health_v1()
    print("All smoke tests passed successfully!")
