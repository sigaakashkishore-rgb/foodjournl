const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const natural = require('natural');

// Configure multer for audio uploads
const audioStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/audio');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'voice-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const audioFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('audio/') ||
      file.originalname.match(/\.(wav|mp3|ogg|flac|m4a)$/i)) {
    cb(null, true);
  } else {
    cb(new Error('Only audio files are allowed!'), false);
  }
};

const uploadAudio = multer({
  storage: audioStorage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit for audio
  fileFilter: audioFilter
});

// Upload and process voice recording
const uploadVoice = async (req, res) => {
  try {
    uploadAudio.single('audio')(req, res, async function (err) {
      if (err) {
        return res.status(400).json({
          success: false,
          error: 'Audio upload failed',
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No audio file provided'
        });
      }

      // Process speech recognition
      let transcription = null;
      let analysis = null;

      try {
        transcription = await transcribeAudio(req.file.path);
        analysis = await analyzeVoiceInput(transcription);
      } catch (error) {
        console.warn('Voice processing failed:', error.message);
      }

      res.json({
        success: true,
        data: {
          filename: req.file.filename,
          original_name: req.file.originalname,
          url: `/uploads/audio/${req.file.filename}`,
          size: req.file.size,
          transcription: transcription,
          analysis: analysis
        },
        message: 'Voice recording processed successfully'
      });
    });
  } catch (error) {
    console.error('Error processing voice:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process voice recording',
      message: error.message
    });
  }
};

// Transcribe audio to text
const transcribeAudio = async (audioPath) => {
  try {
    // This would integrate with speech recognition services like Google Speech-to-Text
    // For now, returning mock transcription
    const mockTranscriptions = [
      "I had a chicken salad for lunch with about 200 grams of grilled chicken and mixed vegetables",
      "Breakfast was oatmeal with banana and some almonds",
      "Dinner included rice, dal, and vegetables",
      "I ate two apples and a handful of nuts as a snack",
      "Had a bowl of vegetable soup with bread"
    ];

    return mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
  } catch (error) {
    console.warn('Speech transcription failed:', error.message);
    return null;
  }
};

// Analyze voice input to extract meal information
const analyzeVoiceInput = async (transcription) => {
  try {
    if (!transcription) return null;

    const analysis = {
      extracted_meals: [],
      meal_type: 'other',
      confidence: 0.7
    };

    // Simple NLP to extract food items and meal types
    const text = transcription.toLowerCase();

    // Detect meal type
    if (text.includes('breakfast') || text.includes('morning')) {
      analysis.meal_type = 'breakfast';
    } else if (text.includes('lunch') || text.includes('afternoon')) {
      analysis.meal_type = 'lunch';
    } else if (text.includes('dinner') || text.includes('evening')) {
      analysis.meal_type = 'dinner';
    } else if (text.includes('snack')) {
      analysis.meal_type = 'snack';
    }

    // Extract food items (simple keyword matching)
    const commonFoods = [
      'rice', 'chicken', 'salad', 'apple', 'banana', 'bread', 'milk', 'egg',
      'oatmeal', 'almonds', 'nuts', 'vegetables', 'dal', 'soup', 'fish',
      'yogurt', 'cheese', 'pasta', 'potato', 'tomato', 'onion', 'garlic'
    ];

    const foundFoods = [];
    for (const food of commonFoods) {
      if (text.includes(food)) {
        foundFoods.push({
          name: food.charAt(0).toUpperCase() + food.slice(1),
          quantity: extractQuantity(text, food),
          unit: 'serving'
        });
      }
    }

    analysis.extracted_meals = foundFoods;

    // Calculate nutrition for extracted foods
    let totalNutrition = {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0
    };

    for (const food of foundFoods) {
      const nutrition = await getMockNutritionData(food.name.toLowerCase(), food.quantity, food.unit);
      totalNutrition.calories += nutrition.calories;
      totalNutrition.protein += nutrition.protein;
      totalNutrition.carbohydrates += nutrition.carbohydrates;
      totalNutrition.fat += nutrition.fat;
    }

    analysis.nutrition = totalNutrition;
    analysis.confidence = foundFoods.length > 0 ? 0.8 : 0.3;

    return analysis;
  } catch (error) {
    console.warn('Voice analysis failed:', error.message);
    return null;
  }
};

// Helper function to extract quantity from text
const extractQuantity = (text, food) => {
  const words = text.split(' ');
  const foodIndex = words.findIndex(word => word.includes(food));

  if (foodIndex > 0) {
    const quantityWords = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
    const numberWords = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

    for (let i = 0; i < quantityWords.length; i++) {
      if (words[foodIndex - 1] === quantityWords[i]) {
        return parseInt(numberWords[i]);
      }
    }

    // Check for numeric values
    const prevWord = words[foodIndex - 1];
    if (/^\d+$/.test(prevWord)) {
      return parseInt(prevWord);
    }
  }

  return 1; // Default quantity
};

