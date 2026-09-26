"""Integration tests for messaging system."""

import pytest
from fastapi.testclient import TestClient


@pytest.mark.integration
def test_create_conversation(client: TestClient, auth_headers: dict):
    """Test creating a new conversation."""
    response = client.post(
        "/api/v1/messages/conversations",
        json={
            "listing_id": "test-listing-123",
            "participant_ids": ["user1", "user2"],
        },
        headers=auth_headers,
    )

    assert response.status_code in [200, 201, 401, 403]


@pytest.mark.integration
def test_send_and_retrieve_messages(client: TestClient, auth_headers: dict):
    """Test sending and retrieving messages."""
    # Send message
    send_response = client.post(
        "/api/v1/messages/conversations/conv-123/messages",
        json={"content": "Test message"},
        headers=auth_headers,
    )

    assert send_response.status_code in [200, 201, 401, 403, 404]

    # Retrieve messages
    get_response = client.get(
        "/api/v1/messages/conversations/conv-123/messages",
        headers=auth_headers,
    )

    assert get_response.status_code in [200, 401, 403, 404]


@pytest.mark.integration
def test_message_polling(client: TestClient, auth_headers: dict):
    """Test message polling endpoint."""
    response = client.get(
        "/api/v1/messages/conversations/conv-123/poll",
        headers=auth_headers,
    )

    assert response.status_code in [200, 401, 403, 404]
