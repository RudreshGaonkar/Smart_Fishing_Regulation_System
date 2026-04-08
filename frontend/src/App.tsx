import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AuthProvider } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';

// Placeholder Pages - We will build these out in the next steps
import { ProtectedRoute } from './components/ProtectedRoute';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AdminPanel } from './pages/AdminPanel';

import { FishingSimulation } from './pages/FishingSimulation';
import { ZoneMap } from './pages/ZoneMap';
import { AlertsPage } from './pages/AlertsPage';
import { ResearchReports } from './pages/ResearchReports';


function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="map" element={<ZoneMap />} />
              <Route path="alerts" element={<AlertsPage />} />

              <Route element={<ProtectedRoute allowedRoles={['fisherman']} />}>
                <Route path="simulation" element={<FishingSimulation />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="admin" element={<AdminPanel />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['researcher']} />}>
                <Route path="reports" element={<ResearchReports />} />
              </Route>
              
              <Route path="*" element={<div className="clay-card p-10 text-center"><h2 className="text-2xl font-bold text-ocean-800">404 Not Found</h2></div>} />
            </Route>
          </Route>
        </Routes>
      </AlertProvider>
    </AuthProvider>
  );
}

export default App;
