import os
from pathlib import Path


def _load_env() -> None:
    """
    Read server/.env for local development. Hosted environments set real
    environment variables, which always win — this never overwrites them.
    """
    path = Path(__file__).resolve().parent.parent / ".env"
    if not path.exists():
        return
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip("\"'"))


_load_env()
