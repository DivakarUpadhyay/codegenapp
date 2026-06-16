import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import api from '../../services/api';
import { useLocation,useNavigate } from 'react-router-dom';
import { Edit } from '@mui/icons-material'; 

const AddRemarks = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const id = location.state?.id || '';
  const code = location.state?.code || '';
  const UserId = location.state?.userid || '';
  const RoleID = location.state?.RoleID || '';
  const initialRemarks = location.state?.remarks || '';
  const [remarks, setRemarks] = useState(initialRemarks);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleRemarksChange = (event) => {
    setRemarks(event.target.value);
  };

  const handleSubmit = async () => {
    try {
      const response = await api.post('/api/code/addRemark', {
        id,
        UserId,
        remarks,
      });
      setMessage({
        type: 'success',
        text: response.data.message || 'Remark updated successfully.',
      });
    } catch (error) {
      if(error.status==401&&error.response.data.message=="Invalid Token")
        {
          navigate("/");
        }else
        {
          if (error.response && error.response.data) {
            setMessage({
              type: 'error',
              text: error.response.data.message || 'Failed to update remark.',
            });
          } else {
            setMessage({
              type: 'error',
              text: 'An unexpected error occurred. Please try again.',
            });
          }
        }      
    }
  };
  if (!UserId || !RoleID) return <div style={{ padding: '2rem', textAlign: 'center',marginTop:'105px' }}>
  <h2>🚫 Access Denied</h2>
  <p>Add remark page is not accessible directly</p>
  <button onClick={() => navigate('/home')}   style={{
backgroundColor: '#7c6fcd',
color: '#fff',
fontWeight: 'bold',
height: '40px'
}}>
    Go Back to Home
  </button>
</div>;
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        maxWidth: 480,
        mx: 'auto',
        my: 3,
        padding: { xs: 3, sm: 4 },
        borderRadius: '10px',
        boxShadow: '0 3px 15px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#fafafa', // Light background to contrast the main color
        border: '1px solid #7c6fcd',
        backgroundImage: 'linear-gradient(135deg, #f7f7f7 0%, #ede7f6 100%)',
        position: 'relative', // To position the background elements
        overflow: 'hidden', // Hide any overflowing decorations
      }}
    >
      {/* Left Side Decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '-15%',
          width: '25%',
          height: '80%',
          background: '#7c6fcd', // Primary color for left side
          borderRadius: '50%',
          opacity: 0.1,
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />
      
      {/* Right Side Decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '-15%',
          width: '25%',
          height: '80%',
          background: '#7c6fcd', // Primary color for right side
          borderRadius: '50%',
          opacity: 0.1,
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />

      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontWeight: 700,
          color: '#333',
          textAlign: 'center',
          fontSize: '1.4rem',
          marginBottom: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        <Edit sx={{ color: '#7c6fcd' }} />
        Add {RoleID==1?"Admin":RoleID==2?"User":""} Remark
      </Typography>

      {message.text && (
        <Alert
          severity={message.type}
          sx={{
            mb: 3,
            width: '100%',
            textAlign: 'center',
            fontSize: '1rem',
            fontWeight: '500',
            borderRadius: '6px',
            backgroundColor: message.type === 'error' ? '#f28a8a' : '#a3d9a5', // Soft muted red for error and green for success
            color: '#333',
          }}
        >
          {message.text}
        </Alert>
      )}

      <TextField
        label="Code"
        value={code}
        fullWidth
        variant="outlined"
        InputProps={{
          readOnly: true,
        }}
        sx={{
          mb: 2,
          '& .MuiInputBase-root': {
            backgroundColor: '#f7f7f7',
            borderRadius: '6px',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#7c6fcd',
          },
        }}
      />

      <TextField
        label="Remarks"
        multiline
        rows={3}
        value={remarks}
        onChange={handleRemarksChange}
        fullWidth
        variant="outlined"
        sx={{
          mb: 3,
          '& .MuiInputBase-root': {
            backgroundColor: '#f7f7f7',
            borderRadius: '6px',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#7c6fcd',
          },
        }}
      />

      {/* Divider for decoration */}
      <Box sx={{
        width: '100%',
        borderBottom: '2px dashed #7c6fcd',
        marginBottom: 3,
        marginTop: 2
      }} />

      <Button
        variant="contained"
        onClick={handleSubmit}
        sx={{
          backgroundColor: '#7c6fcd',
          fontWeight: 'bold',
          color: '#fff',
          width: '100%',
          height: '45px',
          fontSize: '1rem',
          borderRadius: '8px',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: '#5c4dbf', // Darker shade of the same color for hover effect
            transform: 'scale(1.05)',
          },
        }}
        size="small"
      >
        Submit Remark
      </Button>
    </Box>
  );
};

export default AddRemarks;
