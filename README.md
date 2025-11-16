# GoldCoin

A personal finance management application that helps track expenses, manage budgets, and provides AI-powered spending insights.


## Screenshots

### Login Page
![Login](./public/login.png)

### Dashboard
![Dashboard](./public/dashobard.png)

### Analytics
![Analytics](./public/analytic.png)

### AI Advisor
![AI Advisor](./public/ai.png)


## Overview

This project is organized as a monorepo with separate frontend and backend applications:

- **Frontend**: Next.js application located in `apps/web/`
- **Backend**: FastAPI service located in `apps/api/`

## Tech Stack

### Frontend
- Next.js 16 (App Router)
- TypeScript 5
- Tailwind CSS v4
- Shadcn UI components
- Zustand (state management)
- React Hook Form + Zod validation

### Backend
- FastAPI 0.104.1
- Python 3.11
- PostgreSQL with SQLAlchemy 2.0
- JWT authentication
- Pydantic v2 for validation
- Celery for background tasks

## Core Features

- ✅ **Complete Onboarding System** - 6-step guided setup for new users
- ✅ **Expense Tracking** - Full CRUD with categorization and filtering
- ✅ **Budget Management** - Category-wise budgets with real-time tracking
- ✅ **Budget Tracker** - Visual progress bars and overspending alerts
- ✅ **AI-Powered Predictions** - Spending forecasts with confidence scores
- ✅ **AI Financial Advisor** - Interactive chat interface for financial advice
- ✅ **Financial Analytics** - Charts, trends, and category breakdowns
- ✅ **Secure Authentication** - JWT-based with refresh tokens
- ✅ **User Profile Management** - Settings, preferences, currency selection
- ✅ **Responsive Design** - Mobile-first, works on all devices
- ✅ **Professional UI** - Modern design with shadcn/ui components

## Getting Started

### Prerequisites

Ensure you have the following installed:
- Node.js 18 or higher
- Python 3.11 or higher
- PostgreSQL 14+
- Redis (for Celery)

### Frontend Setup

```bash
cd apps/web
npm install

# Copy environment template
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Backend Setup

```bash
cd apps/api

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env
```

Edit `.env` with your configuration:
```
DATABASE_URL=postgresql://user:password@localhost/goldcoin_db
SECRET_KEY=your-secret-key-here
REDIS_URL=redis://localhost:6379
```

Initialize the database:
```bash
# Create database
createdb goldcoin_db

# Run migrations (in order)
cd apps/api
psql goldcoin_db < migrations/001_init_schema.sql
psql goldcoin_db < migrations/002_add_indexes.sql
psql goldcoin_db < migrations/003_add_onboarding.sql
```

Start the API server:
```bash
chmod +x start.sh
./start.sh
```

API documentation will be available at `http://localhost:8000/docs`

### Starting Celery Worker

In a separate terminal:
```bash
cd apps/api
source venv/bin/activate
chmod +x start_celery.sh
./start_celery.sh
```

## Project Structure

```
apps/
├── web/              Frontend application
│   ├── app/          Next.js pages and layouts
│   ├── src/
│   │   ├── components/  React components
│   │   ├── services/    API client services
│   │   ├── types/       TypeScript definitions
│   │   ├── utils/       Helper functions
│   │   └── providers/   Context providers
│   └── public/       Static assets
│
└── api/              Backend application
    ├── app/
    │   ├── api/      Route handlers
    │   ├── core/     Configuration
    │   ├── crud/     Database operations
    │   ├── models/   SQLAlchemy models
    │   ├── schemas/  Pydantic schemas
    │   └── services/ Business logic
    └── migrations/   Database migrations
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Create new account
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user

### Users
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update user profile
- `DELETE /api/v1/users/me` - Delete account

### Onboarding
- `POST /api/v1/onboarding/profile` - Save profile setup
- `POST /api/v1/onboarding/financial` - Save financial setup
- `POST /api/v1/onboarding/budgets` - Save budgets
- `POST /api/v1/onboarding/goals` - Save financial goals
- `POST /api/v1/onboarding/complete` - Complete onboarding
- `GET /api/v1/onboarding/status` - Get onboarding status

### Expenses
- `GET /api/v1/expenses/` - List expenses (with filters)
- `POST /api/v1/expenses/` - Create new expense
- `GET /api/v1/expenses/{id}` - Get expense details
- `PUT /api/v1/expenses/{id}` - Update expense
- `DELETE /api/v1/expenses/{id}` - Delete expense

### Budgets
- `GET /api/v1/budgets/` - List all budgets
- `POST /api/v1/budgets/` - Create budget
- `GET /api/v1/budgets/{id}` - Get budget details
- `PUT /api/v1/budgets/{id}` - Update budget
- `DELETE /api/v1/budgets/{id}` - Delete budget
- `GET /api/v1/budgets/status` - Get budget status with spending

### Predictions
- `GET /api/v1/predictions/` - Get spending forecasts
- `GET /api/v1/predictions/{id}` - Get prediction details

### AI
- `POST /api/v1/ai/chat` - AI advisor chat
- `GET /api/v1/ai/advice` - Get financial advice

## Development Commands

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Backend
```bash
./start.sh           # Start FastAPI server
./start_celery.sh    # Start Celery worker
pytest               # Run tests
```

## Database Schema

**Users**
- id, email, hashed_password, full_name, is_active, is_superuser, is_onboarded, currency, theme, created_at, updated_at

**User Profiles** (Onboarding)
- id, user_id, currency, theme, created_at, updated_at

**Financial Setups** (Onboarding)
- id, user_id, current_savings, monthly_income, created_at, updated_at

**Recurring Expenses** (Onboarding)
- id, financial_setup_id, name, amount, created_at

**User Goals** (Onboarding)
- id, user_id, title, target_amount, target_date, is_completed, created_at, updated_at

**Expenses**
- id, user_id, amount, category, description, date, recurring, tags, created_at, updated_at

**Budgets**
- id, user_id, category, limit_amount, month, created_at, updated_at

**Spending Predictions**
- id, user_id, category, predicted_amount, confidence_score, month, created_at

## Deployment

### Frontend (Vercel)
```bash
npm i -g vercel
vercel
```

### Backend (Docker)
```bash
docker build -t finance-api -f docker/Dockerfile.backend ./apps/api
docker run -p 8000:8000 finance-api
```

Or use docker-compose:
```bash
docker-compose up
```

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@localhost/goldcoin_db
SECRET_KEY=your-secret-key
REDIS_URL=redis://localhost:6379
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Testing

Frontend tests:
```bash
cd apps/web
npm test
```

Backend tests:
```bash
cd apps/api
pytest tests/
```



## Documentation

Additional documentation can be found in the `docs/` directory:
- Frontend setup and structure
- Backend API details
- Deployment guides
- Troubleshooting

## License

MIT License - see LICENSE file for details.

## Support

For issues or questions, please open an issue on GitHub.
