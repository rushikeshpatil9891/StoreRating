import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import StoresList from './pages/StoresList.jsx';
import StoreDetails from './pages/StoreDetails.jsx';
import StoreForm from './pages/StoreForm.jsx';
import RatingHistory from './pages/RatingHistory.jsx';
import RatingManagement from './pages/RatingManagement.jsx';
import UserProfile from './pages/UserProfile.jsx';
import UserList from './pages/UserList.jsx';
import UserForm from './pages/UserForm.jsx';
import UserAnalytics from './pages/UserAnalytics.jsx';
import Notifications from './pages/Notifications.jsx';
import AdvancedSearch from './pages/AdvancedSearch.jsx';
import DataExport from './pages/DataExport.jsx';
import SystemMonitoring from './pages/SystemMonitoring.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stores"
              element={
                <ProtectedRoute>
                  <StoresList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stores/:id"
              element={
                <ProtectedRoute>
                  <StoreDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stores/new"
              element={
                <ProtectedRoute requiredRole="store_owner">
                  <StoreForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stores/:id/edit"
              element={
                <ProtectedRoute>
                  <StoreForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ratings/history"
              element={
                <ProtectedRoute>
                  <RatingHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ratings/manage"
              element={
                <ProtectedRoute requiredRole="store_owner">
                  <RatingManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute requiredRole="admin">
                  <UserList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/new"
              element={
                <ProtectedRoute requiredRole="admin">
                  <UserForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/:id/edit"
              element={
                <ProtectedRoute requiredRole="admin">
                  <UserForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/analytics"
              element={
                <ProtectedRoute requiredRole="admin">
                  <UserAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <AdvancedSearch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/export"
              element={
                <ProtectedRoute requiredRole="admin">
                  <DataExport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/system"
              element={
                <ProtectedRoute requiredRole="admin">
                  <SystemMonitoring />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
