const express = require('express');
const { getMeals, addMeal } = require('../controllers/mealsController');

const router = express.Router();

router.get('/', getMeals);
router.post('/', addMeal);

module.exports = router;
