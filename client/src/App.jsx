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

// Placeholder pages for other modules
const Placeholder = ({ title }) => (
  <DashboardLayout>
    <div className="glass-card" style={{ padding: '2rem' }}>
      <h2>{title}</h2>
      <p style={{ color: 'var(--text-muted)' }}>This module is currently under development.</p>
    </div>
  </DashboardLayout>
);

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
            <ProtectedRoute roles={['admin', 'receptionist']}>
              <Placeholder title="Pharmacy Inventory" />
            </ProtectedRoute>
          } />

          <Route path="/lab" element={
            <ProtectedRoute>
              <Placeholder title="Lab Reports" />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
