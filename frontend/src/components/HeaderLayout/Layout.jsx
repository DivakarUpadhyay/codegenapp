import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../Header/Header';
const Layout = ({ children, onLogout,user }) => {
  const location = useLocation();
  const hideMenus = location.pathname === '/home';
  return (
    <>
      <Header 
        onLogout={onLogout} 
        username={user.username} 
        RoleID={user.RoleID} 
        hideMenus={hideMenus}
      />
      {children}
    </>
  );
};

export default Layout;
