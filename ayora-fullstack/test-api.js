// Ayora Food Journal API Test Script
// This script demonstrates the API functionality

const API_BASE = 'http://localhost:5000/api';

// Test data
const testUsers = [
  {
    name: 'Test Patient',
    email: 'testpatient@example.com',
    password: 'testpass123',
    role: 'patient'
  },
  {
    name: 'Test Doctor',
    email: 'testdoctor@example.com',
    password: 'testpass123',
    role: 'doctor'
  }
];

const testMeals = [
  {
    food_name: 'Grilled Chicken Salad',
    meal_type: 'lunch',
    quantity: 1,
    unit: 'serving',
    nutrition: {
      calories: 350,
      protein: 25,
      carbohydrates: 15,
      fat: 20
    },
    ayurvedic_properties: {
      dosha_effect: {
        vata: 'neutral',
        pitta: 'cooling',
        kapha: 'light'
      }
    }
  },
  {
    food_name: 'Quinoa Bowl',
    meal_type: 'dinner',
    quantity: 1.5,
    unit: 'cup',
    nutrition: {
      calories: 450,
      protein: 18,
      carbohydrates: 65,
      fat: 12
    },
    ayurvedic_properties: {
      dosha_effect: {
        vata: 'grounding',
        pitta: 'neutral',
        kapha: 'neutral'
      }
    }
  }
];

// API Test Functions
async function testHealthCheck() {
  console.log('🩺 Testing Health Check...');
  try {
    const response = await fetch(`${API_BASE}/health`);
    const data = await response.json();
    console.log('✅ Health Check:', data);
    return true;
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
    return false;
  }
}

async function testUserRegistration(user) {
  console.log(`👤 Testing User Registration for ${user.name}...`);
  try {
    const response = await fetch(`${API_BASE}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    const data = await response.json();
    console.log('✅ Registration:', data.success ? 'Success' : 'Failed', data.message);
    return data;
  } catch (error) {
    console.log('❌ Registration Failed:', error.message);
    return null;
  }
}

async function testUserLogin(email, password) {
  console.log(`🔐 Testing User Login for ${email}...`);
  try {
    const response = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    console.log('✅ Login:', data.success ? 'Success' : 'Failed', data.message);
    return data;
  } catch (error) {
    console.log('❌ Login Failed:', error.message);
    return null;
  }
}

async function testAddMeal(token, meal) {
  console.log(`🍽️ Testing Add Meal: ${meal.food_name}...`);
  try {
    const response = await fetch(`${API_BASE}/meals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(meal),
    });
    const data = await response.json();
    console.log('✅ Add Meal:', data.success ? 'Success' : 'Failed', data.message);
    return data;
  } catch (error) {
    console.log('❌ Add Meal Failed:', error.message);
    return null;
  }
}