// Get voice recording by filename
const getVoiceRecording = (req, res) => {
  try {
    const filename = req.params.filename;
    const audioPath = path.join(__dirname, '../uploads/audio', filename);

    if (!fs.existsSync(audioPath)) {
      return res.status(404).json({
        success: false,
        error: 'Audio file not found'
      });
    }

    res.sendFile(audioPath);
  } catch (error) {
    console.error('Error retrieving audio file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve audio file',
      message: error.message
    });
  }
};

// Delete voice recording
const deleteVoiceRecording = (req, res) => {
  try {
    const filename = req.params.filename;
    const audioPath = path.join(__dirname, '../uploads/audio', filename);

    if (!fs.existsSync(audioPath)) {
      return res.status(404).json({
        success: false,
        error: 'Audio file not found'
      });
    }

    fs.unlinkSync(audioPath);

    res.json({
      success: true,
      message: 'Voice recording deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting voice recording:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete voice recording',
      message: error.message
    });
  }
};

// Mock nutrition data function (reused from mealController)
const getMockNutritionData = async (foodName, quantity, unit) => {
  const foodDatabase = {
    'rice': { calories: 130, protein: 2.7, carbohydrates: 28, fat: 0.3, fiber: 0.4, sugar: 0.1, sodium: 1 },
    'chicken': { calories: 165, protein: 31, carbohydrates: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74 },
    'apple': { calories: 52, protein: 0.3, carbohydrates: 14, fat: 0.2, fiber: 2.4, sugar: 10, sodium: 1 },
    'bread': { calories: 79, protein: 2.7, carbohydrates: 15, fat: 1, fiber: 0.8, sugar: 1.6, sodium: 146 },
    'milk': { calories: 42, protein: 3.4, carbohydrates: 5, fat: 1, fiber: 0, sugar: 5, sodium: 44 },
    'egg': { calories: 155, protein: 13, carbohydrates: 1.1, fat: 11, fiber: 0, sugar: 1.1, sodium: 124 },
    'banana': { calories: 89, protein: 1.1, carbohydrates: 23, fat: 0.3, fiber: 2.6, sugar: 12, sodium: 1 },
    'salad': { calories: 15, protein: 1.4, carbohydrates: 3, fat: 0.2, fiber: 1.5, sugar: 1.4, sodium: 28 },
    'oatmeal': { calories: 68, protein: 2.4, carbohydrates: 12, fat: 1.4, fiber: 1.6, sugar: 0.5, sodium: 1 },
    'almonds': { calories: 164, protein: 6, carbohydrates: 6, fat: 14, fiber: 3.5, sugar: 1.2, sodium: 1 },
    'nuts': { calories: 200, protein: 5, carbohydrates: 4, fat: 20, fiber: 2, sugar: 1, sodium: 2 },
    'vegetables': { calories: 25, protein: 2, carbohydrates: 5, fat: 0.2, fiber: 2.5, sugar: 2, sodium: 30 },
    'dal': { calories: 120, protein: 8, carbohydrates: 20, fat: 1, fiber: 4, sugar: 2, sodium: 200 },
    'soup': { calories: 80, protein: 3, carbohydrates: 12, fat: 2, fiber: 2, sugar: 4, sodium: 600 },
    'fish': { calories: 140, protein: 25, carbohydrates: 0, fat: 5, fiber: 0, sugar: 0, sodium: 60 },
    'yogurt': { calories: 100, protein: 10, carbohydrates: 6, fat: 5, fiber: 0, sugar: 6, sodium: 80 },
    'cheese': { calories: 113, protein: 7, carbohydrates: 1, fat: 9, fiber: 0, sugar: 0.5, sodium: 174 },
    'pasta': { calories: 131, protein: 5, carbohydrates: 25, fat: 1, fiber: 1.5, sugar: 1, sodium: 1 },
    'potato': { calories: 77, protein: 2, carbohydrates: 17, fat: 0.1, fiber: 2.2, sugar: 0.8, sodium: 6 },
    'tomato': { calories: 18, protein: 0.9, carbohydrates: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6, sodium: 5 },
    'onion': { calories: 40, protein: 1.1, carbohydrates: 9, fat: 0.1, fiber: 1.7, sugar: 4.2, sodium: 4 },
    'garlic': { calories: 149, protein: 6.4, carbohydrates: 33, fat: 0.5, fiber: 2.1, sugar: 1, sodium: 17 }
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
  uploadVoice,
  getVoiceRecording,
  deleteVoiceRecording,
  transcribeAudio,
  analyzeVoiceInput
};
