const pool = require('../config/db');

const getMeals = async (userId) => {
  const query = 'SELECT * FROM meals WHERE user_id = $1 ORDER BY created_at DESC';
  const result = await pool.query(query, [userId]);
  return result.rows;
};

const addMeal = async (userId, mealData) => {
  const { name, calories, macros, ayurvedic_tags } = mealData;
  const query = 'INSERT INTO meals (user_id, name, calories, macros, ayurvedic_tags) VALUES ($1, $2, $3, $4, $5) RETURNING *';
  const result = await pool.query(query, [userId, name, calories, macros, ayurvedic_tags]);
  return result.rows[0];
};

module.exports = { getMeals, addMeal };
