const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

// Mock nutrition data based on food name
const nutritionData = {
  'apple': { calories: 95, protein: 0.5, carbs: 25, fat: 0.3, ayurvedic_tag: 'sweet' },
  'banana': { calories: 105, protein: 1.3, carbs: 27, fat: 0.4, ayurvedic_tag: 'sweet' },
  'chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6, ayurvedic_tag: 'protein' },
  'rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, ayurvedic_tag: 'neutral' },
  'spinach': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, ayurvedic_tag: 'bitter' },
  'yogurt': { calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3, ayurvedic_tag: 'cooling' },
  'default': { calories: 100, protein: 5, carbs: 10, fat: 2, ayurvedic_tag: 'unknown' }
};

app.post('/analyze', (req, res) => {
  const { food_name, quantity = 1, unit = 'serving' } = req.body;

  // Get nutrition data for the food
  const foodKey = food_name.toLowerCase();
  const baseNutrition = nutritionData[foodKey] || nutritionData['default'];

  // Scale by quantity
  const scaledNutrition = {
    calories: Math.round(baseNutrition.calories * quantity),
    protein: Math.round(baseNutrition.protein * quantity * 10) / 10,
    carbs: Math.round(baseNutrition.carbs * quantity * 10) / 10,
    fat: Math.round(baseNutrition.fat * quantity * 10) / 10,
    ayurvedic_tag: baseNutrition.ayurvedic_tag
  };

  res.json(scaledNutrition);
});

app.listen(PORT, () => {
  console.log(`AI Stub service running on port ${PORT}`);
});
