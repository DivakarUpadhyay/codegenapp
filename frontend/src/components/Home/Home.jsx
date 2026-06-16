import React, { useEffect, useState } from 'react';
import { Button, Container, Box, Typography, Grid, Paper } from '@mui/material';
import { useNavigate } from "react-router-dom";

const Home = ({ welcomeImage }) => {
  const navigate = useNavigate();
  const [flyingNumbers, setFlyingNumbers] = useState([]);
  welcomeImage = './welcome-image.jpg'; 

  useEffect(() => {
    const generatedNumbers = new Set();

    const createFlyingNumbers = () => {
      const numCount = 30;
      const newNumbers = [];

      for (let i = 0; i < numCount; i++) {
        let randomNumber = generateRandomNumber();
        while (generatedNumbers.has(randomNumber)) {
          randomNumber = generateRandomNumber();
        }
        generatedNumbers.add(randomNumber);

        newNumbers.push({
          id: `${randomNumber}-${Date.now()}-${i}`,
          value: randomNumber,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`
        });
      }

      setFlyingNumbers(prev => [...prev, ...newNumbers]);

      setTimeout(() => {
        setFlyingNumbers(prev => prev.slice(numCount));
      }, 5000);
    };

    const generateRandomNumber = () => Math.floor(10000 + Math.random() * 90000);

    createFlyingNumbers();
    const interval = setInterval(createFlyingNumbers, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        {flyingNumbers.map((item, index) => (
          <div
            key={item.id}
            className="flying-number"
            style={{
              top: item.top,
              left: item.left,
              position: 'absolute',
              color: index % 2 === 0 ? 'rgba(124, 111, 205, 0.85)' : 'rgba(179, 157, 219, 0.85)'
            }}
          >
            {item.value}
          </div>
        ))}
      </div>
      <Box
        sx={{
          textAlign: 'center',
          padding: 1,
          minHeight: "25vh",
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
          Manage your unique codes and actions here.
        </Typography>
        <img
          src={welcomeImage}
          alt="Welcome"
          style={{
            borderRadius: "50%",
            width: '150px',
            height: "150px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)"
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={6}>
            <Paper sx={{
              padding: 5,
              textAlign: 'center',
              backgroundColor: '#fff',
              borderRadius: 3,
              boxShadow: 3,
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-10px)',
                boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.2)',
              },
            }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
                Your Unique Code format will be
              </Typography>

              <Box sx={{
                backgroundColor: '#ede7f6',
                padding: 3,
                borderRadius: 2,
                boxShadow: 1,
                mb: 3,
                textAlign: 'center',
              }}>
                <Typography variant="h4" color="black" sx={{ fontWeight: 'bold' }}>
                  E.g: 73676
                </Typography>
              </Box>

              <Button
                variant="contained"
                sx={{
                  bgcolor: '#7c6fcd',
                  color: '#fff',
                  fontWeight: "bold",
                  padding: "10px 20px",
                  '&:hover': { bgcolor: '#5c4dbf' },
                }}
                onClick={() => navigate("/generatecode")}
              >
                Enter
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Styles */}
      <style jsx>{`
        .flying-number {
          font-size: 25px;
          font-weight: bold;
          font-family: 'Courier New', Courier, monospace;
          animation: fly 13s linear infinite;
          opacity: 0.8;
        }

        @keyframes fly {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-100vh) rotate(360deg);
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
          }
        }
      `}</style>
    </Container>
  );
};

export default Home;
