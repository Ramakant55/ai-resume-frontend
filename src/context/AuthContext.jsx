import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/apiClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [otp, setOtp] = useState({ email: '', otpToken: '' });
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
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
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
                const response = await apiClient.get(`/users/profile`);
                
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
      const response = await apiClient.post(`/auth/signup`, userData);
      // Save both email and otpToken
      setOtp({ email: userData.email, otpToken: response.data.otpToken });
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
      const response = await apiClient.post(`/auth/verify-otp`, { 
        email: otp.email,
        otp: otpData.otp,
        otpToken: otp.otpToken
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
      const response = await apiClient.post(`/auth/login`, credentials);
      const { token } = response.data;
      
      // Set token in local storage and axios headers
      localStorage.setItem('token', token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch user data with the token
      try {
        const userResponse = await apiClient.get(`/users/profile`);
        const user = userResponse.data;
        localStorage.setItem('user', JSON.stringify(user));
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
      } catch (userError) {
        console.error('Error fetching user profile:', userError);
        toast.error('Login successful but failed to fetch user profile');
        throw userError;
      }
      
      return response.data;
    } catch (error) {
      // Check if the error is due to unverified OTP
      if (error.response && error.response.status === 403 && 
          error.response.data.message === "Please verify your OTP first") {
        // Set the email in the OTP state for verification
        setOtp({ email: credentials.email });
        toast.warning('Please verify your OTP first');
        navigate('/verify-otp');
      } else {
        toast.error(error.response?.data?.message || 'Login failed');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete apiClient.defaults.headers.common['Authorization'];
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