import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../utils/apiClient';

const ApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        
        // Get the auth token
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found. Please log in again.');
          setLoading(false);
          return;
        }
        
        // Set the auth token for the request
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };
        
        // Use the correct endpoint based on user role
        const isAdmin = user && user.isAdmin;
        const applicationsEndpoint = isAdmin 
          ? `/applications/allapp`
          : `/applications/my-applications`;
            
        console.log(`Fetching applications from ${isAdmin ? 'admin' : 'user'} endpoint:`, applicationsEndpoint);
        const response = await apiClient.get(applicationsEndpoint, config);
        
        console.log("Applications data received:", response.data);
        
        if (response.data && Array.isArray(response.data)) {
          // If regular user, use the data directly as it's already filtered for the user
          setApplications(response.data);
        } else if (response.data && typeof response.data === 'object') {
          // If we got an object instead of an array, try to extract the applications array if it exists
          if (Array.isArray(response.data.applications)) {
            console.log("Applications extracted from response object:", response.data.applications);
            setApplications(response.data.applications);
          } else {
            console.error("Invalid application data format received:", response.data);
            setError('Received invalid application data format from server');
            setApplications([]);
          }
        } else {
          console.error("Invalid application data format received:", response.data);
          setError('Received invalid application data format from server');
          setApplications([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError('Failed to fetch applications. Please try again later.');
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

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
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  // Filter applications based on status
  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status && app.status.toLowerCase() === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">My Applications</h1>
        <p className="text-secondary-600">Track the status of your job applications</p>
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

      {/* Status Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded-full ${filter === 'all' ? 'bg-primary-100 text-primary-800 font-medium' : 'text-secondary-600 hover:bg-secondary-100'}`}
          >
            All Applications
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 text-sm rounded-full ${filter === 'pending' ? 'bg-yellow-100 text-yellow-800 font-medium' : 'text-secondary-600 hover:bg-secondary-100'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('shortlisted')}
            className={`px-3 py-1 text-sm rounded-full ${filter === 'shortlisted' ? 'bg-blue-100 text-blue-800 font-medium' : 'text-secondary-600 hover:bg-secondary-100'}`}
          >
            Shortlisted
          </button>
          <button
            onClick={() => setFilter('interviewed')}
            className={`px-3 py-1 text-sm rounded-full ${filter === 'interviewed' ? 'bg-purple-100 text-purple-800 font-medium' : 'text-secondary-600 hover:bg-secondary-100'}`}
          >
            Interviewed
          </button>
          <button
            onClick={() => setFilter('hired')}
            className={`px-3 py-1 text-sm rounded-full ${filter === 'hired' ? 'bg-green-100 text-green-800 font-medium' : 'text-secondary-600 hover:bg-secondary-100'}`}
          >
            Hired
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-3 py-1 text-sm rounded-full ${filter === 'rejected' ? 'bg-red-100 text-red-800 font-medium' : 'text-secondary-600 hover:bg-secondary-100'}`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-secondary-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-secondary-900 mb-1">No applications found</h3>
          <p className="text-secondary-600 mb-4">
            {filter === 'all' 
              ? "You haven't applied to any jobs yet." 
              : `You don't have any applications with ${filter} status.`}
          </p>
          <Link to="/jobs" className="btn btn-primary">
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Company
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
                {filteredApplications.map((application) => (
                  <tr key={application._id} className="hover:bg-secondary-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-secondary-900">
                        {application.jobId?.title || 'Job Title Not Available'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-500">
                        {application.jobId?.company || 'Company Not Available'}
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
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage;