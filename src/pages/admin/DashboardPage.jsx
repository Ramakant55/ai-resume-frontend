import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    pendingReviews: 0,
    shortlisted: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // Track which job is being processed

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found. Please log in again.');
        }
        
        // Set up headers for API requests
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };
        
        // Fetch jobs
        const jobsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/jobs/get-jobs`);
        const totalJobs = jobsResponse.data?.length || 0;
        
        // Fetch pending jobs
        const pendingJobsResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/jobs/pending-jobs`,
          config
        );
        setPendingJobs(pendingJobsResponse.data);
        const pendingJobsCount = pendingJobsResponse.data?.length || 0;
        
        // Fetch applications
        const applicationsResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/applications/allapp`,
          config
        );
        const totalApplications = applicationsResponse.data?.length || 0;
        
        // Count shortlisted applications
        const shortlistedCount = applicationsResponse.data?.filter(
          app => app.status && app.status.toLowerCase() === 'shortlisted'
        ).length || 0;
        
        // Update stats
        setStats({
          totalJobs,
          totalApplications,
          pendingReviews: pendingJobsCount,
          shortlisted: shortlistedCount
        });
        
        // Get recent applications
        const recentApps = applicationsResponse.data
          ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3) || [];
        setRecentApplications(recentApps);
        
      } catch (err) {
        setError('Failed to fetch dashboard data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Handle job approval/rejection
  const handleJobAction = async (jobId, status) => {
    try {
      setActionLoading(jobId);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      await axios.put(
        `${import.meta.env.VITE_API_URL}/jobs/review`,
        { jobId, status },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Update the local state to remove the processed job
      setPendingJobs(prevJobs => prevJobs.filter(job => job._id !== jobId));
      
      // Update the pending reviews count in stats
      setStats(prev => ({
        ...prev,
        pendingReviews: prev.pendingReviews - 1
      }));
      
    } catch (err) {
      console.error(`Error ${status} job:`, err);
      setError(err.response?.data?.message || `Failed to ${status} job. Please try again.`);
    } finally {
      setActionLoading(null);
    }
  };

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
    <div>
      <h1 className="text-2xl font-bold text-secondary-900 mb-6">Admin Dashboard</h1>
      
      {loading ? (
        <div className="text-center py-12">
          <svg className="animate-spin h-10 w-10 text-primary-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-secondary-600">Loading dashboard data...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-primary-100 text-primary-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-medium text-secondary-500">Total Jobs</h2>
                  <p className="text-2xl font-semibold text-secondary-900">{stats.totalJobs}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-indigo-100 text-indigo-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-medium text-secondary-500">Total Applications</h2>
                  <p className="text-2xl font-semibold text-secondary-900">{stats.totalApplications}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-medium text-secondary-500">Pending Job Reviews</h2>
                  <p className="text-2xl font-semibold text-secondary-900">{stats.pendingReviews}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-medium text-secondary-500">Shortlisted</h2>
                  <p className="text-2xl font-semibold text-secondary-900">{stats.shortlisted}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/admin/create-job" className="flex items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
                <div className="p-2 rounded-full bg-primary-100 text-primary-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="ml-3 font-medium text-primary-700">Post New Job</span>
              </Link>
              <Link to="/admin/applications" className="flex items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                <div className="p-2 rounded-full bg-indigo-100 text-indigo-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="ml-3 font-medium text-indigo-700">View Applications</span>
              </Link>
              <Link to="/admin/pending-jobs" className="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                <div className="p-2 rounded-full bg-yellow-100 text-yellow-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="ml-3 font-medium text-yellow-700">Review Pending Jobs</span>
              </Link>
            </div>
          </div>
          
          {/* Pending Jobs Section */}
          {pendingJobs.length > 0 && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className="p-6 border-b border-secondary-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-secondary-900">Pending Job Approvals</h2>
                <Link to="/admin/pending-jobs" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                  View all
                </Link>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-secondary-200">
                  <thead className="bg-secondary-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Job Title</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Company</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Posted By</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-secondary-200">
                    {pendingJobs.slice(0, 3).map((job) => (
                      <tr key={job._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-secondary-900">{job.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-secondary-600">{job.company}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-secondary-600">
                            {job.createdBy?.name || 'Unknown User'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-secondary-600">{formatDate(job.createdAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleJobAction(job._id, 'approved')}
                            disabled={actionLoading === job._id}
                            className="text-green-600 hover:text-green-900 mr-4 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading === job._id ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleJobAction(job._id, 'rejected')}
                            disabled={actionLoading === job._id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading === job._id ? 'Processing...' : 'Reject'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {pendingJobs.length > 3 && (
                <div className="p-4 border-t border-secondary-200 text-center">
                  <Link to="/admin/pending-jobs" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                    View all {pendingJobs.length} pending jobs
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Recent Applications */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-secondary-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-secondary-900">Recent Applications</h2>
              <Link to="/admin/applications" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                View all
              </Link>
            </div>
            
            {recentApplications.length === 0 ? (
              <div className="p-6 text-center text-secondary-600">
                <p>No applications found.</p>
              </div>
            ) : (
              <div className="divide-y divide-secondary-200">
                {recentApplications.map((application) => (
                  <div key={application._id} className="p-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                      <div>
                        <h3 className="text-lg font-medium text-secondary-900">
                          {application.jobId && typeof application.jobId === 'object' && application.jobId.title
                            ? application.jobId.title
                            : application.jobTitle || 'Job Title Unavailable'}
                        </h3>
                        <div className="mt-1">
                          <span className="text-secondary-600">
                            Applicant: {application.userId && typeof application.userId === 'object' 
                              ? application.userId.name 
                              : 'Unknown'}
                          </span>
                          <span className="mx-2 text-secondary-300">|</span>
                          <span className="text-secondary-600">
                            {application.jobId && typeof application.jobId === 'object' && application.jobId.company
                              ? application.jobId.company
                              : application.company || 'Company Unavailable'}
                          </span>
                        </div>
                        <p className="text-sm text-secondary-500 mt-1">
                          Applied on {formatDate(application.createdAt || new Date())}
                        </p>
                      </div>
                      <div className="mt-4 md:mt-0">
                        <StatusBadge status={application.status || 'pending'} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
