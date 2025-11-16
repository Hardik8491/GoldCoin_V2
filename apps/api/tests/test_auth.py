import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, get_db
from main import app
from schemas import UserCreate

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_signup():
    response = client.post(
        "/api/v1/auth/signup",
        json={
            "email": "test@example.com",
            "password": "testpassword123",
            "full_name": "Test User"
        }
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_signup_duplicate_email():
    client.post(
        "/api/v1/auth/signup",
        json={
            "email": "test@example.com",
            "password": "testpassword123",
            "full_name": "Test User"
        }
    )
    response = client.post(
        "/api/v1/auth/signup",
        json={
            "email": "test@example.com",
            "password": "testpassword123",
            "full_name": "Test User"
        }
    )
    assert response.status_code == 400

def test_login():
    client.post(
        "/api/v1/auth/signup",
        json={
            "email": "login@example.com",
            "password": "testpassword123",
            "full_name": "Test User"
        }
    )
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "login@example.com", "password": "testpassword123"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_invalid_credentials():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "nonexistent@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401
