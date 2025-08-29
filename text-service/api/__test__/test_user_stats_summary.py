import pytest


@pytest.mark.asyncio
async def test_create_user_stats_summary(graphql_query_fixture, test_users, auth_token):
    user_id = str(test_users[0].id)
    fastest_wpm = 90
    headers = {"Authorization": f"Bearer {auth_token}"}
    mutation_create = """
        mutation CreateUserStatsSummary($userStatsSummary: UserStatsSummaryCreateInput!) {
            createUserStatsSummary(inputData: $userStatsSummary) {
                userId
                fastestWpm
            }
        }
    """
    variables = {
        "userStatsSummary": {
            "totalSessions": 10,
            "totalPracticeDuration": 50000,
            "averageWpm": 70.5,
            "averageAccuracy": 92.0,
            "fastestWpm": fastest_wpm,
            "unigraphs": [
                {"key": "z", "accuracy": 92, "count": 4, "mistyped": []}
            ],
            "digraphs": [
                {"key": "ab", "meanInterval": 222, "accuracy": 88, "count": 11}
            ]
        }
    }

    # Create first summary
    response = await graphql_query_fixture(mutation_create, variables, headers)
    assert response.status_code == 200
    data = response.json()
    assert "errors" not in data
    assert data["data"]["createUserStatsSummary"]["userId"] == user_id
    assert data["data"]["createUserStatsSummary"]["fastestWpm"] == fastest_wpm


@pytest.mark.asyncio
async def test_get_user_stats_summary_by_user_id(graphql_query_fixture, test_users, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    mutation = """
        mutation CreateUserStatsSummary($userStatsSummary: UserStatsSummaryCreateInput!) {
            createUserStatsSummary(inputData: $userStatsSummary) {
                totalSessions
                averageWpm
                fastestWpm
            }
        }
    """
    variables = {
        "userStatsSummary": {
            "totalSessions": 5,
            "totalPracticeDuration": 30000,
            "averageWpm": 65.0,
            "averageAccuracy": 90.0,
            "fastestWpm": 85,
        }
    }

    response = await graphql_query_fixture(mutation, variables, headers)
    assert response.status_code == 200

    query = """
        query {
          userStatsSummary {
            totalSessions
            averageWpm
            fastestWpm
          }
        }
    """
    response = await graphql_query_fixture(query, None, headers)
    assert response.status_code == 200
    data = response.json()["data"]["userStatsSummary"]

    # Assert that the userId in the returned stats matches the created userId
    assert data["totalSessions"] == 5
    assert data["averageWpm"] == 65.0
    assert data["fastestWpm"] == 85
