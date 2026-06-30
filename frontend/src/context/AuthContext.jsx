import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
axios.defaults.withCredentials = true;

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/api/auth/login' && originalRequest.url !== '/api/auth/refresh') {
          originalRequest._retry = true;
          try {
            const { data } = await axios.post('/api/auth/refresh');
            if (user) {
              const updatedUser = { ...user, token: data.token };
              setUser(updatedUser);
              localStorage.setItem('userInfo', JSON.stringify(updatedUser));
              originalRequest.headers['Authorization'] = `Bearer ${data.token}`;
            }
            return axios(originalRequest);
          } catch (refreshError) {
            logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [user]);

  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
  };

  const register = async (username, email, password) => {
    const { data } = await axios.post('/api/auth/register', { username, email, password });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (e) {}
    setUser(null);
    localStorage.removeItem('userInfo');
    localStorage.removeItem('user');
  };

  const updateBudget = async (budget) => {
    try {
      const { data } = await axios.put('/api/auth/profile', { monthlyBudget: budget }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get('/api/auth/profile', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
    } catch (error) {
      console.error(error);
    }
  };

  const value = { user, login, register, logout, updateBudget, fetchProfile, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
