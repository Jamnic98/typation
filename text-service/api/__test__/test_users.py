from datetime import datetime, timedelta, timezone
from uuid import uuid4

import pytest
from httpx import Response
from typing import Callable, Optional, Coroutine, Any

from jose import jwt

from api.app.settings import settings

pytestmark = pytest.mark.asyncio


def generate_invalid_token():
    # Use a random valid UUID string (non-existent user)
    invalid_user_id = str(uuid4())  # e.g. '123e4567-e89b-12d3-a456-426614174000'

    payload = {
        "sub": invalid_user_id,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=5)
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")


@pytest.mark.anyio
async def test_create_user(graphql_query_fixture: Callable[[str, Optional[dict]], Coroutine[Any, Any, Response]]):
    mutation = """
        mutation CreateUser($userInput: UserCreateInput!) {
            createUser(userInput: $userInput) {
                id
                email
            }
        }
    """
    variables = {
        "userInput": {
            "email": "newuser@example.com",
            "password": "secure_password123"
        }
    }
    response = await graphql_query_fixture(mutation, variables)
    assert response.status_code == 200
    json_data = response.json()
    assert "errors" not in json_data
    assert json_data["data"]["createUser"]["email"] == "newuser@example.com"


@pytest.mark.anyio
async def test_duplicate_email(graphql_query_fixture):
    mutation = """
        mutation CreateUser($userInput: UserCreateInput!) {
            createUser(userInput: $userInput) {
                id
                email
            }
        }
    """
    variables = {
        "userInput": {
            "email": "newuser@example.com",
            "password": "secure_password123"
        }
    }

    res1 = await graphql_query_fixture(mutation, variables, None)
    assert res1.status_code == 200
    assert "errors" not in res1.json()

    res2 = await graphql_query_fixture(mutation, variables, None)
    assert res2.status_code == 200
    assert "errors" in res2.json()
    assert "email already exists" in res2.json()["errors"][0]["message"].lower()


@pytest.mark.anyio
async def test_create_user_duplicate_email(graphql_query_fixture):
    email = "duplicategql@example.com"
    mutation = """
        mutation CreateUser($userInput: UserCreateInput!) {
            createUser(userInput: $userInput) {
                id
                email
            }
        }
    """
    variables = {"userInput": {"email": email, "password": "secure_password123"}}

    res1 = await graphql_query_fixture(mutation, variables, None)
    assert res1.status_code == 200
    assert res1.json()["data"]["createUser"]["email"] == email

    res2 = await graphql_query_fixture(mutation, variables, None)
    assert res2.status_code == 200
    assert "errors" in res2.json()
    assert "already exists" in res2.json()["errors"][0]["message"].lower()


@pytest.mark.anyio
async def test_get_all_users(graphql_query_fixture, test_users):
    query = """query { users { id } }"""
    response = await graphql_query_fixture(query, None, None)
    assert response.status_code == 200
    assert isinstance(response.json()["data"]["users"], list)
    assert len(response.json()["data"]["users"]) >= len(test_users)


@pytest.mark.anyio
async def test_get_users_empty(graphql_query_fixture):
    query = """query { users { id } }"""
    response = await graphql_query_fixture(query, None, None)
    assert response.status_code == 200
    assert response.json()["data"]["users"] == []


@pytest.mark.anyio
async def test_update_user_invalid_id(graphql_query_fixture):
    token = generate_invalid_token()
    headers = {"Authorization": f"Bearer {token}"}
    mutation = """
        mutation UpdateUser($userName: String!) {
            updateUser(userName: $userName) {
                id
                userName
            }
        }
    """
    variables = {"userName": "ghost"}
    res = await graphql_query_fixture(mutation, variables, headers)
    assert res.status_code == 200
    assert res.json()["data"]["updateUser"] is None


@pytest.mark.anyio
async def test_update_user_authenticated(graphql_query_fixture, auth_token):
    test_user_name = "newusername"
    headers = {"Authorization": f"Bearer {auth_token}"}
    mutation = """
        mutation UpdateUser($userName: String!) {
            updateUser(userName: $userName) {
                id
                userName
                email
            }
        }
    """
    variables = {
        "userName": test_user_name
    }

    response = await graphql_query_fixture(mutation, variables, headers)
    assert response.status_code == 200
    data = response.json()
    assert "errors" not in data
    if data["data"]["updateUser"] is not None:
        assert data["data"]["updateUser"]["userName"] == test_user_name
    else:
        print("updateUser returned None")
        assert False, "updateUser returned None"


@pytest.mark.anyio
async def test_delete_user(graphql_query_fixture, auth_token, test_users):
    headers = {"Authorization": f"Bearer {auth_token}"}
    mutation = """
        mutation {
            deleteUser
        }
    """

    res = await graphql_query_fixture(mutation, None, headers)
    assert res.status_code == 200
    data = res.json()
    assert "errors" not in data
    assert data["data"]["deleteUser"] is True

    # Now check the user is gone
    query = """
    query {
        user {
            id
            email
        }
    }
    """
    confirm_res = await graphql_query_fixture(query, None, headers)
    assert confirm_res.status_code == 200
    assert confirm_res.json()["data"]["user"] is None
