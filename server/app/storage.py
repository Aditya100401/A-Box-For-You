import contextlib
import os
from functools import lru_cache

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

BUCKET = os.environ.get("R2_BUCKET", "")

# Extension and content type come from sniffing the bytes, never from what the
# client claims. SVG is deliberately absent: it can carry script.
IMAGE_TYPES = {
    "png": "image/png",
    "jpg": "image/jpeg",
    "gif": "image/gif",
    "webp": "image/webp",
}


def sniff_image(head: bytes) -> str | None:
    if head.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"
    if head.startswith(b"\xff\xd8\xff"):
        return "jpg"
    if head.startswith((b"GIF87a", b"GIF89a")):
        return "gif"
    if head[:4] == b"RIFF" and head[8:12] == b"WEBP":
        return "webp"
    return None


@lru_cache(maxsize=1)
def client():
    account = os.environ.get("R2_ACCOUNT_ID", "")
    if not account:
        raise RuntimeError("R2_ACCOUNT_ID is not set — see server/.env.example")
    return boto3.client(
        "s3",
        endpoint_url=f"https://{account}.r2.cloudflarestorage.com",
        aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
        region_name="auto",
        config=Config(signature_version="s3v4", retries={"max_attempts": 3}),
    )


def put_image(key: str, data: bytes, content_type: str) -> None:
    client().put_object(Bucket=BUCKET, Key=key, Body=data, ContentType=content_type)


def delete_images(keys: list[str]) -> None:
    for key in keys:
        # A photo that is already gone is the outcome we wanted anyway.
        with contextlib.suppress(ClientError):
            client().delete_object(Bucket=BUCKET, Key=key)


def get_image(key: str) -> bytes | None:
    try:
        return client().get_object(Bucket=BUCKET, Key=key)["Body"].read()
    except ClientError as err:
        if err.response["Error"]["Code"] in {"NoSuchKey", "404", "AccessDenied"}:
            return None
        raise
