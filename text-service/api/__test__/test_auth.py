import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_register_user(async_client: AsyncClient):
    response = await async_client.post("/auth/register", json={
        "email": "test@example.com",
        "user_name": "testuser",
        "first_name": "Test",
        "last_name": "User",
        "password": "securepassword123"
    })

    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["user_name"] == "testuser"
    assert "id" in data


@pytest.mark.asyncio
async def test_login_user(async_client: AsyncClient):
    # Register first
    await async_client.post("/auth/register", json={
        "email": "login@example.com",
        "user_name": "loginuser",
        "first_name": "Login",
        "last_name": "User",
        "password": "mypassword"
    })

    # Then login
    response = await async_client.post("/auth/login", json={
        "email": "login@example.com",
        "password": "mypassword"
    })

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_me_endpoint_requires_token(async_client: AsyncClient):
    # Register + login
    await async_client.post("/auth/register", json={
        "email": "me@test.com",
        "user_name": "meuser",
        "first_name": "Me",
        "last_name": "User",
        "password": "pass1234"
    })
    login = await async_client.post("/auth/login", json={
        "email": "me@test.com",
        "password": "pass1234"
    })
    token = login.json()["access_token"]

    # Access /me
    response = await async_client.get("/auth/me", headers={
        "Authorization": f"Bearer {token}"
    })

    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "me@test.com"
    assert "id" in data
