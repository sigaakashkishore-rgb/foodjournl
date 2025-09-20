const Meal = require('../models/Meal');
const User = require('../models/User');

// Get patient meals for review
const getPatientMealsForReview = async (req, res) => {
  try {
    const { patient_id, start_date, end_date, limit = 20, page = 1 } = req.query;

    if (!patient_id) {
      return res.status(400).json({
        success: false,
        error: 'Patient ID is required'
      });
    }

    // Verify the patient belongs to this doctor
    const patient = await User.findOne({
      _id: patient_id,
      role: 'patient',
      doctor_id: req.user.id
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found or not assigned to you'
      });
    }

    let query = { user_id: patient_id };

    // Apply date filters
    if (start_date || end_date) {
      query.meal_date = {};
      if (start_date) query.meal_date.$gte = new Date(start_date);
      if (end_date) query.meal_date.$lte = new Date(end_date);
    }

    const meals = await Meal.find(query)
      .populate('user_id', 'name email')
      .sort({ meal_date: -1 })
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
        total_meals: total
      }
    });
  } catch (error) {
    console.error('Error fetching patient meals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch patient meals',
      message: error.message
    });
  }
};

// Review a meal
const reviewMeal = async (req, res) => {
  try {
    const { meal_id } = req.params;
    const { feedback, recommendations, rating, status } = req.body;

    // Find the meal
    const meal = await Meal.findById(meal_id);
    if (!meal) {
      return res.status(404).json({
        success: false,
        error: 'Meal not found'
      });
    }

    // Verify the patient belongs to this doctor
    const patient = await User.findOne({
      _id: meal.user_id,
      role: 'patient',
      doctor_id: req.user.id
    });

    if (!patient) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to review this meal'
      });
    }

    // Update meal with doctor review
    meal.doctor_review = {
      reviewed_by: req.user.id,
      review_date: new Date(),
      feedback: feedback || '',
      recommendations: recommendations || [],
      rating: rating || 3,
      status: status || 'reviewed'
    };

    await meal.save();
    await meal.populate('doctor_review.reviewed_by', 'name');

    res.json({
      success: true,
      message: 'Meal reviewed successfully',
      data: meal
    });
  } catch (error) {
    console.error('Error reviewing meal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to review meal',
      message: error.message
    });
  }
};

// Get patient nutrition summary
const getPatientNutritionSummary = async (req, res) => {
  try {
    const { patient_id, start_date, end_date } = req.query;

    if (!patient_id) {
      return res.status(400).json({
        success: false,
        error: 'Patient ID is required'
      });
    }

    // Verify the patient belongs to this doctor
    const patient = await User.findOne({
      _id: patient_id,
      role: 'patient',
      doctor_id: req.user.id
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found or not assigned to you'
      });
    }

    const startDate = start_date ? new Date(start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = end_date ? new Date(end_date) : new Date();

    const summary = await Meal.getNutritionSummary(patient_id, startDate, endDate);

    // Get meal type breakdown
    const mealTypeBreakdown = await Meal.aggregate([
      {
        $match: {
          user_id: require('mongoose').Types.ObjectId(patient_id),
          meal_date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$meal_type',
          count: { $sum: 1 },
          avg_calories: { $avg: '$nutrition.calories' },
          total_calories: { $sum: '$nutrition.calories' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        summary: summary[0] || {
          total_calories: 0,
          total_protein: 0,
          total_carbs: 0,
          total_fat: 0,
          meal_count: 0
        },
        meal_type_breakdown: mealTypeBreakdown,
        period: { start_date: startDate, end_date: endDate }
      }
    });
  } catch (error) {
    console.error('Error getting patient nutrition summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get patient nutrition summary',
      message: error.message
    });
  }
};

// Get patients requiring attention
const getPatientsRequiringAttention = async (req, res) => {
  try {
    const patients = await User.find({
      role: 'patient',
      doctor_id: req.user.id
    }).select('name email profile createdAt lastLogin');

    const patientsWithIssues = [];

    for (const patient of patients) {
      // Check for meals with poor ratings or requiring attention
      const recentMeals = await Meal.find({
        user_id: patient._id,
        'doctor_review.status': { $in: ['requires_attention', 'pending'] },
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
      }).limit(5);

      if (recentMeals.length > 0) {
        patientsWithIssues.push({
          ...patient.toObject(),
          recent_meals_requiring_attention: recentMeals.length,
          last_meal_date: recentMeals[0]?.createdAt
        });
      }
    }

    res.json({
      success: true,
      data: patientsWithIssues
    });
  } catch (error) {
    console.error('Error fetching patients requiring attention:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch patients requiring attention',
      message: error.message
    });
  }
};

// Assign patient to doctor
const assignPatient = async (req, res) => {
  try {
    const { patient_id } = req.body;

    if (!patient_id) {
      return res.status(400).json({
        success: false,
        error: 'Patient ID is required'
      });
    }

    const patient = await User.findOneAndUpdate(
      { _id: patient_id, role: 'patient' },
      { doctor_id: req.user.id },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    res.json({
      success: true,
      message: 'Patient assigned successfully',
      data: patient
    });
  } catch (error) {
    console.error('Error assigning patient:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assign patient',
      message: error.message
    });
  }
};

module.exports = {
  getPatientMealsForReview,
  reviewMeal,
  getPatientNutritionSummary,
  getPatientsRequiringAttention,
  assignPatient
};
