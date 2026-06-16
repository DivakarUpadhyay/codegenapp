// centralised axios instance — all API calls go through here
import axios from 'axios';
import {logoutOutsideReact} from "../context/AuthContext";
const baseURL = process.env.REACT_APP_API_BASE_URL;
const api = axios.create({
  baseURL:baseURL,
  withCredentials: true,
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if ((status === 401) && error.response?.data?.message === 'Invalid Token') {
      logoutOutsideReact(); 
    }
    return Promise.reject(error);
  }
);
export default api;
