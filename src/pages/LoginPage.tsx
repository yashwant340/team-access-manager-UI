import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import { TextField, Button, Box, Typography, CircularProgress, Paper, Stack, InputAdornment } from '@mui/material';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from '../providers/AuthProvider';
import { getDashboardRoute } from '../utils/RoleUtils';
import RequestAccessModal from './RequestAccessModal';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requesAccessModalOpen, setRequestAccessModalOpen] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRequestAccessOpen = () => {
    setRequestAccessModalOpen(true);
  }

  const closeRequestAccessModal = () => {
    setRequestAccessModalOpen(false);
  }

  

  const handleForgotPasswordOpen = () => {
      navigate("/forgot-password")
  }

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setLocalLoading(true);

    try {
      const res = await axios.post('/auth/login', { username, password });
      const token: string | undefined = res.data?.token;

      if (!token) {
        setError('No token in response');
        setLocalLoading(false);
        return;
      }

      const user = await login(token);

      if (!user) {
        setError('Failed to fetch user after login');
        setLocalLoading(false);
        return;
      }
      navigate(getDashboardRoute(user.platformRole), { replace: true });
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <Box className="page-shell" sx={{ display: 'grid', placeItems: 'center', px: 2, py: 5 }}>
      <Paper className="app-surface" elevation={0} sx={{ width: 'min(460px, 100%)', p: { xs: 3, sm: 5 } }}>
        <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '.14em' }}>TEAM ACCESS MANAGER</Typography>
        <Typography variant="h4" sx={{ mt: 1, mb: 1 }}>Welcome back</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>Sign in to manage access requests and workspace permissions.</Typography>
        <Stack spacing={2} component="form" onSubmit={handleLogin}>
          <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" fullWidth InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutlineRoundedIcon color="action" /></InputAdornment> }} />
          <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" fullWidth InputProps={{ startAdornment: <InputAdornment position="start"><LockOutlinedIcon color="action" /></InputAdornment> }} />
          {error && <Typography color="error" variant="body2">{error}</Typography>}
          <Button type="submit" variant="contained" size="large" fullWidth disabled={localLoading}>
            {localLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Sign in'}
          </Button>
        </Stack>
        <Box className="auth-links" display="flex" justifyContent="space-between" mt={2}>
          <Button size="small" onClick={handleForgotPasswordOpen}>Forgot password?</Button>
          <Button size="small" onClick={handleRequestAccessOpen}>Request access</Button>
        </Box>

        { requesAccessModalOpen && <RequestAccessModal open = {requesAccessModalOpen} onClose={closeRequestAccessModal} />}
      </Paper>
    </Box>
  );
};

export default LoginPage;
