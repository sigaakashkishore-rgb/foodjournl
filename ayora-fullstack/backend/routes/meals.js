const express = require('express');
const router = express.Router();
const {
  getMeals,
  getMeal,
  createMeal,
  updateMeal,
  deleteMeal,
  getNutritionSummary,
  getRecentMeals
} = require('../controllers/mealController');
const auth = require('../middleware/auth');

// All meal routes require authentication
router.use(auth);

// GET /api/meals - Get all meals for user
router.get('/', getMeals);

// GET /api/meals/recent - Get recent meals (last 3)
router.get('/recent', getRecentMeals);

// GET /api/meals/nutrition-summary - Get nutrition summary
router.get('/nutrition-summary', getNutritionSummary);

// GET /api/meals/:id - Get single meal
router.get('/:id', getMeal);

// POST /api/meals - Create new meal
router.post('/', createMeal);

// PUT /api/meals/:id - Update meal
router.put('/:id', updateMeal);

// DELETE /api/meals/:id - Delete meal
router.delete('/:id', deleteMeal);

module.exports = router;
