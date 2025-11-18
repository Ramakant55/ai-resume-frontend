import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

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
          ? `${import.meta.env.VITE_API_URL}/applications/allapp`
          : `${import.meta.env.VITE_API_URL}/applications/my-applications`;
            
        console.log(`Fetching applications from ${isAdmin ? 'admin' : 'user'} endpoint:`, applicationsEndpoint);
        const response = await axios.get(applicationsEndpoint, config);
        
        console.log("Applications data received:", response.data);
        
        if (response.data && Array.isArray(response.data)) {
          // If regular user, use the data directly as it's already filtered for the user
          // If admin and viewing their own applications, filter by userId
          const applications = isAdmin && user._id 
            ? response.data.filter(app => {
                if (app.userId && typeof app.userId === 'object' && app.userId._id) {
                  return app.userId._id === user._id;
                } else if (app.userId && typeof app.userId === 'string') {
                  return app.userId === user._id;
                } else {
                  return app.userId === user._id;
                }
              })
            : response.data;
            
          console.log("Applications after filtering:", applications.length);
          setApplications(applications);
        } else {
          console.error("Invalid application data format received:", response.data);
          setError('Received invalid application data format from server');
          setApplications([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error in fetchApplications:", err);
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

  // Get counts for each status type
  const pendingCount = applications.filter(app => app.status === 'pending').length;
  const reviewedCount = applications.filter(app => app.status === 'reviewed').length;
  const rejectedCount = applications.filter(app => app.status === 'rejected').length;

  // Filter applications based on selected filter
  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  // Status badge component with appropriate colors
  const StatusBadge = ({ status }) => {
    const getStatusStyles = () => {
      switch (status.toLowerCase()) {
        case 'pending':
          return 'bg-yellow-100 text-yellow-800';
        case 'reviewed':
          return 'bg-blue-100 text-blue-800';
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-secondary-900">My Applications</h1>
          <p className="text-secondary-600 mt-1">Track the status of your job applications</p>
        </div>

        {/* Filter tabs */}
        <div className="mb-6 border-b border-secondary-200">
          <nav className="flex -mb-px space-x-8">
            <button
              onClick={() => setFilter('all')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                filter === 'all'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }`}
            >
              All Applications ({applications.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                filter === 'pending'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('reviewed')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                filter === 'reviewed'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }`}
            >
              Reviewed ({reviewedCount})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                filter === 'rejected'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }`}
            >
              Rejected ({rejectedCount})
            </button>
          </nav>
        </div>

        {/* Applications list */}
        {loading ? (
          <div className="text-center py-12">
            <svg className="animate-spin h-10 w-10 text-primary-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-secondary-600">Loading your applications...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">
            <p>{error}</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-secondary-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-secondary-900 mb-1">No applications found</h3>
            <p className="text-secondary-600 mb-4">
              {filter === 'all'
                ? "You haven't applied to any jobs yet."
                : `You don't have any ${filter} applications.`}
            </p>
            <Link to="/jobs" className="btn btn-primary py-2 px-4">
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredApplications.map((application) => (
              <div key={application._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-secondary-900">
                        {application.jobId && typeof application.jobId === 'object' && application.jobId.title
                          ? application.jobId.title
                          : application.jobTitle || 'Job Title Not Available'}
                      </h2>
                      <p className="text-secondary-600">
                        {application.jobId && typeof application.jobId === 'object' && application.jobId.company
                          ? application.jobId.company
                          : application.company || 'Company Not Available'}
                      </p>
                      {(application.jobId && typeof application.jobId === 'object' && application.jobId.location) || application.location ? (
                        <p className="text-secondary-500 text-sm mt-1">
                          <span className="inline-flex items-center">
                            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            {application.jobId && typeof application.jobId === 'object' && application.jobId.location
                              ? application.jobId.location
                              : application.location}
                          </span>
                        </p>
                      ) : null}
                      <p className="text-secondary-500 text-sm mt-1">
                        <span className="inline-flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          Applied on {formatDate(application.createdAt || new Date())}
                        </span>
                      </p>
                    </div>
                    <div className="mt-4 md:mt-0 flex flex-col items-end">
                      <StatusBadge status={application.status || 'pending'} />
                      <p className="text-sm text-secondary-500 mt-2">
                        {application.updatedAt && application.updatedAt !== application.createdAt 
                          ? `Updated: ${formatDate(application.updatedAt)}` 
                          : ''}
                      </p>
                    </div>
                  </div>
                  
                  {/* Additional application details */}
                  <div className="mt-4 pt-4 border-t border-secondary-200">
                    <div className="flex flex-wrap gap-2">
                      {application.skills && application.skills.length > 0 ? (
                        <>
                          <span className="text-secondary-600 text-sm font-medium">Skills:</span>
                          {application.skills.map((skill, index) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                            >
                              {skill}
                            </span>
                          ))}
                        </>
                      ) : null}
                    </div>
                    
                    {application.resumeUrl ? (
                      <div className="mt-3">
                        <a 
                          href={application.resumeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-primary-600 hover:text-primary-500"
                        >
                          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                          View Resume
                        </a>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationsPage;
