-- Migration: Add onboarding support
-- Description: Adds onboarding fields to users table and creates onboarding-related tables

-- Add onboarding fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS theme VARCHAR(20) DEFAULT 'system';

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    currency VARCHAR(10) DEFAULT 'USD',
    theme VARCHAR(20) DEFAULT 'system',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create financial_setups table
CREATE TABLE IF NOT EXISTS financial_setups (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_savings FLOAT DEFAULT 0.0,
    monthly_income FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create recurring_expenses table
CREATE TABLE IF NOT EXISTS recurring_expenses (
    id SERIAL PRIMARY KEY,
    financial_setup_id INTEGER NOT NULL REFERENCES financial_setups(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    amount FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_goals table
CREATE TABLE IF NOT EXISTS user_goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    target_amount FLOAT NOT NULL,
    target_date TIMESTAMP NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_setups_user_id ON financial_setups(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_financial_setup_id ON recurring_expenses(financial_setup_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_is_completed ON user_goals(is_completed);

-- Add comment to tables
COMMENT ON TABLE user_profiles IS 'Stores user profile information from onboarding';
COMMENT ON TABLE financial_setups IS 'Stores user financial setup from onboarding';
COMMENT ON TABLE recurring_expenses IS 'Stores recurring expenses from onboarding';
COMMENT ON TABLE user_goals IS 'Stores user financial goals from onboarding';

