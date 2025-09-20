# Ayora - Advanced Food Journal Application

A comprehensive full-stack food journaling application with image recognition, voice input, Ayurvedic diet tracking, and doctor-patient collaboration features.

## 🌟 Features

### Core Features
- **📱 Image-based Food Recognition** - Upload food images for automatic identification and nutrition analysis
- **🎤 Voice-based Journaling** - Record meals using voice input with automatic transcription
- **📊 Nutrition Tracking** - Comprehensive calorie and macronutrient tracking
- **🧘 Ayurvedic Integration** - Dosha-based diet recommendations and analysis
- **👨‍⚕️ Doctor-Patient System** - Healthcare professionals can review patient journals
- **📈 Dashboard Analytics** - Visual representation of nutrition data and trends
- **🔐 Secure Authentication** - JWT-based authentication with role-based access

### Advanced Features
- **Real-time Nutrition Analysis** - Integration with AI services for food recognition
- **Voice Processing** - Speech-to-text conversion for meal logging
- **Doctor Review System** - Professional insights and recommendations
- **Patient Management** - Doctor dashboard for managing multiple patients
- **Responsive Design** - Beautiful, mobile-friendly interface
- **Data Export** - Export meal data for analysis

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ayora
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

4. **Start the backend server:**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

   The application will open in your browser at `http://localhost:3000`

## 📋 Demo Accounts

### Patient Account
- **Email:** patient@demo.com
- **Password:** password123

### Doctor Account
- **Email:** doctor@demo.com
- **Password:** password123

## 🛠 API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Meals
- `GET /api/meals` - Get user's meals
- `POST /api/meals` - Add new meal
- `GET /api/meals/:id` - Get specific meal
- `DELETE /api/meals/:id` - Delete meal
- `GET /api/meals/recent` - Get recent meals
- `GET /api/meals/nutrition-summary` - Get nutrition summary

### Image Recognition
- `POST /api/images/upload` - Upload and analyze food image

### Voice Processing
- `POST /api/voice/process` - Process voice recording

### Doctor Features
- `GET /api/doctors/patients/requiring-attention` - Get patients needing attention
- `GET /api/doctors/patients/:patient_id/meals` - Get patient meals for review
- `POST /api/doctors/meals/:meal_id/review` - Review a meal
- `GET /api/doctors/patients/:patient_id/nutrition-summary` - Get patient nutrition summary

## 🎨 User Interface

### Dashboard
- Overview of recent meals
- Quick action buttons for adding meals
- Nutrition summary cards
- Ayurvedic dosha indicators

### Meal Journal
- Chronological list of meals
- Detailed nutrition information
- Ayurvedic analysis
- Doctor review status

### Image Recognition
- Drag-and-drop image upload
- Real-time food identification
- Automatic nutrition calculation
- Ayurvedic property analysis

### Voice Journaling
- Audio recording interface
- Speech-to-text transcription
- Automatic meal data extraction
- Voice command processing

### Doctor Dashboard
- Patient management interface
- Meal review system
- Nutrition trend analysis
- Patient communication tools

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ayora
JWT_SECRET=your-secret-key
AI_SERVICE_URL=http://localhost:8000
NUTRITION_API_KEY=your-api-key
GOOGLE_VISION_API_KEY=your-vision-api-key
SPEECH_TO_TEXT_API_KEY=your-speech-api-key
```

#### Frontend (.env.local)
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_MAPS_API_KEY=your-maps-key
```

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### End-to-End Testing
```bash
# Install test dependencies
npm install -g cypress

# Run E2E tests
npx cypress open
```

## 📱 Mobile Support

The application is fully responsive and supports:
- iOS Safari
- Android Chrome
- Mobile-optimized touch interfaces
- Camera integration for food photos
- Voice recording capabilities

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Rate limiting
- Secure file upload handling

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  role: String ('patient' | 'doctor'),
  profile: {
    age: Number,
    gender: String,
    height: Number,
    weight: Number,
    medical_conditions: [String],
    allergies: [String],
    ayurvedic_body_type: String,
    dietary_preferences: [String],
    emergency_contact: String
  },
  doctor_id: ObjectId (for patients),
  isActive: Boolean,
  createdAt: Date,
  lastLogin: Date
}
```

### Meals Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  food_name: String,
  meal_type: String,
  quantity: Number,
  unit: String,
  nutrition: {
    calories: Number,
    protein: Number,
    carbohydrates: Number,
    fat: Number
  },
  ayurvedic_properties: {
    dosha_effect: {
      vata: String,
      pitta: String,
      kapha: String
    }
  },
  image_data: {
    url: String,
    filename: String,
    analysis: Object
  },
  voice_transcription: String,
  doctor_review: {
    reviewed_by: ObjectId,
    review_date: Date,
    feedback: String,
    recommendations: [String],
    rating: Number,
    status: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with React, Node.js, and MongoDB
- UI components from React Bootstrap
- Icons from React Icons
- Charts powered by Chart.js
- Image processing with Google Vision API
- Speech recognition with Web Speech API

## 📞 Support

For support, email support@ayora.com or join our Discord community.

---

**Ayora** - Transforming the way you track and understand your nutrition through technology and traditional wisdom.
