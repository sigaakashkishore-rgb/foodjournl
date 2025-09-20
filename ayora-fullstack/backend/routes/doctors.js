const express = require('express');
const router = express.Router();
const {
  getPatientMealsForReview,
  reviewMeal,
  getPatientNutritionSummary,
  getPatientsRequiringAttention,
  assignPatient
} = require('../controllers/doctorController');
const { doctorAuth } = require('../middleware/auth');

// All doctor routes require doctor authentication
router.use(doctorAuth);

// GET /api/doctors/patients/requiring-attention - Get patients needing attention
router.get('/patients/requiring-attention', getPatientsRequiringAttention);

// GET /api/doctors/patients/:patient_id/meals - Get patient meals for review
router.get('/patients/:patient_id/meals', getPatientMealsForReview);

// GET /api/doctors/patients/:patient_id/nutrition-summary - Get patient nutrition summary
router.get('/patients/:patient_id/nutrition-summary', getPatientNutritionSummary);

// POST /api/doctors/patients/assign - Assign patient to doctor
router.post('/patients/assign', assignPatient);

// POST /api/doctors/meals/:meal_id/review - Review a meal
router.post('/meals/:meal_id/review', reviewMeal);

module.exports = router;
