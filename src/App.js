import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import AppNavbar from './components/layout/Navbar';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GymListPage from './pages/GymListPage';
import GymDetailPage from './pages/GymDetailPage';
import BookingPage from './pages/BookingPage';
import ProfilePage from './pages/ProfilePage';
import SubscriptionPage from './pages/SubscriptionPage';
import NotificationsPage from './pages/NotificationsPage';
import GymLoadStatusPage from './pages/GymLoadStatusPage'; 
import CombinedSubscriptionsAndBookings from './pages/CombinedSubscriptionsAndBookings';
import AdminDashboard from "./admin/AdminDashboard";
import AdminLogin from "./admin/AdminLogin";
import AdminRoute from "./admin/AdminRoute";

const ProtectedRoute = ({ children, adminRequired = false }) => {
  const isAuthenticated = localStorage.getItem('token');
  

  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (adminRequired && !isAdmin) {
    return <Navigate to="/" />;
  }
  
  return children;
};

const GuestRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function AppRoutes() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
      setIsAdmin(localStorage.getItem('isAdmin') === 'true');
    };

    window.addEventListener('storage', handleStorageChange);
    
    setIsAuthenticated(!!localStorage.getItem('token'));
    setIsAdmin(localStorage.getItem('isAdmin') === 'true');

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <Router>
      <div className="App">
        <AppNavbar isAuthenticated={isAuthenticated} isAdmin={isAdmin} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          
          <Route 
            path="/login" 
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            } 
          />
          
          <Route 
            path="/register" 
            element={
              <GuestRoute>
                <RegisterPage />
              </GuestRoute>
            } 
          />
          <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <CombinedSubscriptionsAndBookings />
            </ProtectedRoute>
          }
          />
          <Route
          path="/admin-login"
          element={
            <GuestRoute>
              <AdminLogin />
            </GuestRoute>
          }
          />
          <Route
          path="/admin-dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
          />
          <Route 
          path="/gyms" 
          element=
          {<GymListPage />} 
          />
          <Route 
          path="/gyms/:id" 
          element=
          {<GymDetailPage />} 
          />
          <Route 
          path="/gym-load-status" 
          element=
          {<GymLoadStatusPage />}
           />
          <Route 
            path="/bookings" 
            element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/subscriptions" 
            element={
              <ProtectedRoute>
                <SubscriptionPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/notifications" 
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<div className="container py-5 text-center">
            <h1>404</h1>
            <p className="lead">Страница не найдена</p>
            <a href="/" className="btn btn-primary">Вернуться на главную</a>
          </div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default AppRoutes;