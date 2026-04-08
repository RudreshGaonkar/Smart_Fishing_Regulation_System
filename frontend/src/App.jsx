import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './layouts/Layout';
import Login from './pages/Login';
import FishermanDashboard from './pages/FishermanDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ResearcherDashboard from './pages/ResearcherDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Standalone Route */}
          <Route path="/" element={<Login />} />

          {/* Protected Routes wrapped in Sidebar Layout */}
          <Route element={<Layout />}>
            <Route 
              path="/fisherman" 
              element={
                <ProtectedRoute allowedRole="Fisherman">
                  <FishermanDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRole="Admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/researcher" 
              element={
                <ProtectedRoute allowedRole="Researcher">
                  <ResearcherDashboard />
                </ProtectedRoute>
              } 
            />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
