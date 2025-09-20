require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Pool } = require('pg');
const axios = require('axios');
const Joi = require('joi');

const app = express();

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Load env
const PORT = process.env.PORT || 4000;
const DATABASE_URL = process.env.DATABASE_URL;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000/analyze';

if (!DATABASE_URL) {
  console.warn('WARNING: DATABASE_URL not set in environment. Running without DB for demo.');
}

// Postgres pool
const pool = DATABASE_URL ? new Pool({ connectionString: DATABASE_URL, idleTimeoutMillis: 30000 }) : null;

if (pool) {
  pool.on('error', (err) => {
    console.error('Unexpected pg Pool error', err);
  });
}

// Validation schemas
const addMealSchema = Joi.object({
  user_id: Joi.number().integer().positive().required(),
  meal_type: Joi.string().max(50).default('other'),
  food_name: Joi.string().max(200).required(),
  quantity: Joi.number().positive().default(1),
  unit: Joi.string().max(50).default('serving')
});

// Helper: call AI microservice for nutrition; fallback to zeros/unknown
async function fetchNutrition(food_name, quantity = 1, unit = 'serving') {
  try {
    const res = await axios.post(AI_SERVICE_URL, { food_name, quantity, unit }, { timeout: 5000 });
    // expect: { calories, protein, carbs, fat, ayurvedic_tag }
    const d = res.data || {};
    return {
      calories: Number(d.calories || 0),
      protein: Number(d.protein || 0),
      carbs: Number(d.carbs || 0),
      fat: Number(d.fat || 0),
      ayurvedic_tag: d.ayurvedic_tag || 'unknown'
    };
  } catch (err) {
    console.warn('AI service call failed, using fallback nutrition. err=', err.message || err);
    return { calories: 0, protein: 0, carbs: 0, fat: 0, ayurvedic_tag: 'unknown' };
  }
}

/* ----------------- Routes ----------------- */

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' });
});

/*
  POST /api/meals
  body: { user_id, meal_type, food_name, quantity, unit }
*/
app.post('/api/meals', async (req, res) => {
  const { error, value } = addMealSchema.validate(req.body, { stripUnknown: true });
  if (error) return res.status(400).json({ error: error.details.map(d => d.message).join(', ') });

  const { user_id, meal_type, food_name, quantity, unit } = value;

  // get nutrition from AI microservice
  const nutrition = await fetchNutrition(food_name, quantity, unit);

  const sql = `
    INSERT INTO meals
      (user_id, meal_type, food_name, quantity, unit, calories, protein, carbs, fat, ayurvedic_tag)
    VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *;
  `;
  const params = [
    user_id, meal_type, food_name, quantity, unit,
    nutrition.calories, nutrition.protein, nutrition.carbs, nutrition.fat, nutrition.ayurvedic_tag
  ];

  try {
    const { rows } = await pool.query(sql, params);
    return res.status(201).json({ success: true, meal: rows[0] });
  } catch (err) {
    console.error('DB insert error', err);
    return res.status(500).json({ error: 'db_insert_failed' });
  }
});

/*
  GET /api/meals?user_id=1&limit=3
*/
app.get('/api/meals', async (req, res) => {
  const user_id = parseInt(req.query.user_id || '1', 10);
  const limit = Math.min(100, parseInt(req.query.limit || '50', 10));

  try {
    const q = 'SELECT * FROM meals WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2';
    const r = await pool.query(q, [user_id, limit]);
    res.json({ meals: r.rows });
  } catch (err) {
    console.error('DB select error', err);
    res.status(500).json({ error: 'db_select_failed' });
  }
});

/*
  GET /api/meals/:id
*/
app.get('/api/meals/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'invalid id' });
  try {
    const r = await pool.query('SELECT * FROM meals WHERE meal_id=$1', [id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'not_found' });
    res.json({ meal: r.rows[0] });
  } catch (err) {
    console.error('DB select error', err);
    res.status(500).json({ error: 'db_select_failed' });
  }
});

/*
  DELETE /api/meals/:id
*/
app.delete('/api/meals/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'invalid id' });
  try {
    await pool.query('DELETE FROM meals WHERE meal_id=$1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('DB delete error', err);
    res.status(500).json({ error: 'db_delete_failed' });
  }
});

/* 404 fallback */
app.use((req, res) => {
  res.status(404).json({ error: 'not_found' });
});

/* Global error handler */
app.use((err, req, res, next) => {
  console.error('Unhandled error', err);
  res.status(500).json({ error: 'internal_server_error' });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT} — DB=${DATABASE_URL ? 'connected' : 'missing'}`);
});
