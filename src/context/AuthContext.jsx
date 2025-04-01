import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [otp, setOtp] = useState({ email: '', otp: '' });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in on app load
    const checkLoggedIn = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (token) {
          try {
            // Set the auth token for all axios requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // First try to get user data from localStorage
            const userStr = localStorage.getItem('user');
            let userData = null;
            
            if (userStr && userStr !== 'undefined') {
              try {
                userData = JSON.parse(userStr);
                if (userData && userData._id) {
                  console.log('User data found in localStorage:', userData.name);
                  setUser(userData);
                  setIsAuthenticated(true);
                } else {
                  console.log('User data in localStorage is invalid, fetching from API');
                  userData = null; // Reset invalid user data
                }
              } catch (parseError) {
                console.error('Error parsing user data:', parseError);
                userData = null;
                localStorage.removeItem('user');
              }
            }
            
            // If no valid user data found, fetch from backend
            if (!userData) {
              console.log('Fetching user profile from backend...');
              try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/profile`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                
                if (response.data && response.data._id) {
                  console.log('User profile fetched successfully:', response.data.name);
                  setUser(response.data);
                  localStorage.setItem('user', JSON.stringify(response.data));
                  setIsAuthenticated(true);
                } else {
                  console.error('Invalid user profile data received:', response.data);
                  throw new Error('Invalid user profile data');
                }
              } catch (profileError) {
                console.error('Error fetching user profile:', profileError);
                // Don't remove the token yet, allow a few retries
              }
            }
          } catch (error) {
            console.error('Error during authentication:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          console.log('No authentication token found');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (err) {
        console.error('Unexpected error in checkLoggedIn:', err);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/signup`, userData);
      setOtp({ email: userData.email });
      toast.success('Registration successful! Please verify your OTP.');
      navigate('/verify-otp');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (otpData) => {
    try {
      setLoading(true);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/verify-otp`, { 
        email: otp.email,
        otp: otpData.otp 
      });
      toast.success('OTP verification successful!');
      navigate('/login');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'OTP verification failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, credentials);
      const { token, user } = response.data;
      
      // Set token in local storage and axios headers
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setIsAuthenticated(true);
      
      // Show success message
      toast.success('Login successful!');
      
      // Wait a short moment before redirecting to ensure state is updated
      setTimeout(() => {
        // Redirect based on user role - immediately after successful login
        if (user && user.isAdmin) {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }, 100);
      
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        otp,
        setOtp,
        register,
        verifyOtp,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
