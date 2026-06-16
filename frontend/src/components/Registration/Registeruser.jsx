import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, TextField, MenuItem, Alert } from '@mui/material';
import { DataGrid, GridToolbarQuickFilter } from '@mui/x-data-grid';
import api from '../../services/api';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';


const RegisterForm = () => {
    const navigate = useNavigate();
  const [message, setMessage] = useState({ type: '', text: '' });
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    RoleID: 0,
    FirstName: '',
    LastName: '',
    EmailID: '',
  });

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/code/getUser');
      const enrichedUsers = response.data.user.map((user, index) => ({
        id: index + 1,
        ...user,
      }));
      setUsers(enrichedUsers);
    } catch (error) {
      if(error.status==401&&error.response.data.message=="Invalid Token")
        {
          navigate("/");
        }else
        {
          console.log('Failed to fetch users', error);
        } 
  
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get('/api/code/getRoles');
      setRoles(response.data.roleslist);
    } catch (error) {
      if(error.status==401&&error.response.data.message=="Invalid Token")
        {
          navigate("/");
        }else
        {
          console.log('Failed to fetch users', error);
        }  
    }
  };
  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.RoleID === 0) {
      setMessage({
        type: 'error',
        text: 'Please select role (Admin or User).',
      });
      return;
    }
    try {
      const response = await api.post('/api/code/registerUser', formData);
      setMessage({ type: 'success', text: response.data.message });
      fetchUsers();
      setFormData({ RoleID: 0, FirstName: '', LastName: '', EmailID: '' });
    } catch (err) {
      if(err.status==401&&err.response.data.message=="Invalid Token")
        {
          navigate("/");
        }else
        {
          setMessage({
            type: 'error',
            text: err.response?.data?.message || 'Registration failed',
          });
        } 
    
    }
  };

  const handleToggleStatus = async (userId, isActive) => {
    try {
      const newStatus = isActive ? 0 : 1;
      const response = await api.put('/api/code/toggleUserStatus', {
        userId: userId,
        isActive: newStatus,
      });

      if (response.data.success) {
        fetchUsers();
        setMessage({
          type: 'success',
          text: newStatus === 1 ? 'User activated successfully!' : 'User deactivated successfully!',
        });
      }
    } catch (err) {
      if(err.status==401&&err.response.data.message=="Invalid Token")
        {
          navigate("/");
        }else
        {
          setMessage({
            type: 'error',
            text: 'Failed to toggle user status.',
          });
        }    
    }
  };

    const handleExportToExcel = () => {
      const dataForExport = users.map(({ FirstName,LastName,EmailID,Username,RoleName,CreatedDate,LastLoginDateAndTime, UserStatus},index) => ({
        "Sr.No": index + 1,
        "First Name": FirstName,
        "Last Name": LastName,
        "Email ID": EmailID,
        "User Name": Username,
        "Role Name": RoleName,
        "User Status": UserStatus,
        "User Creation Date": CreatedDate,
        "User Last Login Date and Time": LastLoginDateAndTime
      }));  
      const ws = XLSX.utils.json_to_sheet(dataForExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws,'Users');
      XLSX.writeFile(wb, 'RegisteredUserList.xlsx');
    };

  const columns = [
    { field: 'id', headerName: 'S.No', width: 70 },
    { field: 'FirstName', headerName: 'First Name', width: 130 },
    { field: 'LastName', headerName: 'Last Name', width: 130 },
    { field: 'Username', headerName: 'User Name', width: 130 },
    { field: 'EmailID', headerName: 'Email', width: 200 },
    { field: 'RoleName', headerName: 'Role', width: 100 },
    { field: 'UserStatus', headerName: 'Status', width: 120 },
    { field: 'CreatedDate', headerName: 'Created Date', width: 150 },
    { field: 'LastLoginDateAndTime', headerName: 'Last Login', width: 170 },
    {
      field: 'action',
      headerName: 'Action',
      width: 200,
      renderCell: (params) => (
        <Button
          variant="contained"
          sx={{
            backgroundColor: params.row.UserStatus === 'Active' ? 'green' : '#f44336',
            fontWeight: 'bold',
            color: '#fff',
            '&:hover': {
              backgroundColor: params.row.UserStatus === 'Active' ? 'darkgreen' : '#d32f2f',
            },
          }}
          onClick={() => handleToggleStatus(params.row.UserID, params.row.IsActive)}
        >
          {params.row.UserStatus === 'Active' ? 'Deactivate' : 'Activate'} User
        </Button>
      ),
    },
  ];

  return (
    <Box p={2}>
      <Box>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                size="small" 
                fullWidth
                label="Role"
                name="RoleID"
                value={formData.RoleID}
                onChange={handleChange}
                sx={{
                  width: "225px",
                  "& .MuiInputBase-root": { height: "40px" },
                }}
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                size="small" 
                fullWidth
                label="First Name"
                name="FirstName"
                value={formData.FirstName}
                onChange={handleChange}
                sx={{
                  width: "225px",
                  "& .MuiInputBase-root": { height: "40px" },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
               size="small" 
               fullWidth
                label="Last Name"
                name="LastName"
                value={formData.LastName}
                onChange={handleChange}
                sx={{
                  width: "225px",
                  "& .MuiInputBase-root": { height: "40px" },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                 size="small" 
                 fullWidth
                label="Email"
                name="EmailID"
                type="email"
                value={formData.EmailID}
                onChange={handleChange}
                sx={{
                  width: "225px",
                  "& .MuiInputBase-root": { height: "40px" },
                }}
              />
            </Grid>
            <Grid container item xs={12} spacing={2} justifyContent="flex-end">
              <Grid item xs={12} sm={4}>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    backgroundColor: '#7c6fcd',
                    fontWeight: 'bold',
                    color: '#fff',
                    width: '100%',
                    padding: '10px',
                    '&:hover': { backgroundColor: '#5c4dbf' },
                    height: '40px',
                  }}
                >
                  Add User
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  onClick={handleExportToExcel}
                  variant="contained"
                  color="primary"
                  sx={{
                    backgroundColor: '#7c6fcd',
                    fontWeight: 'bold',
                    color: '#fff',
                    width: '100%',
                    padding: '10px',
                    '&:hover': { backgroundColor: '#5c4dbf' },
                    height: '40px',
                  }}
                >
                  Export to Excel
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </Box>

      <Box sx={{ width: '100%', overflow: 'auto', mt: '5px' }}>
        {message.text && (
          <Alert
                 severity={message.type}
                 sx={{
                   width: "75%",       
                   fontSize: "16px", 
                   fontWeight: 500,
                   letterSpacing: "0.3px",
                   px: 1,                     
                   mb:1
                 }}
               >
                 {message.text}
               </Alert>
        )}
      </Box>
      <Box
        sx={{
          height: '70vh',
          width: '100%',
          overflow: 'auto',
          border: '1px solid #ccc',
          '@media (max-width:600px)': {
            height: '50vh',
          },
        }}
      >
        <DataGrid
          rows={users}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 15, 20]}
          disableRowSelectionOnClick
          components={{ Toolbar: () => <GridToolbarQuickFilter /> }}
          sx={{height: '72vh',
            '& .MuiDataGrid-root': { border: 'none' },
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: '#ede7f6',
              fontWeight: 'bold',
              fontSize: '16px',
              textAlign: 'center',
              borderBottom: '2px solid #7c6fcd',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              width: '100%',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '16px',
              color: '#4a3780',
            },
            '& .MuiDataGrid-cell': {
              textAlign: 'center',
              fontSize: '14px',
              color: '#000',
              fontWeight: 'normal',
              border: '1px solid #ddd',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#f5f5f5',
            },
            '@media (max-width:600px)': {
              '& .MuiDataGrid-columnHeader': {
                fontSize: '14px',
              },
              '& .MuiDataGrid-cell': {
                fontSize: '12px',
              },
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default RegisterForm;
