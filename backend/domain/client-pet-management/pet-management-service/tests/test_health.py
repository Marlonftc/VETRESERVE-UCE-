import os

# ----------------------------
# Test environment variables
# ----------------------------
os.environ["TESTING"] = "true"

# Fake DB URL ONLY for tests (no real connection will be used)
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "pet-management-service"
    }
