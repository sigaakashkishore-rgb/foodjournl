const axios = require('axios');
const mealsModel = require('../models/mealsModel');

const getMeals = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId query parameter' });
    }
    const meals = await mealsModel.getMeals(userId);
    res.json(meals);
  } catch (error) {
    console.error('Error getting meals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const addMeal = async (req, res) => {
  try {
    const userId = req.body.userId;
    const mealData = req.body.meal;
    if (!userId || !mealData) {
      return res.status(400).json({ error: 'Missing userId or meal data in request body' });
    }

    // Call AI service to analyze meal
    const aiServiceUrl = process.env.AI_SERVICE_URL;
    const analysisResponse = await axios.post(`${aiServiceUrl}/analyze`, { meal: mealData });
    const analysis = analysisResponse.data;

    // Combine meal data with analysis results
    const mealToSave = {
      name: mealData.name,
      calories: analysis.calories,
      macros: analysis.macros,
      ayurvedic_tags: analysis.ayurvedic_tags,
    };

    const savedMeal = await mealsModel.addMeal(userId, mealToSave);
    res.status(201).json(savedMeal);
  } catch (error) {
    console.error('Error adding meal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getMeals, addMeal };
