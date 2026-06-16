// Main app entry — handles auth state and routing
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import api from "./services/api";
import Login from "./components/Login/Login";
import GenerateCode from "./components/GenerateCode/GenerateCode";
import Home from "./components/Home/Home";
import AddRemarks from "./components/Remarks/AddRemarks";
import Registeruser from "./components/Registration/Registeruser";
import Layout from "./components/HeaderLayout/Layout";
import AllCodeList from "./components/AllCodeList/AllCodeList";
import Resetcredential from "./components/ResetUsercredential/Resetcredential";
import Loader from "./components/Loader/Loader";
import PrivateRoute from "./components/PrivateRoute"; 
import {useAuth} from "./context/AuthContext"; 

function App() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [authChanged, setAuthChanged] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    const validate = async () => {
      try {
        const res = await api.get("/api/auth/validate", { withCredentials: true });
        if (res.data.user) {
          setUser({
            username: res.data.user.Username,
            userid: res.data.user.UserID,
            RoleID: res.data.user.RoleID,
          });
        }
      } catch (error) {
        console.log("Error validating user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    validate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChanged]);
  const handleLogout = async () => {
    await api.post("/api/auth/logout", {}, { withCredentials: true });
    setUser(null);
    navigate("/");
  };

  if (loading) return <Loader />;

  const withLayout = (Component) => (
    <Layout onLogout={handleLogout} user={user}>
      <Component {...user} />
    </Layout>
  );

  return (

    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to="/home"  /> : <Login setAuthChanged={setAuthChanged} />}
      />
      <Route
        path="/home"
        element={<PrivateRoute user={user} element={withLayout(Home)} />}
      />
      <Route
        path="/generatecode"
        element={<PrivateRoute user={user} element={withLayout(GenerateCode)} />}
      />
      <Route
        path="/addremarks"
        element={<PrivateRoute user={user}  element={withLayout(AddRemarks)} />}
      />
      <Route
        path="/allcodelist"
        element={<PrivateRoute user={user} requiredRole={1} element={withLayout(AllCodeList)} />}
      />
      <Route
        path="/registeruser"
        element={
          <PrivateRoute
            user={user}
            requiredRole={1}
            element={withLayout(Registeruser)}
          />
        }
      />
      <Route path="/resetcredential" element={<Resetcredential />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>

  );
}

export default App;
