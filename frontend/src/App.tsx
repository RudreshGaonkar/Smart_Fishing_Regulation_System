import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AuthProvider } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';

// Placeholder Pages - We will build these out in the next steps
const Login = () => <div className="clay-card p-10 flex flex-col items-center justify-center min-h-[60vh] text-center"><h2 className="text-3xl font-bold text-ocean-800 mb-4">Login</h2><p className="text-slate-600 mb-8">Placeholder for Login Page</p><button className="clay-button px-8 py-3">Sign in</button></div>;
const Dashboard = () => <div className="clay-card p-10 min-h-[60vh]"><h2 className="text-2xl font-bold text-ocean-800 mb-6">Dashboard</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div className="clay-inset p-6 h-32 flex items-center justify-center">Widget 1</div><div className="clay-inset p-6 h-32 flex items-center justify-center">Widget 2</div><div className="clay-inset p-6 h-32 flex items-center justify-center">Widget 3</div></div></div>;
const Simulation = () => <div className="clay-card p-10 min-h-[60vh] flex items-center justify-center"><h2 className="text-2xl font-bold text-ocean-800">Fishing Simulation</h2></div>;
const Map = () => <div className="clay-card p-10 min-h-[60vh] flex items-center justify-center"><h2 className="text-2xl font-bold text-ocean-800">Zone Map</h2></div>;
const Alerts = () => <div className="clay-card p-10 min-h-[60vh] flex items-center justify-center"><h2 className="text-2xl font-bold text-ocean-800">Risk Alerts</h2></div>;
const AdminPanel = () => <div className="clay-card p-10 min-h-[60vh] flex items-center justify-center"><h2 className="text-2xl font-bold text-ocean-800">Admin Panel</h2></div>;
const Reports = () => <div className="clay-card p-10 min-h-[60vh] flex items-center justify-center"><h2 className="text-2xl font-bold text-ocean-800">Research Reports</h2></div>;

function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="simulation" element={<Simulation />} />
            <Route path="map" element={<Map />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="admin" element={<AdminPanel />} />
            <Route path="reports" element={<Reports />} />
            <Route path="*" element={<div className="clay-card p-10 text-center"><h2 className="text-2xl font-bold text-ocean-800">404 Not Found</h2></div>} />
          </Route>
        </Routes>
      </AlertProvider>
    </AuthProvider>
  );
}

export default App;
