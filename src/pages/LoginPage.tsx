import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance'; // Axios instance with baseURL
import { TextField, Button, Box, Typography } from '@mui/material';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post('/auth/login', { username, password });
      localStorage.setItem('token', response.data.token);
      console.log(localStorage.getItem('token') )
      navigate('/dashboard'); // Redirect on success
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <Box display="flex" flexDirection="column" maxWidth={400} margin="auto" mt={10} gap={2}>
      <Typography variant="h5" align="center">Login</Typography>
      <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <Typography color="error">{error}</Typography>}
      <Button variant="contained" onClick={handleLogin}>Login</Button>
    </Box>
  );
};

export default Login;
