import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Avatar, useTheme, useMediaQuery } from '@mui/material';
import { Link } from 'react-router-dom';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

const Header = ({ onLogout, username, RoleID,hideMenus }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const roleLabel = Number(RoleID) === 1 ? 'Admin' : 'User';
  return (
    <AppBar position="sticky" sx={{ boxShadow: 4, background: '#7c6fcd' }}>
      <Toolbar sx={{ padding: '0 20px', fontWeight: 'bold', color: '#fff', flexWrap: 'wrap' }}>
        <Typography
          variant="h6"
          sx={{
            color: '#fff',
            fontWeight: "bold",
            flexGrow: 1,
            fontSize: isMobile ? '1.3rem' : '1.5rem',
            textAlign: isMobile ? 'center' : 'left'
          }}
        >
          Unique Code System — Demo
        </Typography>
        {!hideMenus && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', flexGrow: 1, flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-start' }}>
            <Typography
              component={Link}
              to="/generatecode"
              sx={{
                color: '#fff',
                textDecoration: 'none',
                marginRight: isMobile ? '15px' : '30px',
                cursor: 'pointer',
                fontSize: isMobile ? '1rem' : '1.1rem',
                '&:hover': {
                  color: '#ede7f6',
                  textShadow: '0 0 12px rgba(255,255,255,0.6)',
                  transition: 'color 0.3s ease, text-shadow 0.3s ease'
                }
              }}
            >
              Generate Code
            </Typography>
            {Number(RoleID) === 1 && (
              <>
                <Typography
                  component={Link}
                  to="/registeruser"
                  sx={{
                    color: '#fff',
                    textDecoration: 'none',
                    marginRight: isMobile ? '15px' : '30px',
                    cursor: 'pointer',
                    fontSize: isMobile ? '1rem' : '1.1rem',
                    '&:hover': {
                      color: '#ede7f6',
                      textShadow: '0 0 12px rgba(255,255,255,0.6)',
                      transition: 'color 0.3s ease, text-shadow 0.3s ease'
                    }
                  }}
                >
                  Add User
                </Typography>
                <Typography
                  component={Link}
                  to="/allcodelist"
                  sx={{
                    color: '#fff',
                    textDecoration: 'none',
                    marginRight: isMobile ? '15px' : '30px',
                    cursor: 'pointer',
                    fontSize: isMobile ? '1rem' : '1.1rem',
                    '&:hover': {
                      color: '#ede7f6',
                      textShadow: '0 0 12px rgba(255,255,255,0.6)',
                      transition: 'color 0.3s ease, text-shadow 0.3s ease'
                    }
                  }}
                >
                  Master Code List
                </Typography>
              </>
            )}
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-end' }}>
          <Typography
            variant="body1"
            sx={{
              color: '#fff',
              fontWeight: "bold",
              marginRight: '15px',
              fontSize: isMobile ? '0.9rem' : '1.1rem',
              textAlign: isMobile ? 'center' : 'left'
            }}
          >
            Welcome {roleLabel}: {username}
          </Typography>
          <Avatar sx={{
            width: 40,
            height: 40,
            bgcolor: 'rgba(255,255,255,0.2)',
            marginRight: '15px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            border: '3px solid #fff'
          }} />
          <IconButton
            sx={{
              bgcolor: 'rgba(255,255,255,0.15)',
              color: '#fff',
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.3)',
                transform: 'scale(1.1)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.3s ease-in-out'
              },
            }}
            onClick={onLogout}
          >
            <ExitToAppIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
