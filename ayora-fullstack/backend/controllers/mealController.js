const Meal = require('../models/Meal');
const User = require('../models/User');
const axios = require('axios');
const natural = require('natural');

// Get all meals for a user with pagination and filters
const getMeals = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      meal_type,
      start_date,
      end_date,
      search,
      sort = '-createdAt'
    } = req.query;

    const userId = req.user.id;
    let query = { user_id: userId };

    // Apply filters
    if (meal_type) query.meal_type = meal_type;
    if (start_date || end_date) {
      query.meal_date = {};
      if (start_date) query.meal_date.$gte = new Date(start_date);
      if (end_date) query.meal_date.$lte = new Date(end_date);
    }
    if (search) {
      query.$text = { $search: search };
    }

    const meals = await Meal.find(query)
      .populate('user_id', 'name email')
      .populate('doctor_review.reviewed_by', 'name')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Meal.countDocuments(query);

    res.json({
      success: true,
      data: meals,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / limit),
        total_meals: total,
        has_next: page < Math.ceil(total / limit),
        has_prev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching meals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch meals',
      message: error.message
    });
  }
};

// Get single meal by ID
const getMeal = async (req, res) => {
  try {
    const meal = await Meal.findOne({
      _id: req.params.id,
      user_id: req.user.id
    }).populate('doctor_review.reviewed_by', 'name');

    if (!meal) {
      return res.status(404).json({
        success: false,
        error: 'Meal not found'
      });
    }

    res.json({
      success: true,
      data: meal
    });
  } catch (error) {
    console.error('Error fetching meal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch meal',
      message: error.message
    });
  }
};

// Create new meal
const createMeal = async (req, res) => {
  try {
    const mealData = {
      ...req.body,
      user_id: req.user.id
    };

    // If image is uploaded, add image data
    if (req.file) {
      mealData.image_data = {
        filename: req.file.filename,
        original_name: req.file.originalname,
        url: `/uploads/${req.file.filename}`,
        content_type: req.file.mimetype,
        size: req.file.size
      };
    }

    // Analyze food using AI service if available
    if (mealData.food_name && !mealData.nutrition.calories) {
      try {
        const nutritionData = await analyzeFoodNutrition(mealData.food_name, mealData.quantity, mealData.unit);
        mealData.nutrition = { ...mealData.nutrition, ...nutritionData };
      } catch (error) {
        console.warn('Failed to analyze nutrition:', error.message);
      }
    }

    const meal = new Meal(mealData);
    await meal.save();

    // Populate user data for response
    await meal.populate('user_id', 'name email');

    res.status(201).json({
      success: true,
      data: meal,
      message: 'Meal created successfully'
    });
  } catch (error) {
    console.error('Error creating meal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create meal',
      message: error.message
    });
  }
};

// Update meal
const updateMeal = async (req, res) => {
  try {
    const meal = await Meal.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      req.body,
      { new: true, runValidators: true }
    ).populate('doctor_review.reviewed_by', 'name');

    if (!meal) {
      return res.status(404).json({
        success: false,
        error: 'Meal not found'
      });
    }

    res.json({
      success: true,
      data: meal,
      message: 'Meal updated successfully'
    });
  } catch (error) {
    console.error('Error updating meal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update meal',
      message: error.message
    });
  }
};

// Delete meal
const deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user.id
    });

    if (!meal) {
      return res.status(404).json({
        success: false,
        error: 'Meal not found'
      });
    }

    res.json({
      success: true,
      message: 'Meal deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting meal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete meal',
      message: error.message
    });
  }
};

// Get nutrition summary
const getNutritionSummary = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const userId = req.user.id;

    const startDate = start_date ? new Date(start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
    const endDate = end_date ? new Date(end_date) : new Date();

    const summary = await Meal.getNutritionSummary(userId, startDate, endDate);

    res.json({
      success: true,
      data: summary[0] || {
        total_calories: 0,
        total_protein: 0,
        total_carbs: 0,
        total_fat: 0,
        meal_count: 0
      },
      period: { start_date: startDate, end_date: endDate }
    });
  } catch (error) {
    console.error('Error getting nutrition summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get nutrition summary',
      message: error.message
    });
  }
};

// Get recent meals (last 3)
const getRecentMeals = async (req, res) => {
  try {
    const userId = req.user.id;
    const meals = await Meal.find({ user_id: userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('user_id', 'name')
      .select('food_name meal_type nutrition.calories meal_date image_data.url');

    res.json({
      success: true,
      data: meals
    });
  } catch (error) {
    console.error('Error fetching recent meals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent meals',
      message: error.message
    });
  }
};

// Analyze food nutrition using AI service
const analyzeFoodNutrition = async (foodName, quantity = 1, unit = 'serving') => {
  try {
    // This would integrate with a nutrition API or AI service
    // For now, returning mock data based on common foods
    const nutritionData = await getMockNutritionData(foodName, quantity, unit);
    return nutritionData;
  } catch (error) {
    console.warn('Nutrition analysis failed:', error.message);
    return {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
    };
  }
};

// Mock nutrition data (replace with real API integration)
const getMockNutritionData = async (foodName, quantity, unit) => {
  const foodDatabase = {
    'rice': { calories: 130, protein: 2.7, carbohydrates: 28, fat: 0.3, fiber: 0.4, sugar: 0.1, sodium: 1 },
    'chicken': { calories: 165, protein: 31, carbohydrates: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74 },
    'apple': { calories: 52, protein: 0.3, carbohydrates: 14, fat: 0.2, fiber: 2.4, sugar: 10, sodium: 1 },
    'bread': { calories: 79, protein: 2.7, carbohydrates: 15, fat: 1, fiber: 0.8, sugar: 1.6, sodium: 146 },
    'milk': { calories: 42, protein: 3.4, carbohydrates: 5, fat: 1, fiber: 0, sugar: 5, sodium: 44 },
    'egg': { calories: 155, protein: 13, carbohydrates: 1.1, fat: 11, fiber: 0, sugar: 1.1, sodium: 124 },
    'banana': { calories: 89, protein: 1.1, carbohydrates: 23, fat: 0.3, fiber: 2.6, sugar: 12, sodium: 1 },
    'salad': { calories: 15, protein: 1.4, carbohydrates: 3, fat: 0.2, fiber: 1.5, sugar: 1.4, sodium: 28 }
  };

  const baseFood = foodName.toLowerCase();
  let baseNutrition = { calories: 100, protein: 2, carbohydrates: 20, fat: 2, fiber: 2, sugar: 5, sodium: 50 };

  // Find matching food in database
  for (const [food, nutrition] of Object.entries(foodDatabase)) {
    if (baseFood.includes(food)) {
      baseNutrition = nutrition;
      break;
    }
  }

  // Adjust for quantity
  const quantityMultiplier = quantity / 100; // Assuming base is per 100g
  return {
    calories: Math.round(baseNutrition.calories * quantityMultiplier),
    protein: Math.round(baseNutrition.protein * quantityMultiplier * 10) / 10,
    carbohydrates: Math.round(baseNutrition.carbohydrates * quantityMultiplier * 10) / 10,
    fat: Math.round(baseNutrition.fat * quantityMultiplier * 10) / 10,
    fiber: Math.round(baseNutrition.fiber * quantityMultiplier * 10) / 10,
    sugar: Math.round(baseNutrition.sugar * quantityMultiplier * 10) / 10,
    sodium: Math.round(baseNutrition.sodium * quantityMultiplier)
  };
};

module.exports = {
  getMeals,
  getMeal,
  createMeal,
  updateMeal,
  deleteMeal,
  getNutritionSummary,
  getRecentMeals
};
