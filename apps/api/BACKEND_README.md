# AI Finance Assistant Backend

A professional, production-ready FastAPI backend for personal finance management with AI capabilities.

## 🏗️ Architecture

This backend follows a clean, professional architecture with clear separation of concerns:

```
backend/
├── app/                          # Main application package
│   ├── __init__.py              # Package initialization
│   ├── api/                     # API layer
│   │   ├── __init__.py         
│   │   └── v1/                  # API version 1
│   │       ├── __init__.py      # API router setup
│   │       ├── auth.py          # Authentication endpoints
│   │       ├── users.py         # User management endpoints
│   │       ├── expenses.py      # Expense management endpoints
│   │       ├── budgets.py       # Budget management endpoints
│   │       ├── predictions.py   # Prediction endpoints
│   │       └── onboarding.py    # Onboarding endpoints
│   ├── core/                    # Core application logic
│   │   ├── __init__.py
│   │   ├── config.py            # Application configuration
│   │   └── security.py          # Security utilities (JWT, hashing)
│   ├── crud/                    # Database CRUD operations
│   │   ├── __init__.py
│   │   ├── base.py              # Base CRUD class
│   │   ├── user.py              # User CRUD operations
│   │   ├── expense.py           # Expense CRUD operations
│   │   ├── budget.py            # Budget CRUD operations
│   │   ├── prediction.py        # Prediction CRUD operations
│   │   └── onboarding.py        # Onboarding CRUD operations
│   ├── db/                      # Database configuration
│   │   ├── __init__.py
│   │   └── session.py           # Database session management
│   ├── models/                  # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py              # User model
│   │   ├── expense.py           # Expense model and categories
│   │   ├── budget.py            # Budget model
│   │   ├── prediction.py        # Prediction model
│   │   └── onboarding.py         # Onboarding models (UserProfile, FinancialSetup, etc.)
│   ├── schemas/                 # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── auth.py              # Authentication schemas
│   │   ├── user.py              # User schemas
│   │   ├── expense.py           # Expense schemas
│   │   ├── budget.py            # Budget schemas
│   │   ├── prediction.py        # Prediction schemas
│   │   └── onboarding.py         # Onboarding schemas
│   ├── services/                # Business logic layer
│   │   ├── __init__.py
│   │   └── auth_service.py      # Authentication service
│   └── utils/                   # Utility functions
│       ├── __init__.py
│       ├── logger.py            # Logging utilities
│       └── validators.py        # Validation utilities
├── main.py                      # FastAPI application entry point
├── requirements.txt             # Python dependencies
└── README.md                    # This file
```

## 🚀 Features

### Authentication & Security
- JWT-based authentication with refresh tokens
- Secure password hashing with bcrypt
- Role-based access control
- Request rate limiting
- CORS configuration
- Security headers middleware

### Database Management
- SQLAlchemy ORM with PostgreSQL
- Professional CRUD operations
- Database migration support with Alembic
- Connection pooling and optimization
- Relationship management

### API Design
- RESTful API design
- OpenAPI/Swagger documentation
- Request/response validation with Pydantic
- Error handling and logging
- API versioning support

### Monitoring & Logging
- Structured logging with rotation
- Request/response timing
- Error tracking with Sentry (optional)
- Health check endpoints

## 📦 Models

### User Model
- User authentication and profile management
- Secure password storage (bcrypt)
- Account status tracking (is_active, is_superuser, is_onboarded)
- User preferences (currency, theme)

### Expense Model
- Transaction recording with categories
- AI-suggested categorization
- Date and amount tracking

### Budget Model
- Monthly budget limits by category
- Budget vs actual tracking

### Prediction Model
- AI-generated spending predictions
- Confidence scoring
- Historical prediction tracking

### Onboarding Models
- **UserProfile** - Profile information from onboarding
- **FinancialSetup** - Current savings, monthly income
- **RecurringExpense** - Recurring expense entries
- **UserGoal** - Financial goals with target dates

## 🔧 Configuration

The application uses environment variables for configuration. Create a `.env` file:

