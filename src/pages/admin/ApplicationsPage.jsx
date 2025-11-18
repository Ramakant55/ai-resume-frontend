import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../../utils/apiClient';

const ApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [skills, setSkills] = useState('');

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
        
        // Use the real API endpoint to get all applications with auth token
        console.log("Fetching all applications from admin endpoint...");
        const response = await apiClient.get(`/applications/allapp`, config);
        
        // Make sure we're receiving an array of applications
        if (response.data && Array.isArray(response.data)) {
          console.log("Applications data received:", response.data);
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
  }, []);

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      // Get the auth token
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }
      
      // Set up request with authorization header
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      console.log(`Updating application ${applicationId} to status: ${newStatus}`);
      
      // Make the real API call with auth token
      const response = await apiClient.put(`/applications/update-status`, {
        applicationId,
        status: newStatus
      }, config);
      
      console.log("Status update response:", response.data);
      
      toast.success(`Application status updated to ${newStatus}`);
      
      // Update UI to reflect the change
      setApplications(applications.map(app => 
        app._id === applicationId ? { ...app, status: newStatus } : app
      ));
    } catch (err) {
      console.error("Error updating application status:", err);
      toast.error(err.response?.data?.message || 'Failed to update application status');
    }
  };

  // Function to filter applications by skills
  const filterBySkills = async () => {
    if (!skills.trim()) {
      toast.error('Please enter skills to filter by');
      return;
    }
    
    try {
      // Get the auth token
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }
      
      // Set up request with authorization header
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const skillsList = skills.split(',').map(skill => skill.trim());
      
      const response = await apiClient.post(`/applications/filter-by-skills`, {
        requiredSkills: skillsList
      }, config);
      
      console.log("Filtered applications:", response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setApplications(response.data);
        toast.success(`Found ${response.data.length} applications matching your skills criteria`);
      } else {
        toast.error('Received invalid data format from server');
      }
    } catch (err) {
      console.error("Error filtering applications by skills:", err);
      toast.error(err.response?.data?.message || 'Failed to filter applications');
    }
  };

  const resetFilters = async () => {
    setSkills('');
    setSearchTerm('');
    setFilter('all');
    // Reload the applications from the API
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      const response = await apiClient.get(`/applications/allapp`, config);
      setApplications(response.data.applications || response.data);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to reset filters');
      setLoading(false);
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
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  // Filter applications based on status and search term
  const filteredApplications = applications.filter(app => {
    // Status filter
    if (filter !== 'all' && app.status?.toLowerCase() !== filter) {
      return false;
    }
    
    // Search filter
    if (searchTerm) {
      const searchValue = searchTerm.toLowerCase();
      const matchesSearch = 
        (app.jobId?.title?.toLowerCase().includes(searchValue)) ||
        (app.jobId?.company?.toLowerCase().includes(searchValue)) ||
        (app.userId?.name?.toLowerCase().includes(searchValue)) ||
        (app.userId?.email?.toLowerCase().includes(searchValue));
      
      if (!matchesSearch) {
        return false;
      }
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">All Applications</h1>
        <p className="text-secondary-600">Manage and review all job applications</p>
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

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Search Input */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-secondary-700 mb-1">
              Search Applications
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                className="input w-full pl-10"
                placeholder="Search by job title, company, applicant name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="absolute left-3 top-3 h-5 w-5 text-secondary-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-secondary-700 mb-1">
              Filter by Status
            </label>
            <select
              id="status-filter"
              className="input w-full"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interviewed">Interviewed</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Skills Filter */}
          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-secondary-700 mb-1">
              Filter by Skills
            </label>
            <div className="flex">
              <input
                type="text"
                id="skills"
                className="input flex-1 rounded-r-none"
                placeholder="Enter skills (comma separated)..."
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
              <button
                onClick={filterBySkills}
                className="btn btn-primary rounded-l-none"
              >
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-secondary-600">
            Showing {filteredApplications.length} of {applications.length} applications
          </div>
          <div className="space-x-2">
            <button
              onClick={resetFilters}
              className="btn btn-secondary"
            >
              Reset Filters
            </button>
          </div>
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
            {applications.length === 0 
              ? "There are no applications yet." 
              : "No applications match your current filters."}
          </p>
          <button
            onClick={resetFilters}
            className="btn btn-primary"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                    Company
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Applied On
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {filteredApplications.map((application) => (
                  <tr key={application._id} className="hover:bg-secondary-50">
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
                      {application.jobId?.company || 'Company Not Available'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      {formatDate(application.appliedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(application.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <select
                          value={application.status}
                          onChange={(e) => updateApplicationStatus(application._id, e.target.value)}
                          className="input text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="interviewed">Interviewed</option>
                          <option value="hired">Hired</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
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