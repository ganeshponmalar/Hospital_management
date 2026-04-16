import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import PatientsPage from './pages/PatientsPage';
import DoctorsPage from './pages/DoctorsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import BillingPage from './pages/BillingPage';
import PharmacyPage from './pages/PharmacyPage';
import LabPage from './pages/Lab/LabPage';
import LabTests from './pages/Lab/LabTests';
import AdmissionsPage from './pages/Admissions/AdmissionsPage';
import BedsPage from './pages/Admissions/BedsPage';
import EMRPage from './pages/EMR/EMRPage';
import DoctorSchedulePage from './pages/Schedule/DoctorSchedulePage';
import QueuePage from './pages/Queue/QueuePage';

// Placeholder pages for other modules
// ... existing placeholder code ...

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/patients" element={
            <ProtectedRoute roles={['admin', 'doctor', 'receptionist']}>
              <PatientsPage />
            </ProtectedRoute>
          } />

          <Route path="/doctors" element={
            <ProtectedRoute>
              <DoctorsPage />
            </ProtectedRoute>
          } />

          <Route path="/appointments" element={
            <ProtectedRoute>
              <AppointmentsPage />
            </ProtectedRoute>
          } />

          <Route path="/billing" element={
            <ProtectedRoute>
              <BillingPage />
            </ProtectedRoute>
          } />

          <Route path="/pharmacy" element={
            <ProtectedRoute roles={['admin', 'doctor', 'receptionist']}>
              <PharmacyPage />
            </ProtectedRoute>
          } />

          <Route path="/lab" element={
            <ProtectedRoute roles={['admin', 'doctor', 'receptionist', 'technician']}>
              <LabPage />
            </ProtectedRoute>
          } />
          <Route path="/lab-tests" element={<LabTests />} />

          <Route path="/admissions" element={
            <ProtectedRoute roles={['admin', 'doctor', 'receptionist', 'nurse']}>
              <AdmissionsPage />
            </ProtectedRoute>
          } />

          <Route path="/beds" element={
            <ProtectedRoute roles={['admin', 'doctor', 'receptionist', 'nurse']}>
              <BedsPage />
            </ProtectedRoute>
          } />

          <Route path="/emr" element={
            <ProtectedRoute roles={['admin', 'doctor']}>
              <EMRPage />
            </ProtectedRoute>
          } />

          <Route path="/schedule" element={
            <ProtectedRoute roles={['admin']}>
              <DoctorSchedulePage />
            </ProtectedRoute>
          } />

          <Route path="/queue" element={
            <ProtectedRoute roles={['admin', 'nurse', 'doctor']}>
              <QueuePage />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
