from pydantic import BaseModel, EmailStr

class WaitlistRequestPayload(BaseModel):
    email: EmailStr

class ForgotPasswordRequest(BaseModel):
    email: EmailStr
