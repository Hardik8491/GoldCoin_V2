-- Production indexes for query performance
CREATE INDEX IF NOT EXISTS idx_expenses_user_date 
ON expenses(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_expenses_category 
ON expenses(category);

CREATE INDEX IF NOT EXISTS idx_predictions_user_month 
ON predictions(user_id, month);

CREATE INDEX IF NOT EXISTS idx_users_email 
ON users(email UNIQUE);
