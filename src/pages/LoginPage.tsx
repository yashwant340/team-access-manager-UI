import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import { TextField, Button, Box, Typography, CircularProgress, Paper } from '@mui/material';
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
    <Box display="flex" flexDirection="column" maxWidth={400} margin="auto" mt={10} gap={2}>
      <Paper sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h5" gutterBottom>Team Access Manager</Typography>
        <TextField style = {{padding: 8}} label="Username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
        <TextField style = {{padding: 8}} label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />

          {error && <Typography color="error">{error}</Typography>}
          <div style={{padding : 10}}>
            <Button type="submit" variant="contained" disabled={localLoading} onClick={handleLogin}>
              {localLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Login'}
            </Button>
          </div>
          
        <Box display="flex" justifyContent="space-between" mt={2}>
          <Button size="small" onClick={handleForgotPasswordOpen}>Forgot Password?</Button>
          <Button size="small" onClick={handleRequestAccessOpen}>Request Access</Button>
        </Box>

        { requesAccessModalOpen && <RequestAccessModal open = {requesAccessModalOpen} onClose={closeRequestAccessModal} />}
      </Paper>
    </Box>
  );
};

export default LoginPage;
