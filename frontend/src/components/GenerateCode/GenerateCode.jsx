import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Alert } from "@mui/material";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarQuickFilter
} from '@mui/x-data-grid';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enGB } from 'date-fns/locale';

const GenerateCode = ({ username, userid }) => {
  const [codes, setCodes] = useState([]);
  const [latestCode, setLatestCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [highlightedRowId, setHighlightedRowId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filteredCodes, setFilteredCodes] = useState([]);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const navigate = useNavigate();


  const generateCode = async () => {
    try {
      setLoading(true);
      const response = await api.post("/api/code/generateCode", { userid });
      const newCode = response.data;
      setLatestCode(newCode);
      setHighlightedRowId(newCode.code);
      await fetchCodeHistory();
      setTimeout(() => setHighlightedRowId(null), 3000);
    } catch (error) {
      if(error.status===401&& error.response.data.message==="Invalid Token")
        {
          navigate("/");
        }else
        {
          console.log("Error generating code:", error);
        }    
    } finally {
      setLoading(false);
    }
  };

  const fetchCodeHistory = async () => {
    try {
      const response = await api.get("/api/code/getCodes", {
        params: { userid }
      });
      const enrichedcodes = response.data.codes.map((code, index) => ({
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
        username: code.Username,
        UserFullName: code.UserFullName,
        emailID: code.EmailID,
        CodeStatus: code.CodeStatus,
      }));
      setCodes(enrichedcodes);
      setFilteredCodes(enrichedcodes);
    } catch (error) {
      if(error.status===401&& error.response.data.message==="Invalid Token")
        {
          navigate("/");
        }else
        {
          console.log('Failed to fetch codes', error);
        }    
      
      
    }
  };
  useEffect(() => {
    fetchCodeHistory();
  }, []);

  const handleToggleUsedUnused = async (id, IsUsed) => {
    try {
      const newStatus = IsUsed ? 0 : 1;
      const response = await api.put('/api/code/toggleCodeStatus', {
        codeId: id,
        IsUsed: newStatus
      });

      if (response.data.success) {
        fetchCodeHistory();
        setMessage({
          type: 'success',
          text: newStatus === 1 ? 'Code marked as used!' : 'Code marked as unused!'
        });
      }
    } catch (err) {
      if(err.status===401&& err.response.data.message==="Invalid Token")
        {
          navigate("/");
        }else
        {
          setMessage({
            type: 'error',
            text: 'Failed to toggle code status.'
          });
        }    
      
    }
  };

  const handleExportToExcel = () => {
    const filteredForExport = filteredCodes.map(({ 
      serialNumber, FirstName, LastName, RoleID, code, 
      CodeStatus, userRemarks, adminRemarks, createdDate 
    }) => ({
      "Sr.No": serialNumber,
      "First Name": FirstName,
      "Last Name": LastName,
      "User Role": RoleID === 1 ? 'Admin' : 'User',
      "Generated Code": code,
      "Code Status": CodeStatus,
      "User Remarks": userRemarks,
      "Admin Remarks": adminRemarks,
      "Generated Date": createdDate
    }));

    const ws = XLSX.utils.json_to_sheet(filteredForExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Codes');

    const roleName = filteredCodes.length > 0 && filteredCodes[0].RoleID === 1 ? "Admin" : "User";
    const fileName = `GeneratedCodeList_${roleName}.xlsx`;

    XLSX.writeFile(wb, fileName);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
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
    if (new Date(fromDate) > new Date(toDate)) {
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

  const handleFilterClick = () => {
    const filtered = filterByDateRange(codes, fromDate, toDate);
    setFilteredCodes(filtered);
  };

  const columns = [
    { field: "serialNumber", headerName: "S.No", width: 90 },
    { field: "UserFullName", headerName: "Name", width: 150 },
    { field: "code", headerName: "Code", width: 120 },
    { field: "userRemarks", headerName: "User Remarks", width: 200 },
    { field: "adminRemarks", headerName: "Admin Remarks", width: 200 },
    { field: "createdDate", headerName: "Generated Date", width: 180 },
    { field: "CodeStatus", headerName: "Code Status", width: 120 },
    {
      field: "action",
      headerName: "Action",
      width: 150,
      renderCell: (params) => (
        <Button
          variant="contained"
          sx={{
            bgcolor: params.row.isUsed ? 'green' : 'red',
            color: '#fff',
            fontWeight: 'bold',
            height: 40,
          }}
          disabled={params.row.isUsed}
          onClick={() => handleToggleUsedUnused(params.row.id, params.row.isUsed)}
        >
          {params.row.isUsed ? 'Code Used' : 'Use Code'}
        </Button>
      )
    },
    {
      field: "addremark",
      headerName: "Add Remark",
      width: 150,
      renderCell: (params) => (
        <Button
          variant="contained"
          sx={{ backgroundColor: "#7c6fcd", color: "#fff", fontWeight: "bold", height: 40 }}
          onClick={() => navigate('/addremarks', {
            state: {
              id: params.row.id,
              code: params.row.code,
              userid: params.row.UserId,
              RoleID: params.row.RoleID,
              remarks: params.row.RoleID === 1 ? params.row.adminRemarks : params.row.userRemarks
            }
          })}
        >
          Add Remark
        </Button>
      )
    },
  ];

  const CustomToolbar = () => (
    <GridToolbarContainer>
      <GridToolbarQuickFilter />
      <GridToolbarExport csvOptions={{ fileName: 'UserList' }} />
    </GridToolbarContainer>
  );

  return (
    <Box p={1.5}>    
      <Box display="flex" justifyContent="center" mb={0.1} gap={2} flexDirection="column">
        <Box display="flex" justifyContent="center" gap={2}>
          <TextField
            label="Latest Code"
            value={latestCode ? latestCode.code : "Code"}
            fullWidth
            InputProps={{ readOnly: true }}
            sx={{
              backgroundColor: "#cccccc59",
              width: "241px",
              "& .MuiInputBase-root": { height: "40px" },
            }}
          />
          <Button
            variant="contained"
            sx={{
              bgcolor: "#7c6fcd",
              color: "#fff",
              fontWeight: "bold",
              height: 40,
              px: 3,
            }}
            onClick={generateCode}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Code"}
          </Button>
          <Button
            variant="contained"
            sx={{
              bgcolor: "#7c6fcd",
              color: "#fff",
              fontWeight: "bold",
              height: 40,
              px: 3,
            }}
            onClick={handleExportToExcel}
          >
            Export to Excel
          </Button>
        </Box>

        <Box display="flex" justifyContent="center" gap={2}>
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
          <Button
            variant="contained"
            onClick={handleFilterClick}
            sx={{
              bgcolor: "#7c6fcd",
              color: "#fff",
              fontWeight: "bold",
              height: 40,
              px: 3,
            }}
          >
            Filter
          </Button>
        </Box>
        {message.text && (
       <Alert
       severity={message.type}
       sx={{
         width: "50%",        
         mx: "auto",                
         fontSize: "16px", 
         fontWeight: 500,
         letterSpacing: "0.3px",
         px: 1,                       
       }}
     >
       {message.text}
     </Alert>
     
      )}

      </Box>

      <Box mt={0.5} sx={{ height: '62vh', width: '100%'}}>
        <DataGrid
          rows={filteredCodes}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 15, 20]}
          disableRowSelectionOnClick
          components={{ Toolbar: CustomToolbar }}
          getRowClassName={(params) =>
            params.row.code === highlightedRowId ? 'highlighted-row' : ''
          }
          sx={{
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: '#ede7f6',
              color: '#4a3780',
              fontWeight: 'bold',
              fontSize: '16px',
              textAlign: 'center',
              borderBottom: '1px solid #7c6fcd',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              width: '100%',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '16px',
            },
            '& .MuiDataGrid-cell': {
              textAlign: 'center',
              borderBottom: '1px solid #ccc',
              borderRight: '1px solid #ccc',
            },
            '& .MuiDataGrid-row': {
              borderLeft: '1px solid #ccc',
              borderRight: '1px solid #ccc',
            },
            '& .highlighted-row': {
              animation: 'highlightFade 5s ease-in-out',
              backgroundColor: '#ffeaa7 !important',
            },
            '@keyframes highlightFade': {
              '0%': { backgroundColor: '#ffeaa7' },
              '100%': { backgroundColor: 'transparent' },
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default GenerateCode;
