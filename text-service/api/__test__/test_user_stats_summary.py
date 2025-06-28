import pytest


@pytest.mark.anyio
async def test_create_user_stats_summary(graphql_query_fixture, test_users, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    mutation_create = """
        mutation CreateUserStatsSummary($userStatsSummary: UserStatsSummaryCreateInput!) {
            createUserStatsSummary(userStatsSummaryInput: $userStatsSummary) {
                userId
                totalSessions
                totalPracticeDuration
                averageWpm
                averageAccuracy
                bestWpm
                bestAccuracy
            }
        }
    """
    variables = {
        "userStatsSummary": {
            "userId": str(test_users[0].id),
            "totalSessions": 10,
            "totalPracticeDuration": 50000,
            "averageWpm": 70.5,
            "averageAccuracy": 92.0,
            "bestWpm": 90,
            "bestAccuracy": 98
        }
    }

    # Create first summary
    response = await graphql_query_fixture(mutation_create, variables, headers)
    assert response.status_code == 200
    data = response.json()
    assert "errors" not in data

    # Delete summary before creating again
    mutation_delete = """
        mutation {
            deleteUserStatsSummary
        }
    """
    del_resp = await graphql_query_fixture(mutation_delete, None, headers)
    assert del_resp.status_code == 200
    assert del_resp.json()["data"]["deleteUserStatsSummary"] is True

    # Create again (should succeed now)
    response2 = await graphql_query_fixture(mutation_create, variables, headers)
    assert response2.status_code == 200
    data2 = response2.json()
    assert "errors" not in data2
    assert data2["data"]["createUserStatsSummary"]["totalSessions"] == 10


@pytest.mark.anyio
async def test_get_all_user_stats_summaries(graphql_query_fixture, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    query = """
        query {
            userStatsSummaries {
                userId
                totalSessions
                averageWpm
                bestWpm
            }
        }
    """
    response = await graphql_query_fixture(query, None, headers)
    assert response.status_code == 200
    json_data = response.json()
    assert "errors" not in json_data
    assert isinstance(json_data["data"]["userStatsSummaries"], list)


@pytest.mark.anyio
async def test_get_user_stats_summary_by_user_id(graphql_query_fixture, test_users, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    # First create one to retrieve
    mutation = """
        mutation CreateUserStatsSummary($userStatsSummary: UserStatsSummaryCreateInput!) {
            createUserStatsSummary(userStatsSummaryInput: $userStatsSummary) {
                userId
                totalSessions
            }
        }
    """
    variables = {
        "userStatsSummary": {
            "userId": str(test_users[0].id),
            "totalSessions": 5,
            "totalPracticeDuration": 30000,
            "averageWpm": 65.0,
            "averageAccuracy": 90.0,
            "bestWpm": 85,
            "bestAccuracy": 95
        }
    }
    create_resp = await graphql_query_fixture(mutation, variables, headers)
    user_id = create_resp.json()["data"]["createUserStatsSummary"]["userId"]

    query = """
        query {
            userStatsSummary {
                userId
                totalSessions
                averageWpm
                bestWpm
            }
        }
    """
    response = await graphql_query_fixture(query, {"userId": user_id}, headers)
    assert response.status_code == 200
    data = response.json()["data"]["userStatsSummary"]
    assert data["userId"] == user_id


@pytest.mark.anyio
async def test_update_user_stats_summary(graphql_query_fixture, test_users, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    # Create first
    create_mutation = """
        mutation CreateUserStatsSummary($userStatsSummary: UserStatsSummaryCreateInput!) {
            createUserStatsSummary(userStatsSummaryInput: $userStatsSummary) {
                userId
                totalSessions
                averageWpm
            }
        }
    """
    variables = {
        "userStatsSummary": {
            "userId": str(test_users[0].id),
            "totalSessions": 3,
            "totalPracticeDuration": 20000,
            "averageWpm": 60.0,
            "averageAccuracy": 88.0,
            "bestWpm": 80,
            "bestAccuracy": 90
        }
    }
    create_res = await graphql_query_fixture(create_mutation, variables, headers)
    user_id = create_res.json()["data"]["createUserStatsSummary"]["userId"]

    update_mutation = """
        mutation UpdateUserStatsSummary($userStatsSummary: UserStatsSummaryUpdateInput!) {
            updateUserStatsSummary(userStatsSummaryInput: $userStatsSummary) {
                userId
                totalSessions
                averageWpm
            }
        }
    """
    update_vars = {
        "userStatsSummary": {
            "userId": user_id,
            "totalSessions": 7,
            "averageWpm": 75.0
        }
    }
    update_res = await graphql_query_fixture(update_mutation, update_vars, headers)
    assert update_res.status_code == 200
    data = update_res.json()["data"]["updateUserStatsSummary"]
    assert data["totalSessions"] == 7
    assert data["averageWpm"] == 75.0


@pytest.mark.anyio
async def test_delete_user_stats_summary(graphql_query_fixture, test_users, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    # Create first
    mutation = """
        mutation CreateUserStatsSummary($userStatsSummary: UserStatsSummaryCreateInput!) {
            createUserStatsSummary(userStatsSummaryInput: $userStatsSummary) {
                userId
            }
        }
    """
    variables = {
        "userStatsSummary": {
            "userId": str(test_users[0].id),
            "totalSessions": 4,
            "totalPracticeDuration": 25000,
            "averageWpm": 62.0,
            "averageAccuracy": 89.0,
            "bestWpm": 82,
            "bestAccuracy": 91
        }
    }
    create_res = await graphql_query_fixture(mutation, variables, headers)
    user_id = create_res.json()["data"]["createUserStatsSummary"]["userId"]

    delete_mutation = """
        mutation {
            deleteUserStatsSummary
        }
    """
    del_res = await graphql_query_fixture(delete_mutation, {"userId": user_id}, headers)
    assert del_res.status_code == 200
    assert del_res.json()["data"]["deleteUserStatsSummary"] is True

    # Confirm deletion
    query = """
        query {
            userStatsSummary {
                userId
            }
        }
    """
    check = await graphql_query_fixture(query, {"userId": user_id}, headers)
    assert check.status_code == 200
    assert check.json()["data"]["userStatsSummary"] is None
