import React, { useState, useCallback } from 'react';
import { TextField, Button, Box, Typography, Grid } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const Login = ({ setAuthChanged }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/auth/login', { username, password });
      setAuthChanged(prev => !prev);
      setTimeout(() => navigate('/home'), 100);
    } catch (err) {
      setError('Invalid credentials');
    }
  }, [username, password, navigate, setAuthChanged]);

  return (
    <Box
      component="form"
      p={3}
      display="flex"
      flexDirection="column"
      alignItems="center"
      onSubmit={handleSubmit}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          bgcolor: '#ede7f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        <LockOutlinedIcon sx={{ fontSize: 40, color: '#7c6fcd' }} />
      </Box>

      <Typography sx={{ margin: "0.5px", fontWeight: 'bold' }} align="center" mb={2}>
        Demo Login
      </Typography>

      {error && <Typography color="error" mt={2}>{error}</Typography>}

      <TextField
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        sx={{ width: { xs: '90%', sm: '400px' }, maxWidth: '400px', height: '50px' }}
        margin="normal"
        autoComplete="username"
      />

      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ width: { xs: '90%', sm: '400px' }, maxWidth: '400px', height: '50px' }}
        margin="normal"
        autoComplete="current-password"
      />

      <Button
        type="submit"
        variant="contained"
        sx={{
          backgroundColor: '#7c6fcd',
          fontWeight: "bold",
          color: '#fff',
          width: '200px',
          height: '50px',
          padding: '10px 20px',
          margin: "10px",
          '&:hover': { backgroundColor: '#5c4dbf' },
        }}
        size="small"
      >
        Login
      </Button>

      <Typography variant="body2" mt={1}>
        <Link to="/Resetcredential" style={{ textDecoration: 'none', color: '#1976d2' }}>
          Forgot Password? Reset here
        </Link>
      </Typography>

      <Grid container spacing={2} sx={{ width: '100%' }}>
        <Grid item xs={12} md={6}>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Login;
