const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const Meal = require('../models/Meal');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'food-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

// Upload single image
const uploadImage = async (req, res) => {
  try {
    upload.single('image')(req, res, async function (err) {
      if (err) {
        return res.status(400).json({
          success: false,
          error: 'Image upload failed',
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No image file provided'
        });
      }

      // Analyze image for food identification
      let foodAnalysis = null;
      try {
        foodAnalysis = await analyzeFoodImage(req.file.path);
      } catch (error) {
        console.warn('Food image analysis failed:', error.message);
      }

      res.json({
        success: true,
        data: {
          filename: req.file.filename,
          original_name: req.file.originalname,
          url: `/uploads/${req.file.filename}`,
          size: req.file.size,
          analysis: foodAnalysis
        },
        message: 'Image uploaded successfully'
      });
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image',
      message: error.message
    });
  }
};

// Analyze food image using AI service
const analyzeFoodImage = async (imagePath) => {
  try {
    // This would integrate with an image recognition API like Google Vision AI
    // For now, returning mock analysis data
    const mockAnalysis = {
      identified_foods: [
        {
          name: 'Grilled Chicken Salad',
          confidence: 0.85,
          quantity: 1,
          unit: 'serving'
        }
      ],
      nutrition: {
        calories: 320,
        protein: 25,
        carbohydrates: 15,
        fat: 18,
        fiber: 6,
        sugar: 8,
        sodium: 450
      },
      ayurvedic_properties: {
        dosha_effect: {
          vata: 'decrease',
          pitta: 'neutral',
          kapha: 'decrease'
        },
        qualities: ['light', 'dry'],
        taste: ['bitter', 'astringent'],
        potency: 'cold'
      }
    };

    return mockAnalysis;
  } catch (error) {
    console.warn('Image analysis failed:', error.message);
    return null;
  }
};

// Get image by filename
const getImage = (req, res) => {
  try {
    const filename = req.params.filename;
    const imagePath = path.join(__dirname, '../uploads', filename);

    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }

    res.sendFile(imagePath);
  } catch (error) {
    console.error('Error retrieving image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve image',
      message: error.message
    });
  }
};

// Delete image
const deleteImage = (req, res) => {
  try {
    const filename = req.params.filename;
    const imagePath = path.join(__dirname, '../uploads', filename);

    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }

    fs.unlinkSync(imagePath);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete image',
      message: error.message
    });
  }
};

module.exports = {
  uploadImage,
  getImage,
  deleteImage,
  analyzeFoodImage
};
