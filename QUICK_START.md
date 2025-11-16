# Quick Start Guide

Get GoldCoin running on your local machine in under 10 minutes.

## Step 1: Clone and Install

```bash
# Navigate to project directory
cd AI_FINANCE_ASSISTENT

# Install frontend dependencies
cd apps/web
npm install

# Install backend dependencies
cd ../api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Step 2: Set Up Database

```bash
# Create PostgreSQL database
createdb finance_db

# Run migrations (in order)
cd apps/api
psql finance_db < migrations/001_init_schema.sql
psql finance_db < migrations/002_add_indexes.sql
psql finance_db < migrations/003_add_onboarding.sql
```

## Step 3: Configure Environment

**Frontend** (`apps/web/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend** (`apps/api/.env`):
```
DATABASE_URL=postgresql://postgres:password@localhost/goldcoin_db
SECRET_KEY=change-this-to-a-random-secret-key
REDIS_URL=redis://localhost:6379
```

## Step 4: Start Services

### Terminal 1 - Backend API
```bash
cd apps/api
source venv/bin/activate
./start.sh
```

### Terminal 2 - Frontend
```bash
cd apps/web
npm run dev
```

### Terminal 3 - Celery Worker (optional)
```bash
cd apps/api
source venv/bin/activate
./start_celery.sh
```

## Step 5: Access Application

- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs
- **API**: http://localhost:8000

## Using Monorepo Scripts

From the project root, you can use these commands:

```bash
# Start both frontend and backend
npm run dev

# Start only frontend
npm run dev:web

# Start only backend
npm run dev:api

# Build for production
npm run build

# Run tests
npm run test
```

## Troubleshooting

**Port already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

**Database connection failed:**
- Verify PostgreSQL is running: `pg_isready`
- Check credentials in `.env` file
- Ensure database exists: `psql -l | grep goldcoin_db`

**Module not found:**
- Re-run `npm install` in `apps/web`
- Re-run `pip install -r requirements.txt` in `apps/api`

**Redis connection error:**
- Start Redis: `redis-server`
- Or disable Celery for now (it's optional for basic usage)

## Next Steps

1. **Create an account** at http://localhost:3000/auth/signup
2. **Complete onboarding** - You'll be guided through:
   - Profile setup (name, currency, theme)
   - Financial snapshot (savings, income, recurring expenses)
   - Budget setup (category-wise limits)
   - Financial goals (optional)
3. **Explore the dashboard** - View your financial overview
4. **Add expenses** - Start tracking your spending
5. **Check analytics** - View charts and insights
6. **Try AI advisor** - Get personalized financial advice

## Key Features

- ✅ **Onboarding System** - Complete 6-step setup for new users
- ✅ **Budget Tracker** - Real-time budget monitoring with alerts
- ✅ **AI Advisor** - Chat with AI for financial advice
- ✅ **Analytics** - Visual charts and spending trends
- ✅ **Predictions** - AI-powered spending forecasts

For more detailed information, see the full documentation in the `docs/` directory.
