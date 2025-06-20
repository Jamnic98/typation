from typing import Optional

from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    user_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    password: str
