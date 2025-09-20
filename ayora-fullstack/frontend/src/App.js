import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Components
import Navbar from './components/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/Dashboard';
import AddMeal from './components/meals/AddMeal';
import MealList from './components/meals/MealList';
import MealDetails from './components/meals/MealDetails';
import ImageUpload from './components/ImageUpload';
import VoiceRecorder from './components/VoiceRecorder';
import Profile from './components/Profile';
import DoctorDashboard from './components/doctor/DoctorDashboard';
import PatientReview from './components/doctor/PatientReview';

// Context
import { AuthProvider } from './context/AuthContext';

// Styles
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="container mt-4">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/add-meal" element={<AddMeal />} />
              <Route path="/meals" element={<MealList />} />
              <Route path="/meals/:id" element={<MealDetails />} />
              <Route path="/upload-image" element={<ImageUpload />} />
              <Route path="/voice-recorder" element={<VoiceRecorder />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/doctor" element={<DoctorDashboard />} />
              <Route path="/doctor/patients/:patientId" element={<PatientReview />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
