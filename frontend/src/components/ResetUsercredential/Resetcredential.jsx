import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  InputAdornment,
  IconButton,
  Divider
} from '@mui/material';
import { Visibility, VisibilityOff, LockReset } from '@mui/icons-material';
import api from '../../services/api';
import { Link as RouterLink } from 'react-router-dom'; 

const ResetUsercredential = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [step, setStep] = useState(1); 

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    if (step === 1 && !formData.email) {
      return 'Email is required.';
    } else if (step === 2 && !formData.password) {
      return 'Password is required.';
    }
    return null;
  };

  const checkEmailExistence = async (email) => {
    try {
      const response = await api.get("/api/code/checkEmailExistence", {
        params: { EmailID: email },
      });
      return response.data;
    } catch (error) {
      setErrorMessage('Failed to verify email.');
      setIsSuccess(false);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSuccess(false);

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    if (step === 1) {
      const data = await checkEmailExistence(formData.email);
      if (!data?.status) {
        setErrorMessage(data?.message || 'Email not found.');
        return;
      }

      setFormData(prev => ({
        ...prev,
        username: data.userdata.Username,
      }));

      setStep(2); 
      return;
    }

    try {
      const response = await api.post('/api/code/resetCredentials', formData);
      setSubmitted(true);
      setErrorMessage(response.data.message);
      setIsSuccess(response.data.status === 1);
      if (response.data.status === 1) {
        setFormData({
          username: '',
          email: '',
          password: '',
        });
        setStep(1); 
      }
    } catch (error) {
      setErrorMessage('Something went wrong while resetting credentials.');
      setIsSuccess(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 11 }}>
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          backgroundColor: '#f9f9f9',
          border: '1px solid #ddd',
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="center" mb={0.5}>
          <LockReset fontSize="medium" sx={{ color: '#7c6fcd' }} />
          <Typography variant="h6" fontWeight="bold" ml={1}>
            Reset Password
          </Typography>
        </Box>

        <Divider sx={{ mb: 1 }} />
        {errorMessage && (
          <Box
            sx={{
              backgroundColor: isSuccess ? '#4caf50' : '#d32f2f61',
              color: 'black',
              fontWeight: 'bold',
              fontSize: '14px',
              borderRadius: 1,
              p: 1,
              mb: 1.5,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" sx={{ color: isSuccess ? 'white' : 'black', fontSize: "medium" }}>
              {errorMessage}
            </Typography>
          </Box>
        )}

        <Typography variant="body2" align="center" color="text.secondary" mb={1.5}>
          {step === 1
            ? 'Please enter your email to continue.'
            : 'Please enter your username and new password.'}
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          {step === 1 && (
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="dense"
              tabIndex={1}
              autoComplete="off"
            />
          )}

          {step === 2 && (
            <>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                margin="dense"
                inputProps={{ readOnly: true }}
                tabIndex={2}
              />
              <TextField
                fullWidth
                label="New Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                margin="dense"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                tabIndex={3}
                autoComplete="off"
              />
            </>
          )}

          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{
              mt: 2,
              py: 1,
              backgroundColor: '#7c6fcd',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              '&:hover': {
                backgroundColor: '#5c4dbf',
              },
            }}
            tabIndex={4}
          >
            {step === 1 ? 'Next' : 'Reset Credentials'}
          </Button>
        </Box>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            <RouterLink to="/" style={{ textDecoration: 'none', color: '#1976d2' }}>
              Go Back to Login
            </RouterLink>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default ResetUsercredential;
