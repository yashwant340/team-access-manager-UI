import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/LoginPage'; 
import { StoreProvider } from 'easy-peasy';
import store from './store';
import { AuthProvider } from './providers/AuthProvider';

const App: React.FC = () => {
  const token = localStorage.getItem('token'); 

  return (
    
    <AuthProvider>
      <StoreProvider store={store}>
        <Router>
          <Routes>
            <Route
              path="/dashboard"
              element={
                token ? <AdminDashboard /> : <Navigate to="/login" replace />
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </StoreProvider>
    </AuthProvider>
  );
};

export default App;
