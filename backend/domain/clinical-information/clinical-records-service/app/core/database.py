import os
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError

from app.core.config import MONGO_HOST, MONGO_PORT, MONGO_DB

_client: MongoClient | None = None


def get_client() -> MongoClient:
    """
    Returns a singleton MongoClient.

    Supports either:
    - MONGO_URI (recommended), or
    - MONGO_HOST + MONGO_PORT (fallback)
    """
    global _client
    if _client is not None:
        return _client

    mongo_uri = os.getenv("MONGO_URI")

    if mongo_uri:
        _client = MongoClient(
            mongo_uri,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            socketTimeoutMS=5000,
        )
    else:
        _client = MongoClient(
            host=MONGO_HOST,
            port=MONGO_PORT,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            socketTimeoutMS=5000,
        )

    # Fail fast if Mongo is unreachable
    try:
        _client.admin.command("ping")
        print("[MongoDB] Connected successfully", flush=True)
    except ServerSelectionTimeoutError as e:
        print(f"[MongoDB] Connection failed: {e}", flush=True)
        raise

    return _client


def get_db():
    client = get_client()
    return client[MONGO_DB]
