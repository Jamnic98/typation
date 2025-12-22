import asyncio
import boto3
from pydantic import EmailStr
from sqlalchemy import insert
from sqlalchemy.exc import IntegrityError

from api.factories.database import async_sessionmaker_instance
from api.models import WaitlistRequest
from api.services import ses, sns
from api.settings import settings

WELCOME_EMAIL_TEXT = (
    "Hello,\n\n"
    "Thank you for joining the Typation waitlist.\n\n"
    "We appreciate your interest in our platform, which is currently in early alpha. "
    "Your feedback at this stage is especially valuable. If you’d like to share any thoughts, "
    "please reach out to us at contact@typation.co.uk.\n\n"
    "We will keep you updated as new features are released.\n\n"
    "Best regards,\n"
    "The Typation Team"
)

def get_secret(name: str) -> str:
    ssm = boto3.client("ssm")
    response = ssm.get_parameter(Name=name, WithDecryption=True)
    return response["Parameter"]["Value"]


async def add_to_waitlist(email: EmailStr):
    async with async_sessionmaker_instance() as session:
        try:
            await session.execute(
                insert(WaitlistRequest).values(email=email)
            )
            await session.commit()
        except IntegrityError:
            await session.rollback()
            return False  # already on waitlist

    await asyncio.to_thread(
        sns.publish,
        TopicArn=settings.SNS_TOPIC_ARN,
        Subject="New Waitlist Signup",
        Message=f"New signup: {email}"
    )

    await asyncio.to_thread(
        ses.send_email,
        Source="contact@typation.co.uk",
        Destination={"ToAddresses": [email]},
        Message={
            "Subject": {"Data": "Welcome to Typation 🎉"},
            "Body": {
                "Text": {"Data": WELCOME_EMAIL_TEXT}
            },
        },
    )

    return True
