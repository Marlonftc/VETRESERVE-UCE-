from prometheus_client import Counter, Histogram

# --- HTTP metrics ---
HTTP_REQUESTS_TOTAL = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["service", "method", "path", "status"],
)

HTTP_REQUEST_DURATION_SECONDS = Histogram(
    "http_request_duration_seconds",
    "HTTP request latency in seconds",
    ["service", "method", "path"],
    buckets=(0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10),
)

HTTP_EXCEPTIONS_TOTAL = Counter(
    "http_exceptions_total",
    "Total unhandled exceptions",
    ["service", "path"],
)

# --- Business/domain metrics (examples) ---
CLINICAL_RECORDS_CREATED_TOTAL = Counter(
    "clinical_records_created_total",
    "Clinical records created (domain metric)",
    ["service"],
)

APPOINTMENTS_CREATED_TOTAL = Counter(
    "appointments_created_total",
    "Appointments created (domain metric)",
    ["service"],
)
