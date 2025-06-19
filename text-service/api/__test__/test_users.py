import pytest
from httpx import Response
from typing import Callable, Optional, Coroutine, Any

from api.app.models.user_model import User


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
            "email": "newuser@example.com"
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
        "userInput": {"email": "newuser@example.com"}
    }

    res1 = await graphql_query_fixture(mutation, variables)
    assert res1.status_code == 200
    assert "errors" not in res1.json()

    res2 = await graphql_query_fixture(mutation, variables)
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
    variables = {"userInput": {"email": email}}

    res1 = await graphql_query_fixture(mutation, variables)
    assert res1.status_code == 200
    assert res1.json()["data"]["createUser"]["email"] == email

    res2 = await graphql_query_fixture(mutation, variables)
    assert res2.status_code == 200
    assert "errors" in res2.json()
    assert "already exists" in res2.json()["errors"][0]["message"].lower()


@pytest.mark.anyio
async def test_get_all_users(graphql_query_fixture, test_users):
    query = """query { users { id } }"""
    response = await graphql_query_fixture(query, None)
    assert response.status_code == 200
    assert isinstance(response.json()["data"]["users"], list)
    assert len(response.json()["data"]["users"]) >= len(test_users)


@pytest.mark.anyio
async def test_get_user_by_id(graphql_query_fixture, async_session, test_users):
    test_user = test_users[0]
    user = await async_session.get(User, test_user.id)
    query = """
        query GetUser($userId: UUID!) {
            user(userId: $userId) {
                id
                userName
                email
            }
        }
    """
    response = await graphql_query_fixture(query, {"userId": str(user.id)})
    assert response.status_code == 200
    data = response.json()["data"]["user"]
    assert data["id"] == str(user.id)
    assert data["email"] == user.email


@pytest.mark.anyio
async def test_get_user_by_invalid_id(graphql_query_fixture):
    query = """
        query {
            user(userId: "68c9ac03-9d6a-49d7-a308-e461a63713eb") {
                id
                email
            }
        }
    """
    res = await graphql_query_fixture(query, None)
    assert res.status_code == 200
    assert res.json()["data"]["user"] is None


@pytest.mark.anyio
async def test_get_users_empty(graphql_query_fixture):
    query = """query { users { id } }"""
    response = await graphql_query_fixture(query, None)
    assert response.status_code == 200
    assert response.json()["data"]["users"] == []


@pytest.mark.anyio
async def test_update_user(graphql_query_fixture, test_users):
    test_user = test_users[0]
    mutation = """
        mutation UpdateUser($userId: UUID!, $userName: String!) {
            updateUser(userId: $userId, userName: $userName) {
                id
                userName
                email
            }
        }
    """
    variables = {
        "userId": str(test_user.id),
        "userName": "updated_username",
    }
    res = await graphql_query_fixture(mutation, variables)
    assert res.status_code == 200
    data = res.json()["data"]["updateUser"]
    assert data["userName"] == "updated_username"
    assert data["id"] == str(test_user.id)


@pytest.mark.anyio
async def test_update_user_invalid_id(graphql_query_fixture):
    mutation = """
        mutation UpdateUser($userId: UUID!, $userName: String!) {
            updateUser(userId: $userId, userName: $userName) {
                id
                userName
            }
        }
    """
    variables = {"userId": "68c9ac03-9d6a-49d7-a308-e461a63713eb", "userName": "ghost"}
    res = await graphql_query_fixture(mutation, variables)
    assert res.status_code == 200
    assert res.json()["data"]["updateUser"] is None


@pytest.mark.anyio
async def test_delete_user(graphql_query_fixture, test_users):
    test_user = test_users[0]
    mutation = """
        mutation DeleteUser($userId: UUID!) {
            deleteUser(userId: $userId)
        }
    """
    res = await graphql_query_fixture(mutation, {"userId": str(test_user.id)})
    assert res.status_code == 200
    assert res.json()["data"]["deleteUser"] is True

    query = """
        query GetUser($userId: UUID!) {
            user(userId: $userId) {
                id
                email
            }
        }
    """
    confirm_res = await graphql_query_fixture(query, {"userId": str(test_user.id)})
    assert confirm_res.status_code == 200
    assert confirm_res.json()["data"]["user"] is None
