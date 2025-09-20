const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  meal_type: {
    type: String,
    required: [true, 'Meal type is required'],
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'other'],
    default: 'other'
  },
  food_name: {
    type: String,
    required: [true, 'Food name is required'],
    trim: true,
    maxlength: [200, 'Food name cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity must be positive']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    default: 'serving',
    enum: ['grams', 'serving', 'cup', 'piece', 'bowl', 'plate', 'ml', 'oz']
  },
  // Nutritional Information
  nutrition: {
    calories: {
      type: Number,
      default: 0,
      min: [0, 'Calories cannot be negative']
    },
    protein: {
      type: Number,
      default: 0,
      min: [0, 'Protein cannot be negative']
    },
    carbohydrates: {
      type: Number,
      default: 0,
      min: [0, 'Carbohydrates cannot be negative']
    },
    fat: {
      type: Number,
      default: 0,
      min: [0, 'Fat cannot be negative']
    },
    fiber: {
      type: Number,
      default: 0,
      min: [0, 'Fiber cannot be negative']
    },
    sugar: {
      type: Number,
      default: 0,
      min: [0, 'Sugar cannot be negative']
    },
    sodium: {
      type: Number,
      default: 0,
      min: [0, 'Sodium cannot be negative']
    }
  },
  // Ayurvedic Information
  ayurvedic_properties: {
    dosha_effect: {
      vata: { type: String, enum: ['increase', 'decrease', 'neutral'], default: 'neutral' },
      pitta: { type: String, enum: ['increase', 'decrease', 'neutral'], default: 'neutral' },
      kapha: { type: String, enum: ['increase', 'decrease', 'neutral'], default: 'neutral' }
    },
    qualities: [{
      type: String,
      enum: ['hot', 'cold', 'dry', 'oily', 'light', 'heavy', 'smooth', 'rough']
    }],
    taste: [{
      type: String,
      enum: ['sweet', 'sour', 'salty', 'bitter', 'pungent', 'astringent']
    }],
    potency: {
      type: String,
      enum: ['hot', 'cold'],
      default: 'neutral'
    },
    post_digestive_effect: {
      type: String,
      enum: ['sweet', 'sour', 'pungent'],
      default: 'sweet'
    }
  },
  // Image and Voice Data
  image_data: {
    filename: String,
    original_name: String,
    url: String,
    content_type: String,
    size: Number,
    upload_date: { type: Date, default: Date.now }
  },
  voice_data: {
    filename: String,
    original_name: String,
    url: String,
    content_type: String,
    size: Number,
    transcription: String,
    confidence: Number,
    upload_date: { type: Date, default: Date.now }
  },
  // Journal and Tracking
  journal_entry: {
    mood: {
      type: String,
      enum: ['energetic', 'tired', 'happy', 'stressed', 'neutral', 'bloated', 'light', 'heavy']
    },
    energy_level: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    },
    digestion: {
      type: String,
      enum: ['good', 'poor', 'bloating', 'gas', 'constipation', 'diarrhea', 'normal']
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    }
  },
  // Serving Information
  servings: {
    planned: { type: Number, default: 1 },
    consumed: { type: Number, default: 1 },
    remaining: { type: Number, default: 0 }
  },
  // Doctor Review
  doctor_review: {
    reviewed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    review_date: Date,
    feedback: String,
    recommendations: [String],
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'requires_attention', 'approved'],
      default: 'pending'
    }
  },
  // Metadata
  tags: [String],
  is_favorite: {
    type: Boolean,
    default: false
  },
  meal_date: {
    type: Date,
    default: Date.now
  },
  location: {
    type: String,
    maxlength: [100, 'Location cannot exceed 100 characters']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
mealSchema.index({ user_id: 1, meal_date: -1 });
mealSchema.index({ user_id: 1, meal_type: 1 });
mealSchema.index({ 'doctor_review.status': 1 });
mealSchema.index({ meal_date: -1 });
mealSchema.index({ food_name: 'text', description: 'text' });

// Virtual for BMI calculation
mealSchema.virtual('nutrition_score').get(function() {
  const { calories, protein, carbohydrates, fat, fiber } = this.nutrition;
  return (protein * 4 + carbohydrates * 4 + fat * 9 + fiber * 2) || 0;
});

// Pre-save middleware to calculate remaining servings
mealSchema.pre('save', function(next) {
  if (this.servings.planned > 0) {
    this.servings.remaining = Math.max(0, this.servings.planned - this.servings.consumed);
  }
  next();
});

// Static method to get nutrition summary
mealSchema.statics.getNutritionSummary = async function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        user_id: mongoose.Types.ObjectId(userId),
        meal_date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        total_calories: { $sum: '$nutrition.calories' },
        total_protein: { $sum: '$nutrition.protein' },
        total_carbs: { $sum: '$nutrition.carbohydrates' },
        total_fat: { $sum: '$nutrition.fat' },
        meal_count: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('Meal', mealSchema);
