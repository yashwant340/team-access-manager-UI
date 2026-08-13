import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import LoginPage from './pages/LoginPage';
import { StoreProvider } from 'easy-peasy';
import store from './store';
import { AuthProvider } from './providers/AuthProvider';
import PrivateRoute from './components/PrivateRoute';
import { ToastContainer } from 'react-toastify';
import ResetPassword from './pages/ResetPassword';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#4656c8', dark: '#3543a6', light: '#6d78dc' },
    secondary: { main: '#0f766e' },
    background: { default: '#f5f7fb', paper: '#ffffff' },
    text: { primary: '#182230', secondary: '#5f6b7a' },
    divider: '#e4e8ef',
  },
  typography: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h4: { fontWeight: 750, letterSpacing: '-0.035em' },
    h5: { fontWeight: 700, letterSpacing: '-0.025em' },
    h6: { fontWeight: 700 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 10, fontWeight: 700, textTransform: 'none', boxShadow: 'none' } } },
    MuiCard: { styleOverrides: { root: { borderRadius: 16, border: '1px solid #e4e8ef', boxShadow: '0 8px 24px rgba(24,34,48,.06)' } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiTextField: { defaultProps: { variant: 'outlined', size: 'small' } },
    MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 700 } } },
  },
});


const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
            <Route path="/" element={<Navigate to="/login" replace />} />
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

            <Route path='/forgot-password' element={<ResetPassword />} />

            <Route path="/not-found" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </StoreProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;
