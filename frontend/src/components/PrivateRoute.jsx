import React from 'react';
import { Navigate,useNavigate} from 'react-router-dom';

const PrivateRoute = ({ element, requiredRole, user,isRemark }) => {
  const navigate = useNavigate();


  if (!user) {
    return <Navigate to="/login"  />;
  }

  if ((requiredRole && user.RoleID !== requiredRole)|| isRemark==true) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center',marginTop:'105px' }}>
      <h2>🚫 Access Denied</h2>
      <p>{isRemark==true?"Add remark page is not accessible directly":"You do not have permission to view this page."}</p>
      <button onClick={() => navigate('/home')}   style={{
    backgroundColor: '#7c6fcd',
    color: '#fff',
    fontWeight: 'bold',
    height: '40px'
  }}>
        Go Back to Home
      </button>
    </div>
    );
  }

  return element;
};

export default PrivateRoute;
