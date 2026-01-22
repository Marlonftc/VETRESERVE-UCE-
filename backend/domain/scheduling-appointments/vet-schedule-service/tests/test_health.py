import os
from fastapi.testclient import TestClient

# Force testing mode BEFORE app import
os.environ["ENV"] = "test"
os.environ["DB_ENGINE"] = "sqlite"

from app.main import app  # noqa: E402

client = TestClient(app)


def test_health_ok():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
