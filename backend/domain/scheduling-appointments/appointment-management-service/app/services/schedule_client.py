import requests
from datetime import time, date
from app.core.config import VET_SCHEDULE_BASE_URL


def normalize_time(value) -> time:
    if isinstance(value, time):
        return value
    return time.fromisoformat(value)


def normalize_day(value) -> str:
    """
    Ensures day comparison is done using string (YYYY-MM-DD)
    """
    if isinstance(value, date):
        return value.isoformat()
    return str(value)


def vet_is_available(
    vet_id: int,
    day,
    start_time,
    end_time
) -> bool:
    response = requests.get(
        f"{VET_SCHEDULE_BASE_URL}/schedules/availability/internal",
        params={"vet_id": vet_id},
        timeout=5
    )

    if response.status_code != 200:
        return False

    schedules = response.json()

    requested_day = normalize_day(day)
    requested_start = normalize_time(start_time)
    requested_end = normalize_time(end_time)

    for s in schedules:
        schedule_start = normalize_time(s["start_time"])
        schedule_end = normalize_time(s["end_time"])

        if (
            s["day"] == requested_day
            and schedule_start <= requested_start
            and schedule_end >= requested_end
        ):
            return True

    return False
