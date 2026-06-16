import React, { useState, useEffect } from "react";
import { Box, Button,Grid, Alert } from "@mui/material";
import api from '../../services/api';
import { DataGrid, GridToolbarQuickFilter } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enGB } from 'date-fns/locale';

const AllCodeList = () => {
  const [codes, setCodes] = useState([]);
  const [filteredCodes, setFilteredCodes] = useState([]);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCodeHistory();
  }, []);

  const fetchCodeHistory = async () => {
    try {
      const response = await api.get("/api/code/getAllCodes");
      const enrichedCodes = response.data.codes.map((code, index) => ({
        id: code.CodeId,
        RoleID: code.RoleID,
        UserId: code.UserId,
        FirstName: code.FirstName,
        LastName: code.LastName,
        serialNumber: index + 1,
        code: code.Code,
        createdDate: code.CreatedDate.toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }),
        isUsed: code.IsUsed,
        userRemarks: code.UserRemarks,
        adminRemarks: code.AdminRemarks,
        CodeStatus: code.CodeStatus,
      }));
      setCodes(enrichedCodes);
      setFilteredCodes(enrichedCodes);
    } catch (error) {
      if(error.status==401&& error.response.data.message=="Invalid Token")
        {
          navigate("/");
        }else
        {
          console.log('Failed to fetch codes', error);
        }    
    
    }
  };

  const handleExportToExcel = () => {
    const filteredForExport = filteredCodes.map(({ serialNumber, FirstName, LastName, RoleID, code, CodeStatus, userRemarks, adminRemarks, createdDate }) => ({
      "Sr.No": serialNumber,
      "First Name": FirstName,
      "Last Name": LastName,
      "User Role": RoleID === 1 ? 'Admin' : 'User',
      "Generated Code": code,
      "Code Status": CodeStatus,
      "User Remarks": userRemarks,
      "Admin Remarks": adminRemarks,
      "Generated Date": createdDate,
    }));

    const ws = XLSX.utils.json_to_sheet(filteredForExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Codes');
    XLSX.writeFile(wb, 'GeneratedCodeList.xlsx');
  };

  const handleToggleUsedUnused = async (id, isUsed) => {
    try {
      const newStatus = isUsed ? 0 : 1;
      const response = await api.put('/api/code/toggleCodeStatus', {
        codeId: id,
        IsUsed: newStatus
      });

      if (response.data.success) {
        fetchCodeHistory();
      }
    } catch (err) {
      if(err.status==401&&err.response.data.message=="Invalid Token")
        {
          navigate("/");
        }else
        {
          console.log('Failed to toggle user status.', err);
        }    
    }
  };

  const filterByDateRange = (codes, fromDate, toDate) => {
    if (!fromDate && !toDate) {
      setMessage({ type: 'error', text:"Please select from and to date" });
      return codes;
    }
    if (!fromDate) {
      setMessage({ type: 'error', text:"Please select from date" });
      return codes;
    }
    if (!toDate) {
      setMessage({ type: 'error', text:"Please select to date" });
      return codes;
    }
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      setMessage({ type: 'error', text:"From Date cannot be later than To Date" });
      return codes;
    }

    setMessage({ type: '', text:"" });

    const formattedFromDate = formatDate(fromDate);
    const formattedToDate = formatDate(toDate);

    const filtered = codes.filter(code => {
      const codeDate = new Date(code.createdDate.split(' ')[0].split('/').reverse().join('-')).toLocaleDateString('en-GB');
      return codeDate >= formattedFromDate && codeDate <= formattedToDate;
    });

    return filtered.map((code, index) => ({
      ...code,
      serialNumber: index + 1,
    }));
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleFilterClick = () => {
    const filtered = filterByDateRange(codes, fromDate, toDate);
    setFilteredCodes(filtered);
  };

  const columns = [
    { field: "serialNumber", headerName: "S.No", width: 90 },
    {
      field: "UserFullName",
      headerName: "Name",
      width: 150,
      renderCell: ({ row }) => `${row.FirstName} ${row.LastName}`
    },
    {
      field: "RoleID",
      headerName: "Role",
      width: 150,
      renderCell: ({ row }) => (row.RoleID === 1 ? 'Admin' : 'User')
    },
    { field: "code", headerName: "Code", width: 120 },
    { field: "CodeStatus", headerName: "Code Status", width: 120 },
    {
      field: "action",
      headerName: "Action",
      width: 150,
      renderCell: ({ row }) => (
        <Button
          variant="contained"
          sx={{ bgcolor: row.isUsed ? 'green' : 'red', color: '#fff', fontWeight: 'bold', height: '40px', borderRadius: '5px', '&:hover': { backgroundColor: row.isUsed ? 'darkgreen' : 'darkred' } }}
          disabled={row.isUsed}
          onClick={() => handleToggleUsedUnused(row.id, row.isUsed)}
        >
          {row.isUsed ? 'Code Used' : 'Use Code'}
        </Button>
      )
    },
    { field: "userRemarks", headerName: "User Remarks", width: 200 },
    { field: "adminRemarks", headerName: "Admin Remarks", width: 200 },
    { field: "createdDate", headerName: "Generated Date", width: 180 },
    {
      field: "addremark",
      headerName: "Add Remark",
      width: 150,
      renderCell: ({ row }) => (
        <Button
          variant="contained"
          sx={{ backgroundColor: "#7c6fcd", color: "#fff", fontWeight: "bold", height: '40px', borderRadius: '5px', '&:hover': { backgroundColor: '#5c4dbf' } }}
          onClick={() => navigate('/addremarks', {
            state: { id: row.id, code: row.code, userid: row.UserId,RoleID:row.RoleID, remarks: row.RoleID === 1 ? row.adminRemarks : row.userRemarks }
          })}
        >
          Add Remark
        </Button>
      )
    }
  ];

  return (
    <Box p={2}>
      <Grid container spacing={1.5} justifyContent="center" alignItems="center" textAlign="center">
        <Grid item xs={12} sm={4} md={2.5}>
          <LocalizationProvider dateAdapter={AdapterDateFns} locale={enGB}>
            <DatePicker
                       label="From Date"
                       value={fromDate}
                       onChange={setFromDate}
                       slotProps={{
                         textField: {
                           fullWidth: true,
                           size: "small",
                           sx: {  width: 250,
                             "& .MuiInputBase-root": { height: 40 },
                           }
                         }
                       }}
                     />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12} sm={4} md={2.5}>
          <LocalizationProvider dateAdapter={AdapterDateFns} locale={enGB}>
            <DatePicker
                         label="To Date"
                         value={toDate}
                         onChange={setToDate}
                         slotProps={{
                           textField: {
                             fullWidth: true,
                             size: "small",
                             sx: {  width: 250,
                               "& .MuiInputBase-root": { height: 40 },
                             }
                           }
                         }}
                       />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={6} sm={2} md={2}>
          <Button
            fullWidth
            onClick={handleFilterClick}
            variant="contained"
            sx={{
              backgroundColor: '#7c6fcd',
              fontWeight: "bold",
              color: '#fff',
              height: '40px',
              borderRadius: '5px',
              '&:hover': { backgroundColor: '#5c4dbf' }
            }}
          >
            Filter
          </Button>
        </Grid>

        <Grid item xs={6} sm={2} md={2}>
          <Button
            fullWidth
            onClick={handleExportToExcel}
            variant="contained"
            sx={{
              backgroundColor: '#7c6fcd',
              fontWeight: "bold",
              color: '#fff',
              height: '40px',
              borderRadius: '5px',
              '&:hover': { backgroundColor: '#5c4dbf' }
            }}
          >
            Export
          </Button>
        </Grid>
      </Grid>

      {message.text && (
        <Box mt={1}>
         <Alert
                severity={message.type}
                sx={{
                  width: "55%",        
                  mx: "auto",                
                  fontSize: "16px", 
                  fontWeight: 500,
                  letterSpacing: "0.3px",
                  px: 1,                    
                }}
              >
                {message.text}
              </Alert>
        </Box>
      )}

      <Box mt={1} sx={{
        height: '70vh',
        width: '100%',
        border: '1px solid #ccc',
        overflow: 'auto'
      }}>
        <DataGrid
          rows={filteredCodes}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 15, 20]}
          disableRowSelectionOnClick
          components={{ Toolbar: () => <GridToolbarQuickFilter /> }}
          sx={{
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: '#ede7f6',
              fontWeight: 'bold',
              fontSize: '16px',
              borderBottom: '2px solid #7c6fcd',
              textAlign: 'center'
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
          }}
        />
      </Box>
    </Box>
  );
};

export default AllCodeList;