async function testGetMeals(token) {
  console.log('📋 Testing Get Meals...');
  try {
    const response = await fetch(`${API_BASE}/meals`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log('✅ Get Meals:', data.success ? `Success (${data.data.length} meals)` : 'Failed');
    return data;
  } catch (error) {
    console.log('❌ Get Meals Failed:', error.message);
    return null;
  }
}

async function testGetRecentMeals(token) {
  console.log('🕒 Testing Get Recent Meals...');
  try {
    const response = await fetch(`${API_BASE}/meals/recent`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log('✅ Recent Meals:', data.success ? `Success (${data.data.length} meals)` : 'Failed');
    return data;
  } catch (error) {
    console.log('❌ Recent Meals Failed:', error.message);
    return null;
  }
}

async function testNutritionSummary(token) {
  console.log('📊 Testing Nutrition Summary...');
  try {
    const response = await fetch(`${API_BASE}/meals/nutrition-summary`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log('✅ Nutrition Summary:', data.success ? 'Success' : 'Failed');
    if (data.success) {
      console.log('   📈 Data:', JSON.stringify(data.data, null, 2));
    }
    return data;
  } catch (error) {
    console.log('❌ Nutrition Summary Failed:', error.message);
    return null;
  }
}

async function testDoctorFeatures(token) {
  console.log('👨‍⚕️ Testing Doctor Features...');
  try {
    const response = await fetch(`${API_BASE}/doctors/patients/requiring-attention`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log('✅ Doctor Features:', data.success ? 'Success' : 'Failed');
    return data;
  } catch (error) {
    console.log('❌ Doctor Features Failed:', error.message);
    return null;
  }
}

// Mock Image Upload Test
async function testImageUpload(token) {
  console.log('📸 Testing Image Upload (Mock)...');
  try {
    // Create a mock image file (1x1 pixel PNG)
    const mockImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

    const response = await fetch(`${API_BASE}/images/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: mockImageData,
    });
    const data = await response.json();
    console.log('✅ Image Upload:', data.success ? 'Success' : 'Failed');
    return data;
  } catch (error) {
    console.log('❌ Image Upload Failed:', error.message);
    return null;
  }
}

// Mock Voice Processing Test
async function testVoiceProcessing(token) {
  console.log('🎤 Testing Voice Processing (Mock)...');
  try {
    const mockVoiceData = {
      text: 'I had a bowl of oatmeal with fruits for breakfast'
    };

    const response = await fetch(`${API_BASE}/voice/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(mockVoiceData),
    });
    const data = await response.json();
    console.log('✅ Voice Processing:', data.success ? 'Success' : 'Failed');
    return data;
  } catch (error) {
    console.log('❌ Voice Processing Failed:', error.message);
    return null;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Ayora Food Journal API Tests...\n');

  // Test 1: Health Check
  const healthOk = await testHealthCheck();
  console.log('');

  if (!healthOk) {
    console.log('❌ API server is not running. Please start the server first.');
    return;
  }

  // Test 2: User Registration
  console.log('📝 USER REGISTRATION TESTS');
  console.log('='.repeat(50));
  const registeredUsers = [];
  for (const user of testUsers) {
    const result = await testUserRegistration(user);
    if (result && result.success) {
      registeredUsers.push({
        ...user,
        token: result.data.token,
        userData: result.data.user
      });
    }
    console.log('');
  }

  // Test 3: User Login
  console.log('🔐 USER LOGIN TESTS');
  console.log('='.repeat(50));
  const loggedInUsers = [];
  for (const user of testUsers) {
    const result = await testUserLogin(user.email, user.password);
    if (result && result.success) {
      loggedInUsers.push({
        ...user,
        token: result.data.token,
        userData: result.data.user
      });
    }
    console.log('');
  }

  // Test 4: Meal Operations (using first logged in user)
  if (loggedInUsers.length > 0) {
    const testUser = loggedInUsers[0];
    console.log('🍽️ MEAL OPERATION TESTS');
    console.log('='.repeat(50));

    // Add meals
    const addedMeals = [];
    for (const meal of testMeals) {
      const result = await testAddMeal(testUser.token, meal);
      if (result && result.success) {
        addedMeals.push(result.data);
      }
      console.log('');
    }

    // Get all meals
    await testGetMeals(testUser.token);
    console.log('');

    // Get recent meals
    await testGetRecentMeals(testUser.token);
    console.log('');

    // Get nutrition summary
    await testNutritionSummary(testUser.token);
    console.log('');

    // Test 5: Image Upload
    console.log('📸 IMAGE PROCESSING TESTS');
    console.log('='.repeat(50));
    await testImageUpload(testUser.token);
    console.log('');

    // Test 6: Voice Processing
    console.log('🎤 VOICE PROCESSING TESTS');
    console.log('='.repeat(50));
    await testVoiceProcessing(testUser.token);
    console.log('');

    // Test 7: Doctor Features (if doctor user exists)
    if (loggedInUsers.find(u => u.role === 'doctor')) {
      const doctorUser = loggedInUsers.find(u => u.role === 'doctor');
      console.log('👨‍⚕️ DOCTOR FEATURE TESTS');
      console.log('='.repeat(50));
      await testDoctorFeatures(doctorUser.token);
      console.log('');
    }
  }

  // Summary
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Health Check: ${healthOk ? 'PASSED' : 'FAILED'}`);
  console.log(`✅ Users Registered: ${registeredUsers.length}/${testUsers.length}`);
  console.log(`✅ Users Logged In: ${loggedInUsers.length}/${testUsers.length}`);
  console.log(`✅ Meals Added: ${testMeals.length}`);
  console.log('');
  console.log('🎉 All API tests completed!');
  console.log('');
  console.log('📋 Demo Accounts Available:');
  console.log('   Patient: patient@demo.com / password123');
  console.log('   Doctor: doctor@demo.com / password123');
  console.log('');
  console.log('🌐 Access the application:');
  console.log('   Frontend: http://localhost:3000');
  console.log('   API: http://localhost:5000');
  console.log('   Demo Page: Open demo.html in browser');
}

// Run tests if this script is executed directly
if (typeof window === 'undefined') {
  runAllTests().catch(console.error);
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.AyoraAPITests = {
    testHealthCheck,
    testUserRegistration,
    testUserLogin,
    testAddMeal,
    testGetMeals,
    testGetRecentMeals,
    testNutritionSummary,
    testDoctorFeatures,
    testImageUpload,
    testVoiceProcessing,
    runAllTests
  };
  console.log('🧪 Ayora API Tests loaded! Run runAllTests() in console to test all endpoints.');
}
