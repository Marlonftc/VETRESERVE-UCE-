import sys
from pathlib import Path
from fastapi.testclient import TestClient

# Add project root to PYTHONPATH
ROOT_DIR = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT_DIR))

from app.main import app  # noqa: E402

client = TestClient(app)


def test_health_ok():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
