from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.user_model import User
from ..schemas.auth_schema import LoginRequest, RegisterRequest
from ..schemas.user_schema import UserCreate, UserOut
from ..factories.database import get_db
from ..controllers.users_controller import create_user

from .dependencies import get_current_user
from .jwt import create_access_token
from .security import verify_password, pwd_context

auth_router = APIRouter(prefix="/auth", tags=["auth"])


@auth_router.post("/register", response_model=UserOut)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    hashed_password = pwd_context.hash(data.password)
    user_in = UserCreate(
        email=data.email,
        user_name=data.user_name,
        first_name=data.first_name,
        last_name=data.last_name,
        hashed_password=hashed_password,
    )
    user = await create_user(db, user_in)
    return user


@auth_router.post("/login")
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
