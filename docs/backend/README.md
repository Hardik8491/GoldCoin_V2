# Backend API Documentation

## Overview

The backend is built with FastAPI and provides RESTful APIs for the finance management application.

## Project Structure

```
app/
├── api/          API route handlers
│   └── v1/       Version 1 endpoints
├── core/         Configuration and security
├── crud/         Database operations
├── db/           Database connection
├── models/       SQLAlchemy models
├── schemas/      Pydantic schemas
└── services/     Business logic
```

## Database Models

### User Model
```python
class User(Base):
    id: UUID
    email: str (unique)
    password_hash: str
    name: str
    created_at: datetime
    updated_at: datetime
```

### Expense Model
```python
class Expense(Base):
    id: UUID
    user_id: UUID (foreign key)
    amount: Decimal
    category: str
    description: str
    date: date
    created_at: datetime
```

### Budget Model
```python
class Budget(Base):
    id: UUID
    user_id: UUID (foreign key)
    category: str
    limit_amount: Decimal
    month: str
    created_at: datetime
```

### Prediction Model
```python
class Prediction(Base):
    id: UUID
    user_id: UUID (foreign key)
    predicted_amount: Decimal
    category: str
    confidence_score: float
    month: str
    created_at: datetime
```

## API Endpoints

### Authentication

**POST /api/auth/signup**
```json
Request:
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}

Response:
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe"
}
```

**POST /api/auth/login**
```json
Request:
{
  "email": "user@example.com",
  "password": "securepassword"
}

Response:
{
  "access_token": "jwt_token_here",
  "token_type": "bearer"
}
```

### Expenses

**GET /api/expenses/**

Query Parameters:
- `skip`: int (default: 0)
- `limit`: int (default: 100)
- `category`: str (optional)
- `start_date`: date (optional)
- `end_date`: date (optional)

Headers:
- `Authorization: Bearer {token}`

Response:
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "amount": 50.00,
    "category": "food",
    "description": "Lunch",
    "date": "2025-01-15",
    "created_at": "2025-01-15T12:00:00Z"
  }
]
```

**POST /api/expenses/**
```json
Request:
{
  "amount": 50.00,
  "category": "food",
  "description": "Lunch",
  "date": "2025-01-15"
}

Response:
{
  "id": "uuid",
  "user_id": "uuid",
  "amount": 50.00,
  "category": "food",
  "description": "Lunch",
  "date": "2025-01-15",
  "created_at": "2025-01-15T12:00:00Z"
}
```

**PUT /api/expenses/{expense_id}**
```json
Request:
{
  "amount": 55.00,
  "category": "food",
  "description": "Lunch (updated)",
  "date": "2025-01-15"
}
```

**DELETE /api/expenses/{expense_id}**

Response: 204 No Content

### Budgets

**GET /api/budgets/**

Returns all budgets for the authenticated user.

**POST /api/budgets/**
```json
Request:
{
  "category": "food",
  "limit_amount": 500.00,
  "month": "2025-01"
}
```

**PUT /api/budgets/{budget_id}**
**DELETE /api/budgets/{budget_id}**

### Predictions

**GET /api/predictions/**

Returns spending predictions for the authenticated user.

Response:
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "predicted_amount": 450.00,
    "category": "food",
    "confidence_score": 0.85,
    "month": "2025-02",
    "created_at": "2025-01-15T12:00:00Z"
  }
]
```

## Authentication

All endpoints except `/auth/signup` and `/auth/login` require JWT authentication.

### Getting a Token

1. Register or login via `/api/auth/login`
2. Receive JWT token in response
3. Include token in subsequent requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expiration

Tokens expire after 30 minutes by default (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`).

## CRUD Operations

All CRUD operations are located in `app/crud/` and follow a consistent pattern:

```python
# Get single record
expense = crud.expense.get(db, id=expense_id, user_id=current_user.id)

# Get multiple records
expenses = crud.expense.get_multi(db, user_id=current_user.id, skip=0, limit=100)

# Create record
expense = crud.expense.create(db, obj_in=expense_create, user_id=current_user.id)

# Update record
expense = crud.expense.update(db, db_obj=expense, obj_in=expense_update)

# Delete record
crud.expense.remove(db, id=expense_id, user_id=current_user.id)
```

## Error Handling

The API returns standard HTTP status codes:

- `200 OK` - Successful GET/PUT request
- `201 Created` - Successful POST request
- `204 No Content` - Successful DELETE request
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource doesn't exist
- `422 Unprocessable Entity` - Validation error
- `500 Internal Server Error` - Server error

Error Response Format:
```json
{
  "detail": "Error message here"
}
```

## Validation

All request/response data is validated using Pydantic schemas in `app/schemas/`.

Example:
```python
class ExpenseCreate(BaseModel):
    amount: Decimal
    category: str
    description: str
    date: date

    class Config:
        from_attributes = True
```

## Database Queries

### Filtering Expenses
```python
expenses = db.query(Expense).filter(
    Expense.user_id == user_id,
    Expense.category == category,
    Expense.date >= start_date,
    Expense.date <= end_date
).all()
```

### Aggregations
```python
total = db.query(func.sum(Expense.amount)).filter(
    Expense.user_id == user_id,
    Expense.category == category
).scalar()
```

## Background Tasks (Celery)

Celery tasks are defined in `app/services/`:

```python
@celery_app.task
def generate_predictions(user_id: str):
    # Generate spending predictions
    pass

@celery_app.task
def check_budget_alerts(user_id: str):
    # Check if user exceeded budget
    pass
```

Schedule tasks:
```python
celery_app.conf.beat_schedule = {
    'check-budgets-hourly': {
        'task': 'check_budget_alerts',
        'schedule': 3600.0,  # Every hour
    }
}
```

## Testing

Run tests with pytest:

```bash
cd apps/api
pytest tests/

# With coverage
pytest --cov=app tests/
```

Example test:
```python
def test_create_expense(client, auth_headers):
    response = client.post(
        "/api/expenses/",
        json={
            "amount": 50.00,
            "category": "food",
            "description": "Lunch",
            "date": "2025-01-15"
        },
        headers=auth_headers
    )
    assert response.status_code == 201
    assert response.json()["amount"] == 50.00
```

## Configuration

Configuration is managed in `app/core/config.py`:

```python
class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REDIS_URL: str
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]
    
    class Config:
        env_file = ".env"
```

## Development

### Adding New Endpoints

1. Define Pydantic schema in `app/schemas/`
2. Create database model in `app/models/`
3. Implement CRUD operations in `app/crud/`
4. Create route handler in `app/api/v1/`
5. Register route in `app/api/v1/__init__.py`

### Running Migrations

```bash
# Create migration
alembic revision -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- SQL injection prevention via SQLAlchemy ORM
- CORS configured via `ALLOWED_ORIGINS`
- Input validation with Pydantic
- Rate limiting (recommended for production)

## Performance

- Database connection pooling enabled
- Indexes on frequently queried columns
- Async/await for I/O operations
- Query result caching with Redis (optional)

## Interactive API Documentation

FastAPI provides automatic interactive documentation:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
