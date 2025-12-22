import boto3

from api.settings import settings

sns = boto3.client("sns", region_name=settings.REGION)
ses = boto3.client("ses", region_name=settings.REGION)
