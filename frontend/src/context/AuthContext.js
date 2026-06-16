import {  createContext,useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
export const AuthContext = createContext();
let globalLogout = null; 
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const logout = async () => {
    try {
     await api.post("/api/auth/logout", {}, { withCredentials: true });
    setUser(null);
    navigate("/"); 
    } catch (err) {
      console.error(err);
    }
  };
  globalLogout = logout; 
  return (
    <AuthContext.Provider value={{ user,setUser,logout }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);
export const logoutOutsideReact = () => globalLogout?.();

