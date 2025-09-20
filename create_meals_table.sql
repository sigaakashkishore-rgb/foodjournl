
CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS meals (
  meal_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  meal_type VARCHAR(30),
  food_name VARCHAR(200) NOT NULL,
  quantity FLOAT DEFAULT 1,
  unit VARCHAR(30) DEFAULT 'serving',
  calories INT DEFAULT 0,
  protein FLOAT DEFAULT 0,
  carbs FLOAT DEFAULT 0,
  fat FLOAT DEFAULT 0,
  ayurvedic_tag VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
