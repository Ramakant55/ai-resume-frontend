import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const DashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [applications, setApplications] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Add state for user details from local storage as fallback
  const [localUser, setLocalUser] = useState(null);
  
  // Function to fetch user profile directly
  const fetchUserProfile = async (token) => {
    try {
      console.log("Fetching user profile directly...");
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.name) {
        console.log("User profile fetched successfully:", response.data);
        setLocalUser(response.data);
        // Update localStorage with correct user data
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Get user data from localStorage on component mount
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr && userStr !== 'undefined') {
        try {
          const parsedUser = JSON.parse(userStr);
          console.log("User data from localStorage:", parsedUser);
          if (parsedUser && parsedUser.name) {
            setLocalUser(parsedUser);
          } else {
            // Try to get user from token
            const token = localStorage.getItem('token');
            if (token) {
              // Manually fetch user profile if we have a token but no valid user data
              fetchUserProfile(token);
            }
          }
        } catch (error) {
          console.error("Error parsing user from localStorage:", error);
        }
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error);
    }
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get the auth token
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found. Please log in again.');
          setLoading(false);
          return;
        }
        
        // Set the auth token for all requests
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };
        
        // Get real jobs from the database (first, so we have the job data for applications)
        try {
          console.log("Fetching all jobs...");
          const jobsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/jobs/get-jobs`, config);
          
          let allJobs = [];
          if (jobsResponse.data && Array.isArray(jobsResponse.data)) {
            allJobs = jobsResponse.data;
          } else if (jobsResponse.data && jobsResponse.data.jobs && Array.isArray(jobsResponse.data.jobs)) {
            allJobs = jobsResponse.data.jobs;
          }
          
          // Sort by date and take the 3 most recent jobs for the sidebar
          const sortedJobs = [...allJobs].sort((a, b) => 
            new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
          ).slice(0, 3);
          
          console.log("Recent jobs found:", sortedJobs.length);
          setRecentJobs(sortedJobs);
          
          // Get user's applications from the real database
          try {
            console.log("Fetching user applications for dashboard...");
            // Use the my-applications endpoint for regular users
            const applicationsEndpoint = user && user.isAdmin 
              ? `${import.meta.env.VITE_API_URL}/applications/allapp` 
              : `${import.meta.env.VITE_API_URL}/applications/my-applications`;
            
            console.log("Using applications endpoint:", applicationsEndpoint);
            const applicationsResponse = await axios.get(applicationsEndpoint, config);
            console.log("Applications data received:", applicationsResponse.data);
            
            let userApplications = [];
            
            if (applicationsResponse.data && Array.isArray(applicationsResponse.data)) {
              // If user is admin, filter to only show their applications
              if (user && user.isAdmin && user._id) {
                userApplications = applicationsResponse.data.filter(app => {
                  // Various checks for userId formats
                  if (app.userId && typeof app.userId === 'object' && app.userId._id) {
                    return app.userId._id === user._id;
                  } else if (app.userId && typeof app.userId === 'string') {
                    return app.userId === user._id;
                  } else {
                    return app.userId === user._id;
                  }
                });
              } else {
                // For regular users, the my-applications endpoint already returns only their apps
                userApplications = applicationsResponse.data;
              }
              
              // Enhance applications with job details if jobId is just a string
              const enhancedApplications = userApplications.map(app => {
                if (app.jobId && typeof app.jobId === 'string') {
                  // Find the job in our allJobs array
                  const jobDetails = allJobs.find(job => job._id === app.jobId);
                  if (jobDetails) {
                    return {
                      ...app,
                      jobTitle: jobDetails.title,
                      company: jobDetails.company,
                      location: jobDetails.location
                    };
                  }
                }
                return app;
              });
              
              console.log("Enhanced user applications:", enhancedApplications);
              setApplications(enhancedApplications);
            } else {
              console.error("Invalid application data format:", applicationsResponse.data);
              setApplications([]);
            }
          } catch (appError) {
            console.error("Error fetching applications:", appError);
            setApplications([]);
          }
          
        } catch (jobsError) {
          console.error("Error fetching jobs:", jobsError);
          setRecentJobs([]);
        }
        
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
        setError('Failed to fetch dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Status badge component with appropriate colors
  const StatusBadge = ({ status }) => {
    const getStatusStyles = () => {
      switch (status.toLowerCase()) {
        case 'pending':
          return 'bg-yellow-100 text-yellow-800';
        case 'reviewing':
        case 'reviewed':
          return 'bg-blue-100 text-blue-800';
        case 'shortlisted':
          return 'bg-green-100 text-green-800';
        case 'rejected':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-secondary-100 text-secondary-800';
      }
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles()}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-secondary-900">Welcome back, {user?.name || localUser?.name || 'User'}</h1>
          <p className="text-secondary-600 mt-1">Here's an overview of your job applications and recent activity</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <svg className="animate-spin h-10 w-10 text-primary-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-secondary-600">Loading your dashboard...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-primary-100 text-primary-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h2 className="text-sm font-medium text-secondary-500">Total Applications</h2>
                      <p className="text-2xl font-semibold text-secondary-900">{applications.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-yellow-100 text-yellow-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h2 className="text-sm font-medium text-secondary-500">Pending</h2>
                      <p className="text-2xl font-semibold text-secondary-900">
                        {applications.filter(app => app.status && app.status.toLowerCase() === 'pending').length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100 text-green-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h2 className="text-sm font-medium text-secondary-500">Shortlisted</h2>
                      <p className="text-2xl font-semibold text-secondary-900">
                        {applications.filter(app => app.status && app.status.toLowerCase() === 'shortlisted').length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Applications */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-secondary-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-secondary-900">Recent Applications</h2>
                    <Link to="/my-applications" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                      View all
                    </Link>
                  </div>
                </div>
                
                <div className="divide-y divide-secondary-200">
                  {applications.length === 0 ? (
                    <div className="py-8 text-center text-secondary-600">
                      <p>You haven't applied to any jobs yet.</p>
                      <Link to="/jobs" className="mt-3 inline-block text-primary-600 hover:text-primary-800 font-medium">
                        Browse jobs
                      </Link>
                    </div>
                  ) : (
                    applications.slice(0, 5).map((application) => (
                      <div key={application._id} className="p-6">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                          <div>
                            <h3 className="text-lg font-medium text-secondary-900">
                              {application.jobId && typeof application.jobId === 'object' && application.jobId.title
                                ? application.jobId.title
                                : application.jobTitle || 'Job Title Unavailable'}
                            </h3>
                            <p className="text-secondary-600">
                              {application.jobId && typeof application.jobId === 'object' && application.jobId.company
                                ? application.jobId.company
                                : application.company || 'Company Unavailable'}
                            </p>
                            <p className="text-sm text-secondary-500 mt-1">
                              Applied on {formatDate(application.createdAt || new Date())}
                            </p>
                          </div>
                          <div className="mt-4 md:mt-0">
                            <StatusBadge status={application.status || 'pending'} />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-8">
              {/* Profile Summary */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl">
                    {user?.name ? user.name.charAt(0).toUpperCase() : localUser?.name ? localUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="ml-4">
                    <h2 className="text-lg font-medium text-secondary-900">{user?.name || localUser?.name || 'User'}</h2>
                    <p className="text-secondary-500">{user?.email || localUser?.email || 'user@example.com'}</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-secondary-200">
                  <Link to="/profile" className="btn btn-secondary w-full py-2">
                    Update Profile
                  </Link>
                </div>
              </div>
              
              {/* Recent Jobs */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-secondary-200">
                  <h2 className="text-lg font-semibold text-secondary-900">Recent Job Postings</h2>
                </div>
                
                <div className="divide-y divide-secondary-200">
                  {recentJobs.length === 0 ? (
                    <div className="py-8 text-center text-secondary-600">
                      <p>No recent job postings available.</p>
                    </div>
                  ) : (
                    recentJobs.map((job) => (
                      <div key={job._id} className="p-6">
                        <Link to={`/jobs/${job._id}`} className="block">
                          <h3 className="text-md font-medium text-secondary-900 hover:text-primary-600">{job.title}</h3>
                          <p className="text-secondary-600 text-sm">{job.company}</p>
                          <div className="flex items-center text-secondary-500 text-sm mt-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {job.location || 'Remote'}
                          </div>
                        </Link>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="p-4 bg-secondary-50 text-center">
                  <Link to="/jobs" className="text-primary-600 hover:text-primary-800 font-medium">
                    View all jobs
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
