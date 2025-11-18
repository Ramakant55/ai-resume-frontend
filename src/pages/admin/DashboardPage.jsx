import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../utils/apiClient';

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
        const jobsResponse = await apiClient.get(`/jobs/get-jobs`);
        const totalJobs = jobsResponse.data?.length || 0;
        
        // Fetch pending jobs
        const pendingJobsResponse = await apiClient.get(
          `/jobs/pending-jobs`,
          config
        );
        setPendingJobs(pendingJobsResponse.data);
        const pendingJobsCount = pendingJobsResponse.data?.length || 0;
        
        // Fetch applications
        const applicationsResponse = await apiClient.get(
          `/applications/allapp`,
          config
        );
        const totalApplications = applicationsResponse.data?.length || 0;
        
        // Count shortlisted applications
        const shortlistedCount = applicationsResponse.data?.filter(
          app => app.status && app.status.toLowerCase() === 'shortlisted'
        ).length || 0;
        
        // Get recent applications (last 5)
        const recentApps = applicationsResponse.data?.slice(0, 5) || [];
        
        // Update stats
        setStats({
          totalJobs,
          totalApplications,
          pendingReviews: pendingJobsCount,
          shortlisted: shortlistedCount
        });
        
        // Update recent applications
        setRecentApplications(recentApps);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.message || 'Failed to fetch dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleJobAction = async (jobId, status) => {
    try {
      setActionLoading(jobId);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      await apiClient.put(
        `/jobs/review`,
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
        <h1 className="text-3xl font-bold text-secondary-900">Admin Dashboard</h1>
        <p className="text-secondary-600 mt-2">Monitor and manage your job portal</p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-12 w-12 rounded-md bg-blue-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-secondary-600">Total Jobs</h3>
              <p className="text-2xl font-semibold text-secondary-900">{stats.totalJobs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-12 w-12 rounded-md bg-green-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-secondary-600">Total Applications</h3>
              <p className="text-2xl font-semibold text-secondary-900">{stats.totalApplications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-12 w-12 rounded-md bg-yellow-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-secondary-600">Pending Reviews</h3>
              <p className="text-2xl font-semibold text-secondary-900">{stats.pendingReviews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-12 w-12 rounded-md bg-purple-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-secondary-600">Shortlisted</h3>
              <p className="text-2xl font-semibold text-secondary-900">{stats.shortlisted}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Applications */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-secondary-900">Recent Applications</h2>
              <Link to="/admin/applications" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                View All
              </Link>
            </div>
            
            {recentApplications.length === 0 ? (
              <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-secondary-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-secondary-900 mb-1">No applications yet</h3>
                <p className="text-secondary-600">No job applications have been submitted yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-secondary-200">
                  <thead className="bg-secondary-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        Applicant
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        Job Title
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        Applied On
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-secondary-200">
                    {recentApplications.map((application) => (
                      <tr key={application._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-secondary-900">
                            {application.userId?.name || 'Applicant Name Not Available'}
                          </div>
                          <div className="text-sm text-secondary-500">
                            {application.userId?.email || 'Email Not Available'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-secondary-900">
                            {application.jobId?.title || 'Job Title Not Available'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                          {formatDate(application.appliedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(application.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Pending Job Reviews */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-secondary-900">Pending Job Reviews</h2>
              <Link to="/admin/pending-jobs" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                View All
              </Link>
            </div>
            
            {pendingJobs.length === 0 ? (
              <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-secondary-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-secondary-900 mb-1">No pending reviews</h3>
                <p className="text-secondary-600">All job postings have been reviewed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingJobs.map((job) => (
                  <div key={job._id} className="border border-secondary-200 rounded-lg p-4">
                    <h3 className="font-medium text-secondary-900 mb-1">{job.title}</h3>
                    <p className="text-sm text-secondary-600 mb-2">{job.company}</p>
                    <p className="text-xs text-secondary-500 mb-3">
                      Posted by {job.postedBy?.name || 'Unknown User'} on {formatDate(job.createdAt)}
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleJobAction(job._id, 'approved')}
                        disabled={actionLoading === job._id}
                        className="flex-1 btn btn-primary text-xs py-1 px-2"
                      >
                        {actionLoading === job._id ? 'Approving...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleJobAction(job._id, 'rejected')}
                        disabled={actionLoading === job._id}
                        className="flex-1 btn btn-secondary text-xs py-1 px-2"
                      >
                        {actionLoading === job._id ? 'Rejecting...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;