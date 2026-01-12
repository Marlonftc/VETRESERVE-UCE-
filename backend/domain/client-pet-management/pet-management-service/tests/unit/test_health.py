import os
os.environ["TESTING"] = "true"

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_ok():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["service"] == "pet-management-service"
