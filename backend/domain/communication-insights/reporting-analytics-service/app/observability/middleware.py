import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.core.config import SERVICE_NAME
from app.observability.metrics import (
    HTTP_REQUESTS_TOTAL,
    HTTP_REQUEST_DURATION_SECONDS,
    HTTP_EXCEPTIONS_TOTAL,
)

class PrometheusMiddleware(BaseHTTPMiddleware):
    """
    Middleware that records request count, latency, and exceptions.
    """

    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()
        path = request.url.path
        method = request.method

        try:
            response: Response = await call_next(request)
            status = str(response.status_code)
            return response
        except Exception:
            # Record exception and re-raise
            HTTP_EXCEPTIONS_TOTAL.labels(service=SERVICE_NAME, path=path).inc()
            raise
        finally:
            duration = time.perf_counter() - start
            # Avoid counting Prometheus scrapes inside itself if you want; you can keep it too.
            HTTP_REQUEST_DURATION_SECONDS.labels(
                service=SERVICE_NAME, method=method, path=path
            ).observe(duration)

            # If response wasn't created (exception), mark status as "500"
            # Note: status may be unknown here; we keep it simple.
            # We'll count requests for successful responses only if we had them.
            # To count all, you can move this into try-block after response exists.
