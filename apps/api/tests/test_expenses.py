# Expense endpoint tests
import pytest
from fastapi.testclient import TestClient
from main import app
from database import get_db

client = TestClient(app)

def test_create_expense(authenticated_client):
    response = authenticated_client.post(
        "/api/v1/expenses/",
        json={
            "amount": 50.00,
            "category": "Food",
            "description": "Lunch",
            "date": "2024-01-15"
        }
    )
    assert response.status_code == 201
    assert response.json()["category"] == "Food"

def test_list_expenses(authenticated_client):
    response = authenticated_client.get("/api/v1/expenses/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
