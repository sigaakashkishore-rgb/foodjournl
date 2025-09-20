const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 5000;

// In-memory storage for testing
let users = [];
let meals = [];
let nextUserId = 1;
let nextMealId = 1;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for uploads
app.use('/uploads', express.static('uploads'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, originalname) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// JWT Secret
const JWT_SECRET = 'test-jwt-secret-key-for-development-only';

// Helper functions
const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Ayora Food Journal API is running!' });
});

// User Registration
app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, password, role = 'patient' } = req.body;

    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      id: nextUserId++,
      name,
      email,
      password: hashedPassword,
      role,
      profile: {},
      isActive: true,
      createdAt: new Date(),
      lastLogin: null
    };

    users.push(newUser);

    // Generate token
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// User Login
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profile: user.profile
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// Get User Profile
app.get('/api/users/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  res.json({ success: true, data: user });
});

// Get Meals
app.get('/api/meals', authenticateToken, (req, res) => {
  const userMeals = meals.filter(m => m.user_id === req.user.id);
  res.json({ success: true, data: userMeals });
});

// Add Meal
app.post('/api/meals', authenticateToken, (req, res) => {
  try {
    const { food_name, meal_type, quantity, unit, nutrition, ayurvedic_properties } = req.body;

    const newMeal = {
      _id: nextMealId++,
      user_id: req.user.id,
      food_name,
      meal_type,
      quantity,
      unit,
      nutrition: nutrition || { calories: 0, protein: 0, carbohydrates: 0, fat: 0 },
      ayurvedic_properties: ayurvedic_properties || { dosha_effect: { vata: 'neutral', pitta: 'neutral', kapha: 'neutral' } },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    meals.push(newMeal);

    res.status(201).json({
      success: true,
      message: 'Meal added successfully',
      data: newMeal
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add meal' });
  }
});

// Get Recent Meals
app.get('/api/meals/recent', authenticateToken, (req, res) => {
  const userMeals = meals
    .filter(m => m.user_id === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  res.json({ success: true, data: userMeals });
});

// Nutrition Summary
app.get('/api/meals/nutrition-summary', authenticateToken, (req, res) => {
  const userMeals = meals.filter(m => m.user_id === req.user.id);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayMeals = userMeals.filter(m => new Date(m.createdAt) >= today);

  const summary = todayMeals.reduce((acc, meal) => {
    acc.total_calories += meal.nutrition?.calories || 0;
    acc.total_protein += meal.nutrition?.protein || 0;
    acc.total_carbs += meal.nutrition?.carbohydrates || 0;
    acc.total_fat += meal.nutrition?.fat || 0;
    acc.meal_count += 1;
    return acc;
  }, { total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0, meal_count: 0 });

  res.json({ success: true, data: summary });
});

// Image Upload (Mock)
app.post('/api/images/upload', authenticateToken, upload.single('image'), (req, res) => {
  try {
    // Mock image analysis response
    const mockAnalysis = {
      identified_foods: [
        {
          name: req.body.food_name || 'Sample Food',
          confidence: 0.95,
          quantity: 1,
          unit: 'serving'
        }
      ],
      nutrition: {
        calories: 250,
        protein: 15,
        carbohydrates: 30,
        fat: 8
      },
      ayurvedic_properties: {
        dosha_effect: {
          vata: 'neutral',
          pitta: 'cooling',
          kapha: 'light'
        }
      }
    };

    res.json({
      success: true,
      message: 'Image analyzed successfully',
      data: {
        image_url: req.file ? `/uploads/${req.file.filename}` : null,
        analysis: mockAnalysis
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Image upload failed' });
  }
});

// Voice Processing (Mock)
app.post('/api/voice/process', authenticateToken, upload.single('audio'), (req, res) => {
  try {
    // Mock voice transcription
    const mockTranscription = req.body.text || "I had a bowl of rice and vegetables for lunch";

    res.json({
      success: true,
      message: 'Voice processed successfully',
      data: {
        transcription: mockTranscription,
        extracted_info: {
          food_name: 'rice and vegetables',
          meal_type: 'lunch',
          quantity: 1,
          unit: 'bowl'
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Voice processing failed' });
  }
});

// Doctor routes (Mock)
app.get('/api/doctors/patients/requiring-attention', authenticateToken, (req, res) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ success: false, error: 'Doctor access required' });
  }

  res.json({
    success: true,
    data: [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        recent_meals_requiring_attention: 2,
        last_meal_date: new Date()
      }
    ]
  });
});

// Create demo users
const createDemoUsers = () => {
  const demoUsers = [
    {
      id: 1,
      name: 'Demo Patient',
      email: 'patient@demo.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password123
      role: 'patient',
      profile: {},
      isActive: true,
      createdAt: new Date(),
      lastLogin: null
    },
    {
      id: 2,
      name: 'Demo Doctor',
      email: 'doctor@demo.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password123
      role: 'doctor',
      profile: {},
      isActive: true,
      createdAt: new Date(),
      lastLogin: null
    }
  ];

  users.push(...demoUsers);
};

// Initialize demo data
createDemoUsers();

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Ayora Food Journal API Server is running on http://localhost:${PORT}`);
  console.log(`📊 Demo accounts created:`);
  console.log(`   Patient: patient@demo.com / password123`);
  console.log(`   Doctor: doctor@demo.com / password123`);
  console.log(`🔗 API Health Check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
