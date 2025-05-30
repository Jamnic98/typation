valid_payload = {
    "user_name": "teebot",
    "first_name": "Tee",
    "last_name": "Bot",
    "email": "teebot@example.com",
}


def test_create_user(client):
    response = client.post("/users/", json=valid_payload)
    assert response.status_code == 201  # Created
    data = response.json()
    assert data["user_name"] == valid_payload["user_name"]
    assert data["email"] == valid_payload["email"]
    assert "id" in data


def test_create_user_duplicate_email(client):
    payload = valid_payload.copy()
    payload["email"] = "duplicate@example.com"

    # First create should succeed
    response1 = client.post("/users/", json=payload)
    assert response1.status_code == 201

    # Second create with same email should fail
    response2 = client.post("/users/", json=payload)
    assert response2.status_code == 400
    assert response2.json()["detail"] == "Email already exists"


def test_get_user_by_id(client, seed_db):
    user = seed_db[0]
    response = client.get(f"/users/{user.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == user.id
    assert data["user_name"] == user.user_name


def test_get_user_by_invalid_id(client):
    response = client.get("/users/99999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_get_all_users(client, seed_db):
    response = client.get("/users/")
    assert response.status_code == 200
    users = response.json()
    assert isinstance(users, list)
    assert len(users) >= len(seed_db)  # At least seeded users present


def test_update_user_by_id(client, seed_db):
    user = seed_db[0]
    updated_payload = {
        "first_name": "Updated",
        "last_name": "Name"
    }
    update_response = client.put(f"/users/{user.id}", json=updated_payload)
    assert update_response.status_code == 200
    data = update_response.json()
    assert data["first_name"] == "Updated"
    assert data["last_name"] == "Name"


def test_update_nonexistent_user(client):
    response = client.put("/users/99999", json={"first_name": "Ghost"})
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

def test_delete_user_by_id(client, seed_db):
    user = seed_db[0]
    delete_response = client.delete(f"/users/{user.id}")
    assert delete_response.status_code == 200
    assert str(user.id) in delete_response.json()["message"]

    # Confirm deletion
    follow_up = client.get(f"/users/{user.id}")
    assert follow_up.status_code == 404


def test_delete_nonexistent_user(client):
    response = client.delete("/users/99999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
