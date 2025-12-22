import asyncio

import boto3

# from api.services import ses

RESET_EMAIL_TEXT = """
Hello,

You requested a password reset. Click the link below to reset your password:

{link}

This link expires in 30 minutes.

If you did not request this, please ignore this email.

Best,
The Typation Team
"""

# async def send_reset_email(email: str, token: str):
#     reset_link = f"https://typation.com/auth/reset-password/{token}"
#
#     await asyncio.to_thread(
#         ses.send_email,
#         Source="contact@typation.co.uk",
#         Destination={"ToAddresses": [email]},
#         Message={
#             "Subject": {"Data": "Reset your password"},
#             "Body": {
#                 "Text": {"Data": RESET_EMAIL_TEXT.format(link=reset_link)}
#             },
#         },
#     )

ses = boto3.client("ses", region_name="eu-west-2")

try:
    ses.send_email(
        Source="contact@typation.co.uk",
        Destination={"ToAddresses": ["contact@typation.co.uk"]},  # verified recipient
        Message={
            "Subject": {"Data": "Test SES"},
            "Body": {"Text": {"Data": "Hello world"}}
        }
    )
    print("Email sent")
except Exception as e:
    print("SES error:", e)
