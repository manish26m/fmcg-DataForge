"""
Direct S3 upload diagnostic - runs independently of FastAPI.
Tests: credentials, bucket access, and actual upload.
"""
import sys
import boto3
from botocore.exceptions import BotoCoreError, ClientError
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env")

KEY_ID     = os.getenv("AWS_ACCESS_KEY_ID")
SECRET     = os.getenv("AWS_SECRET_ACCESS_KEY")
REGION     = os.getenv("AWS_DEFAULT_REGION", "us-east-1")
BUCKET     = os.getenv("S3_BUCKET")

print("=== S3 Diagnostic ===")
print(f"Key ID  : {KEY_ID}")
print(f"Region  : {REGION}")
print(f"Bucket  : {BUCKET}")
print()

try:
    client = boto3.client(
        "s3",
        aws_access_key_id=KEY_ID,
        aws_secret_access_key=SECRET,
        region_name=REGION,
    )

    # 1. Check bucket exists and we have access
    print("[1] Checking bucket access...")
    resp = client.head_bucket(Bucket=BUCKET)
    print("    PASS: Bucket accessible.\n")

    # 2. List existing folders
    print("[2] Listing top-level prefixes in bucket...")
    resp = client.list_objects_v2(Bucket=BUCKET, Delimiter="/")
    prefixes = [p["Prefix"] for p in resp.get("CommonPrefixes", [])]
    print(f"    Found prefixes: {prefixes}\n")

    # 3. Try uploading a tiny test file
    print("[3] Uploading test file to landing/...")
    test_key = "landing/test_diagnostic.csv"
    test_data = b"id,name,value\n1,test,123\n"
    client.put_object(Bucket=BUCKET, Key=test_key, Body=test_data, ContentType="text/csv")
    print(f"    PASS: Upload success: s3://{BUCKET}/{test_key}\n")

    # 4. Verify it exists
    print("[4] Verifying uploaded file...")
    head = client.head_object(Bucket=BUCKET, Key=test_key)
    print(f"    PASS: File found. Size={head['ContentLength']} bytes\n")

    print("=== ALL CHECKS PASSED ===")

except ClientError as e:
    code = e.response["Error"]["Code"]
    msg  = e.response["Error"]["Message"]
    print(f"    FAIL - AWS ClientError [{code}]: {msg}")
    if code in ("403", "AccessDenied"):
        print("    -> IAM user does not have s3:PutObject or s3:GetObject on this bucket.")
    elif code == "NoSuchBucket":
        print("    -> Bucket name is wrong or doesn't exist in this region.")
    elif code == "InvalidClientTokenId":
        print("    -> AWS_ACCESS_KEY_ID is invalid.")
    elif code == "SignatureDoesNotMatch":
        print("    -> AWS_SECRET_ACCESS_KEY is wrong.")
    sys.exit(1)
except BotoCoreError as e:
    print(f"    FAIL - BotoCoreError: {e}")
    sys.exit(1)
