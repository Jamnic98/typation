import pytest
from typing import Optional
from httpx import AsyncClient
from requests import Response

from api.app.models.user_model import User

GRAPHQL_ENDPOINT = "/graphql"


async def graphql_query(async_client: AsyncClient, query: str, variables: Optional[dict | str] = None) -> Response:
    payload = {"query": query}
    if variables:
        payload["variables"] = variables
    response = await async_client.post(GRAPHQL_ENDPOINT, json=payload)
    return response


@pytest.mark.anyio
class TestUsers:
    @pytest.mark.anyio
    async def test_create_user(self, async_client: AsyncClient):
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
        response = await graphql_query(async_client, mutation, variables)
        assert response.status_code == 200
        json_data = response.json()
        print('[json_data]', json_data)
        assert "errors" not in json_data
        assert "data" in json_data
        data = json_data["data"]["createUser"]
        assert data["email"] == "newuser@example.com"

    @pytest.mark.anyio
    async def test_duplicate_email(self, async_client: AsyncClient):
        email = "teebot@example.com"
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

        # First create
        response1 = await graphql_query(async_client, mutation, variables)
        assert response1.status_code == 200
        assert "errors" not in response1.json()

        # Duplicate
        response2 = await graphql_query(async_client, mutation, variables)
        json_data = response2.json()
        assert response2.status_code == 200
        assert "errors" in json_data
        assert "email already exists" in json_data["errors"][0]["message"].lower()

    @pytest.mark.anyio
    async def test_create_user_duplicate_email(self, async_client: AsyncClient):
        email = "duplicategql@example.com"
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
                # give same email for different user
                "email": email
            }
        }
        response1 = await graphql_query(async_client, mutation, variables)
        assert response1.status_code == 200
        assert response1.json()["data"]["createUser"]["email"] == email

        response2 = await graphql_query(async_client, mutation, variables)
        assert response2.status_code == 200
        assert "errors" in response2.json()
        assert "already exists" in response2.json()["errors"][0]["message"].lower()

    @pytest.mark.anyio
    async def test_get_all_users(self, async_client: AsyncClient, test_users):
        query = """
            query {
                users {
                    id
                }
            }
        """
        response = await graphql_query(async_client, query)
        assert response.status_code == 200
        users = response.json()["data"]["users"]
        assert isinstance(users, list)
        assert len(users) >= len(test_users)


    @pytest.mark.anyio
    async def test_get_user_by_id(self, async_client: AsyncClient, async_session, test_users):

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
        response = await graphql_query(async_client, query, {"userId": str(user.id)})
        assert response.status_code == 200
        data = response.json()["data"]["user"]
        assert data["id"] == str(user.id)
        assert data["email"] == user.email


    @pytest.mark.anyio
    async def test_get_user_by_invalid_id(self, async_client: AsyncClient):
        query = """
            query {
                user(userId: "68c9ac03-9d6a-49d7-a308-e461a63713eb") {
                    id
                    email
                }
            }
        """
        response = await graphql_query(async_client, query)
        assert response.status_code == 200
        assert response.json()["data"]["user"] is None

    @pytest.mark.anyio
    async def test_get_users_empty(self, async_client: AsyncClient):
        query = """
            query {
                users {
                    id
                }
            }
        """
        response = await graphql_query(async_client, query)
        assert response.status_code == 200
        assert response.json()["data"]["users"] == []

    @pytest.mark.anyio
    async def test_update_user(self, async_client: AsyncClient, test_users):
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

        response = await graphql_query(async_client, mutation, variables)
        assert response.status_code == 200
        data = response.json()["data"]["updateUser"]
        assert data["userName"] == "updated_username"
        assert data["id"] == str(test_user.id)

    @pytest.mark.anyio
    async def test_update_user_invalid_id(self, async_client: AsyncClient):
        mutation = """
            mutation UpdateUser($userId: UUID!, $userName: String!) {
                updateUser(userId: $userId, userName: $userName) {
                    id
                    userName
                }
            }
        """
        invalid_id = "68c9ac03-9d6a-49d7-a308-e461a63713eb"
        response = await graphql_query(
            async_client,
            mutation,
            {"userId": invalid_id, "userName": "ghost"}
        )
        assert response.status_code == 200
        assert response.json()["data"]["updateUser"] is None


    @pytest.mark.anyio
    async def test_delete_user(self, async_client: AsyncClient, test_users):
        test_user = test_users[0]
        mutation = """
            mutation DeleteUser($userId: UUID!) {
                deleteUser(userId: $userId)
            }
        """

        response = await graphql_query(async_client, mutation, {"userId": str(test_user.id)})
        assert response.status_code == 200
        assert response.json()["data"]["deleteUser"] is True

        query = """
            query GetUser($userId: UUID!) {
                user(userId: $userId) {
                    id
                    email
                }
            }
        """
        confirm_response = await graphql_query(async_client, query, {"userId": str(test_user.id)})
        assert confirm_response.status_code == 200
        assert confirm_response.json()["data"]["user"] is None
