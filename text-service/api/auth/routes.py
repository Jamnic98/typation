from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Path, Body
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.user_model import User
from ..schemas import ForgotPasswordRequest
from ..schemas.auth_schema import LoginRequest, RegisterRequest, TokenResponse
from ..schemas.user_schema import UserCreate, UserOut
from ..factories.database import get_db
from ..controllers.users_controller import create_user, get_user_by_id

from .dependencies import get_current_user
from .jwt import create_access_token, verify_reset_token, generate_reset_token
from .security import verify_password, pwd_context
from ..services.reset_password_service import send_reset_email
from ..services.users_service import get_user_by_email

auth_router = APIRouter(prefix="/auth", tags=["auth"])


@auth_router.post("/register")
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    hashed_password = pwd_context.hash(data.password)
    user_in = UserCreate(
        email=data.email,
        user_name=data.user_name,
        first_name=data.first_name,
        last_name=data.last_name,
        hashed_password=hashed_password,
    )
    try:
        user = await create_user(user_in, db)
    except IntegrityError as exc:
        raise HTTPException(status_code=400, detail="Email or username already registered") from exc

    token = create_access_token(data={"sub": str(user.id)})
    return {
        "user": UserOut.model_validate(user),
        "access_token": token
    }


@auth_router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.hashed_password):  # type: ignore
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


@auth_router.get("/me", response_model=UserOut)
async def read_me(current_user: User = Depends(get_current_user)):
    return current_user


@auth_router.post("/reset-password/{token}")
async def reset_password(
    token: str = Path(...),
    payload: dict = Body(...),
    db: AsyncSession = Depends(get_db)
):
    user_id_str = verify_reset_token(token)  # returns string
    try:
        user_id = UUID(user_id_str)  # cast string to UUID
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID in token")

    user = await get_user_by_id(user_id, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # user exists, proceed
    new_password = payload.get("password")
    user.hashed_password = bcrypt.hash(new_password)
    await save_user(user)

    return {"message": "Password successfully reset"}


@auth_router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    # Look up user by email
    user: Optional[User] = await get_user_by_email(str(request.email), db)
    if user:
        # Generate a token and send email
        token = generate_reset_token(str(user.id))
        await send_reset_email(str(user.email), token)

    return {"message": "If this email exists, a reset link has been sent."}
