import pytest


@pytest.mark.anyio
async def test_create_stats_session(graphql_query_fixture, test_users):
    mutation = """
        mutation CreateStatsSession($userStatsSessionInput: UserStatsSessionInput!) {
            createUserStatsSession(userStatsSessionInput: $userStatsSessionInput) {
                id
                wpm
                accuracy
                createdAt
            }
        }
    """
    variables = {
        "userStatsSessionInput": {
            "userId": str(test_users[0].id),
            "wpm": 75,
            "accuracy": 96,
            "practiceDuration": 120000
        }
    }

    response = await graphql_query_fixture(mutation, variables)
    assert response.status_code == 200
    json_data = response.json()
    assert "errors" not in json_data
    data = json_data["data"]["createUserStatsSession"]
    assert data["wpm"] == 75
    assert data["accuracy"] == 96
    assert "id" in data
    assert "createdAt" in data


@pytest.mark.anyio
async def test_get_all_stats_sessions(graphql_query_fixture, test_users):
    # Assumes session(s) created in fixture or earlier test
    query = """query { userStatsSessions { id wpm accuracy } }"""
    response = await graphql_query_fixture(query, None)
    assert response.status_code == 200
    json_data = response.json()
    assert "errors" not in json_data
    assert isinstance(json_data["data"]["userStatsSessions"], list)


@pytest.mark.anyio
async def test_get_stats_session_by_id(graphql_query_fixture, test_users):
    # First create one to retrieve
    mutation = """
        mutation CreateStatsSession($userStatsSessionInput: UserStatsSessionInput!) {
            createUserStatsSession(userStatsSessionInput: $userStatsSessionInput) {
                id
                wpm
            }
        }
    """
    variables = {
        "userStatsSessionInput": {
            "userId": str(test_users[0].id),
            "wpm": 90,
            "accuracy": 99,
            "practiceDuration": 10000
        }
    }
    res = await graphql_query_fixture(mutation, variables)
    session_id = res.json()["data"]["createUserStatsSession"]["id"]

    query = """
        query GetSession($sessionId: UUID!) {
            userStatsSession(sessionId: $sessionId) {
                id
                wpm
                accuracy
            }
        }
    """
    response = await graphql_query_fixture(query, {"sessionId": session_id})
    assert response.status_code == 200
    data = response.json()["data"]["userStatsSession"]
    assert data["id"] == session_id


@pytest.mark.anyio
async def test_update_stats_session(graphql_query_fixture, test_user_stats_sessions):
    # First create one
    create_mutation = """
        mutation CreateStatsSession($userStatsSessionInput: UserStatsSessionInput!) {
            createUserStatsSession(userStatsSessionInput: $userStatsSessionInput) {
                id
                wpm
            }
        }
    """
    variables = {
        "userStatsSessionInput": {
            "userId": str(test_user_stats_sessions[0].user_id),
            "wpm": 55,
            "accuracy": 85,
            "practiceDuration": 60000
        }
    }
    res = await graphql_query_fixture(create_mutation, variables)
    session_id = res.json()["data"]["createUserStatsSession"]["id"]

    update_mutation = """
        mutation UpdateSession($sessionId: UUID!, $userStatsSessionInput: UserStatsSessionUpdateInput!) {
            updateUserStatsSession(sessionId: $sessionId, userStatsSessionInput: $userStatsSessionInput) {
                id
                wpm
                accuracy
            }
        }
    """
    update_vars = {
        "sessionId": session_id,
        "userStatsSessionInput": {
            "wpm": 70,
            "accuracy": 95
        }
    }
    res = await graphql_query_fixture(update_mutation, update_vars)
    assert res.status_code == 200
    data = res.json()["data"]["updateUserStatsSession"]
    assert data["wpm"] == 70
    assert data["accuracy"] == 95


@pytest.mark.anyio
async def test_delete_stats_session(graphql_query_fixture, test_users):
    # Create first
    mutation = """
        mutation CreateStatsSession($userStatsSessionInput: UserStatsSessionInput!) {
            createUserStatsSession(userStatsSessionInput: $userStatsSessionInput) {
                id
            }
        }
    """
    variables = {
        "userStatsSessionInput": {
            "userId": str(test_users[0].id),
            "wpm": 100,
            "accuracy": 100,
            "practiceDuration": 5000
        }
    }
    res = await graphql_query_fixture(mutation, variables)
    session_id = res.json()["data"]["createUserStatsSession"]["id"]

    delete_mutation = """
        mutation DeleteSession($sessionId: UUID!) {
            deleteUserStatsSession(sessionId: $sessionId)
        }
    """
    del_res = await graphql_query_fixture(delete_mutation, {"sessionId": session_id})
    assert del_res.status_code == 200
    assert del_res.json()["data"]["deleteUserStatsSession"] is True

    # Confirm deletion
    query = """
        query GetSession($sessionId: UUID!) {
            userStatsSession(sessionId: $sessionId) {
                id
            }
        }
    """
    check = await graphql_query_fixture(query, {"sessionId": session_id})
    assert check.status_code == 200
    assert check.json()["data"]["userStatsSession"] is None
