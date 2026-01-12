from pymongo import MongoClient
from app.core.config import MONGO_HOST, MONGO_PORT, MONGO_DB

_client: MongoClient | None = None


def get_client() -> MongoClient:
    global _client
    if _client is None:
        _client = MongoClient(host=MONGO_HOST, port=MONGO_PORT)
    return _client


def get_db():
    client = get_client()
    return client[MONGO_DB]