```env
# Application
APP_NAME=AI Finance Assistant
APP_VERSION=1.0.0
DEBUG=True
ENVIRONMENT=development

# Database
DATABASE_URL=postgresql://finance_user:finance_password@localhost:5432/finance_assistant

# Security
SECRET_KEY=your-secret-key-change-in-production
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000

# Redis (for caching/background tasks)
REDIS_URL=redis://localhost:6379/0

# OpenAI (optional)
OPENAI_API_KEY=your-openai-api-key

# Monitoring (optional)
SENTRY_DSN=your-sentry-dsn
```

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- PostgreSQL 12+
- Redis 6+ (optional, for background tasks)

### Installation

1. **Clone and setup virtual environment:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Set up environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Initialize database:**
```bash
# Make sure PostgreSQL is running
# Create database: finance_assistant
# Run migrations if needed
```

5. **Start the application:**
```bash
# Development
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 📚 API Documentation

Once the server is running, visit:
- **Interactive docs:** http://localhost:8000/api/v1/docs
- **ReDoc:** http://localhost:8000/api/v1/redoc
- **OpenAPI JSON:** http://localhost:8000/api/v1/openapi.json

## 🔐 Authentication Flow

1. **Register:** `POST /api/v1/auth/register`
2. **Login:** `POST /api/v1/auth/login`
3. **Use token:** Include `Authorization: Bearer <token>` header
4. **Refresh:** `POST /api/v1/auth/refresh`

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user info

### Users
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update current user profile
- `DELETE /api/v1/users/me` - Delete current user account

### Onboarding
- `POST /api/v1/onboarding/profile` - Save user profile setup
- `POST /api/v1/onboarding/financial` - Save financial setup (savings, income, recurring expenses)
- `POST /api/v1/onboarding/budgets` - Save category budgets
- `POST /api/v1/onboarding/goals` - Save financial goals
- `POST /api/v1/onboarding/complete` - Mark onboarding as complete
- `GET /api/v1/onboarding/status` - Get onboarding status

### Expenses
- `GET /api/v1/expenses/` - List user expenses (with filters)
- `POST /api/v1/expenses/` - Create new expense
- `GET /api/v1/expenses/{id}` - Get specific expense
- `PUT /api/v1/expenses/{id}` - Update expense
- `DELETE /api/v1/expenses/{id}` - Delete expense
- `GET /api/v1/expenses/stats/monthly` - Monthly statistics

### Budgets
- `GET /api/v1/budgets/` - List user budgets
- `POST /api/v1/budgets/` - Create new budget
- `GET /api/v1/budgets/{id}` - Get specific budget
- `PUT /api/v1/budgets/{id}` - Update budget
- `DELETE /api/v1/budgets/{id}` - Delete budget
- `GET /api/v1/budgets/status` - Get budget status with spending vs limits

### Predictions
- `GET /api/v1/predictions/` - List user predictions
- `GET /api/v1/predictions/{id}` - Get specific prediction
- `DELETE /api/v1/predictions/{id}` - Delete prediction

## 🧪 Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_auth.py
```

## 🔍 Code Quality

```bash
# Format code
black app/

# Lint code
flake8 app/

# Type checking
mypy app/
```

## 🐳 Docker Support

The application is designed to work with the existing Docker setup:

```bash
# Build and run with docker-compose
docker-compose up -d backend

# View logs
docker-compose logs -f backend
```

## 📝 Development Guidelines

### Code Style
- Follow PEP 8 guidelines
- Use type hints throughout
- Maintain comprehensive docstrings
- Keep functions small and focused

### Error Handling
- Use appropriate HTTP status codes
- Provide meaningful error messages
- Log errors appropriately
- Handle edge cases gracefully

### Security
- Validate all inputs
- Use parameterized queries
- Implement proper authentication
- Follow security best practices

## 🤝 Contributing

1. Follow the established architecture patterns
2. Add tests for new functionality
3. Update documentation as needed
4. Follow the code style guidelines
5. Use meaningful commit messages

## 📄 License

This project is part of the AI Finance Assistant application.