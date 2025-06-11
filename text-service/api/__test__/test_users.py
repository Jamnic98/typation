import pytest
from typing import Optional
from httpx import AsyncClient
from requests import Response


GRAPHQL_ENDPOINT = "/graphql"
valid_email = "teebot@example.com"


async def graphql_query(async_client: AsyncClient, query: str, variables: Optional[dict | str] = None) -> Response:
    payload = {"query": query}
    if variables:
        payload["variables"] = variables
    response = await async_client.post(GRAPHQL_ENDPOINT, json=payload)
    return response


@pytest.mark.usefixtures("prepare_database")
class TestUsers:
    @pytest.mark.asyncio
    async def test_create_user(self, async_client: AsyncClient):
        mutation = """
            mutation CreateUser($email: String!) {
                createUser(email: $email) {
                    id
                    email
                    userName
                }
            }
        """
        response = await graphql_query(async_client, mutation, {"email": valid_email})
        assert response.status_code == 200

        data = response.json()["data"]["createUser"]
        assert data["email"] == valid_email
        assert "id" in data


    @pytest.mark.asyncio
    async def test_create_user_duplicate_email(self, async_client: AsyncClient):
        email = "duplicategql@example.com"
        mutation = """
            mutation CreateUser($email: String!) {
                createUser(email: $email) {
                    id
                    email
                }
            }
        """
        # First create
        response1 = await graphql_query(async_client, mutation, {"email": email})
        assert response1.status_code == 200
        assert response1.json()["data"]["createUser"]["email"] == email

        # Duplicate create
        response2 = await graphql_query(async_client, mutation, {"email": email})
        assert response2.status_code == 200
        assert "errors" in response2.json()
        assert "already exists" in response2.json()["errors"][0]["message"].lower()


    @pytest.mark.asyncio
    async def test_get_all_users(self, async_client: AsyncClient, seed_db):
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
        assert len(users) >= len(seed_db)


    @pytest.mark.asyncio
    async def test_get_user_by_id(self, async_client: AsyncClient, seed_db):
        user = seed_db[0]
        query = """
            query GetUser($userId: Int!) {
                user(userId: $userId) {
                    id
                    userName
                    email
                }
            }
        """
        response = await graphql_query(async_client, query, {"userId": user.id})
        assert response.status_code == 200
        data = response.json()["data"]["user"]
        assert data["id"] == 1
        assert data["email"] == user.email


    @pytest.mark.asyncio
    async def test_get_user_by_invalid_id(self, async_client: AsyncClient):
        query = """
            query {
                user(userId: 99999) {
                    id
                    email
                }
            }
        """
        response = await graphql_query(async_client, query)
        assert response.status_code == 200
        assert response.json()["data"]["user"] is None


    @pytest.mark.asyncio
    async def test_get_users_empty(self, async_client: AsyncClient, db):
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


    @pytest.mark.asyncio
    async def test_update_user(self, async_client: AsyncClient, seed_db):
        user = seed_db[0]
        new_user_name = "updated_username"
        mutation = """
            mutation UpdateUser($userId: Int!, $userName: String!) {
                updateUser(userId: $userId, userName: $userName) {
                    id
                    userName
                    email
                }
            }
        """
        variables = {
            "userId": user.id,
            "userName": new_user_name,
        }

        response = await graphql_query(async_client, mutation, variables)
        assert response.status_code == 200

        data = response.json()["data"]["updateUser"]
        assert data["userName"] == new_user_name
        assert data["id"] == user.id


    @pytest.mark.asyncio
    async def test_update_user_invalid_id(self, async_client: AsyncClient):
        mutation = """
            mutation UpdateUser($userId: Int!, $userName: String!) {
                updateUser(userId: $userId, userName: $userName) {
                    id
                    userName
                }
            }
        """
        response = await graphql_query(async_client, mutation, {"userId": 99999, "userName": "ghost"})
        assert response.status_code == 200
        assert response.json()["data"]["updateUser"] is None


    @pytest.mark.asyncio
    async def test_delete_user(self, async_client: AsyncClient, seed_db):
        user = seed_db[0]
        mutation = """
            mutation DeleteUser($userId: Int!) {
                deleteUser(userId: $userId)
            }
        """
        response = await graphql_query(async_client, mutation, {"userId": user.id})
        assert response.status_code == 200
        assert response.json()["data"]["deleteUser"] is True

        # Now confirm user is gone
        query = """
            query GetUser($userId: Int!) {
                user(userId: $userId) {
                    id
                    email
                }
            }
        """
        confirm_response = await graphql_query(async_client, query, {"userId": user.id})
        assert confirm_response.status_code == 200
        assert confirm_response.json()["data"]["user"] is None
