import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/LoginPage'; 
import { StoreProvider } from 'easy-peasy';
import store from './store';
import { AuthProvider } from './providers/AuthProvider';


const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <StoreProvider store={store}>
          <Routes>
            <Route
              path="/platform-admin"
              element={
                localStorage.getItem('token') ? (
                  <AdminDashboard />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/team-admin"
              element={
                localStorage.getItem('token') ? (
                  <AdminDashboard />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/user-dashboard"
              element={
                localStorage.getItem('token') ? (
                  <AdminDashboard />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </StoreProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
