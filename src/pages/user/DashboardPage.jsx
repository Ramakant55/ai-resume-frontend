import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../utils/apiClient';

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
      const response = await apiClient.get(`/users/profile`, {
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
          setLocalUser(parsedUser);
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
          const jobsResponse = await apiClient.get(`/jobs/get-jobs`, config);
          
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
              ? `/applications/allapp` 
              : `/applications/my-applications`;
            
            console.log("Using applications endpoint:", applicationsEndpoint);
            const applicationsResponse = await apiClient.get(applicationsEndpoint, config);
            console.log("Applications data received:", applicationsResponse.data);
            
            let userApplications = [];
            
            if (applicationsResponse.data && Array.isArray(applicationsResponse.data)) {
              userApplications = applicationsResponse.data;
            } else if (applicationsResponse.data && applicationsResponse.data.applications && Array.isArray(applicationsResponse.data.applications)) {
              userApplications = applicationsResponse.data.applications;
            }
            
            console.log("User applications found:", userApplications.length);
            setApplications(userApplications);
          } catch (applicationsError) {
            console.error("Error fetching user applications:", applicationsError);
            setError('Failed to fetch your applications. Please try again later.');
          }
        } catch (jobsError) {
          console.error("Error fetching jobs:", jobsError);
          setError('Failed to fetch jobs. Please try again later.');
        }
      } catch (err) {
        console.error("Unexpected error in fetchDashboardData:", err);
        setError('An unexpected error occurred. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated, user]);

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status badge with appropriate styling
  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      shortlisted: 'bg-blue-100 text-blue-800',
      interviewed: 'bg-purple-100 text-purple-800',
      hired: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900">
          Welcome back, {user?.name || localUser?.name || 'User'}!
        </h1>
        <p className="text-secondary-600 mt-2">Here's what's happening with your job search today.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Applications Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-secondary-900">Your Applications</h2>
              <Link to="/applications" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                View All
              </Link>
            </div>
            
            {applications.length === 0 ? (
              <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-secondary-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-secondary-900 mb-1">No applications yet</h3>
                <p className="text-secondary-600 mb-4">Get started by applying to jobs that match your skills</p>
                <Link to="/jobs" className="btn btn-primary">
                  Browse Jobs
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.slice(0, 5).map((application) => (
                  <div key={application._id} className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-secondary-900">
                        {application.jobId?.title || 'Job Title Not Available'}
                      </h3>
                      <p className="text-sm text-secondary-600">
                        {application.jobId?.company || 'Company Not Available'}
                      </p>
                      <p className="text-xs text-secondary-500 mt-1">
                        Applied on {formatDate(application.appliedAt)}
                      </p>
                    </div>
                    <div>
                      {getStatusBadge(application.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-secondary-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link 
                to="/jobs" 
                className="flex flex-col items-center justify-center p-6 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-medium text-secondary-900">Browse Jobs</span>
              </Link>
              
              <Link 
                to="/applications" 
                className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-secondary-900">My Applications</span>
              </Link>
              
              <Link 
                to="/my-jobs" 
                className="flex flex-col items-center justify-center p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="font-medium text-secondary-900">My Job Postings</span>
              </Link>
              
              <Link 
                to="/profile" 
                className="flex flex-col items-center justify-center p-6 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium text-secondary-900">My Profile</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Recent Jobs */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-secondary-900">Recent Jobs</h2>
              <Link to="/jobs" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                View All
              </Link>
            </div>
            
            {recentJobs.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-secondary-600">No jobs available at the moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <div key={job._id} className="border border-secondary-200 rounded-lg p-4 hover:border-primary-300 transition-colors duration-200">
                    <h3 className="font-medium text-secondary-900 mb-1">{job.title}</h3>
                    <p className="text-sm text-secondary-600 mb-2">{job.company}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-secondary-500">{formatDate(job.createdAt)}</span>
                      <Link 
                        to={`/jobs/${job._id}`} 
                        className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Profile Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-secondary-900 mb-6">Profile Summary</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-secondary-900">
                    {user?.name || localUser?.name || 'User Name'}
                  </h3>
                  <p className="text-sm text-secondary-600">
                    {user?.email || localUser?.email || 'Email not available'}
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-secondary-200">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-secondary-900">Applications</span>
                  <span className="text-sm text-secondary-600">{applications.length}</span>
                </div>
              </div>
              
              <div className="pt-2">
                <Link 
                  to="/profile" 
                  className="btn btn-secondary w-full py-2 text-center"
                >
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;