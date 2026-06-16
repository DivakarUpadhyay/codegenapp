import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';  // Import BrowserRouter
import {AuthProvider} from "./context/AuthContext"; 

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>  {/* Wrap your App component with BrowserRouter */}
    <AuthProvider> <App /></AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
