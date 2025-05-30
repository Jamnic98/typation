from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..factories.database import get_db
from ..models.user_model import User
from ..schemas.user_schema import UserCreate, UserUpdate, UserOut, UserRead
from ..controllers.users_controller import (
    create_user,
    get_user_by_id,
    delete_user,
    get_all_users
)

users_router = APIRouter(prefix="/users", tags=["Users"])


@users_router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_new_user(user: UserCreate, db: Session = Depends(get_db)):
    try:
        return create_user(db, user)
    except ValueError as e:
        # Handle duplicate email or any custom controller exception
        raise HTTPException(status_code=400, detail=str(e)) from e


@users_router.get("/{user_id}", response_model=UserOut)
def read_user_by_id(user_id: int, db: Session = Depends(get_db)):
    db_user = get_user_by_id(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail=f"User with id {user_id} not found")
    return db_user


@users_router.get("/", response_model=List[UserRead])
def read_all_users(db: Session = Depends(get_db)):
    return get_all_users(db)


@users_router.put("/{user_id}", response_model=UserRead)
def update_existing_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    for key, value in user_update.model_dump(exclude_unset=True).items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user


@users_router.delete("/{user_id}", status_code=status.HTTP_200_OK)
def delete_user_by_id(user_id: int, db: Session = Depends(get_db)):
    deleted = delete_user(db, user_id)
    if deleted is None:
        raise HTTPException(status_code=404, detail=f"User with id {user_id} not found")
    return {"message": f"Deleted user with id {user_id}"}
