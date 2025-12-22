import asyncio

from api.services import ses


RESET_EMAIL_TEXT = """
Hello,

You requested a password reset. Click the link below to reset your password:

{link}

This link expires in 30 minutes.

If you did not request this, please ignore this email.

Best,
The Typation Team
"""

async def send_reset_email(email: str, token: str):
    reset_link = f"https://typation.co.uk/auth/reset-password/{token}"

    await asyncio.to_thread(
        ses.send_email,
        Source="contact@typation.co.uk",
        Destination={"ToAddresses": [email]},
        Message={
            "Subject": {"Data": "Reset your password"},
            "Body": {
                "Text": {"Data": RESET_EMAIL_TEXT.format(link=reset_link)}
            },
        },
    )
