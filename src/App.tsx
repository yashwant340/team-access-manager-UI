import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import LoginPage from './pages/LoginPage';
import { StoreProvider } from 'easy-peasy';
import store from './store';
import { AuthProvider } from './providers/AuthProvider';
import PrivateRoute from './components/PrivateRoute';
import { ToastContainer } from 'react-toastify';


const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <StoreProvider store={store}>
          <ToastContainer 
            position="top-right" 
            autoClose={3000} 
            hideProgressBar={false} 
            newestOnTop 
            closeOnClick 
            pauseOnHover
          />
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/platform-admin"
              element={
                <PrivateRoute roles={['PLATFORM_ADMIN']}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/team-admin"
              element={
                <PrivateRoute roles={['TEAM_ADMIN']}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/user-dashboard"
              element={
                <PrivateRoute roles={['USER']}>
                  <UserDashboard />
                </PrivateRoute>
              }
            />

            <Route path="/not-found" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </StoreProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
