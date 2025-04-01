import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

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
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/applications/allapp`, config);
        
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
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/applications/update-status`, {
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
      
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/applications/filter-by-skills`, {
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
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/applications/allapp`, config);
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

  // Filter applications based on search term and status
  const filteredApplications = applications.filter(app => {
    // Check if we have populated user data
    const userName = app.userId && app.userId.name ? app.userId.name : 'Unknown';
    const userEmail = app.userId && app.userId.email ? app.userId.email : 'Unknown';
    // Check if we have populated job data
    const jobTitle = app.jobId && app.jobId.title ? app.jobId.title : 'Unknown';
    const jobCompany = app.jobId && app.jobId.company ? app.jobId.company : 'Unknown';
    
    const matchesSearch = 
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jobCompany.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filter === 'all' || app.status === filter;
    
    return matchesSearch && matchesStatus;
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
    <div>
      <h1 className="text-2xl font-bold text-secondary-900 mb-6">Manage Applications</h1>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-secondary-700 mb-1">
              Search Applications
            </label>
            <div className="relative">
              <input
                id="search"
                type="text"
                placeholder="Search by name, email, job title..."
                className="input w-full pl-10"
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
          
          <div className="w-full md:w-1/4">
            <label htmlFor="filter" className="block text-sm font-medium text-secondary-700 mb-1">
              Status Filter
            </label>
            <select
              id="filter"
              className="input w-full"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Applications</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div className="flex-1">
            <label htmlFor="skills" className="block text-sm font-medium text-secondary-700 mb-1">
              Filter by Skills
            </label>
            <div className="flex">
              <input
                id="skills"
                type="text"
                placeholder="React, Node.js, MongoDB..."
                className="input w-full"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
              <button
                onClick={filterBySkills}
                className="ml-2 btn btn-primary py-2 px-4"
              >
                Filter
              </button>
            </div>
          </div>
          
          <button
            onClick={resetFilters}
            className="btn btn-secondary py-2 px-4"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Applications Table */}
      {loading ? (
        <div className="text-center py-12">
          <svg className="animate-spin h-10 w-10 text-primary-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-secondary-600">Loading applications...</p>
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
          <p className="text-secondary-600">
            {searchTerm || skills || filter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'There are no job applications yet'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-secondary-200">
            <thead className="bg-secondary-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Applicant
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Job Position
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Applied On
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Skills
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {filteredApplications.map((application) => (
                <tr key={application._id} className="bg-white">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-700 font-medium">
                          {application.userId && application.userId.name 
                            ? application.userId.name.charAt(0).toUpperCase() 
                            : '?'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-secondary-900">
                          {application.userId && application.userId.name 
                            ? application.userId.name 
                            : 'Unknown User'}
                        </div>
                        <div className="text-sm text-secondary-500">
                          {application.userId && application.userId.email 
                            ? application.userId.email 
                            : 'No email available'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-secondary-900">
                      {application.jobId && application.jobId.title 
                        ? application.jobId.title 
                        : 'Unknown Job'}
                    </div>
                    <div className="text-sm text-secondary-500">
                      {application.jobId && application.jobId.company 
                        ? application.jobId.company 
                        : 'Unknown Company'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                    {formatDate(application.createdAt || new Date())}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={application.status || 'pending'} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {application.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {skill}
                        </span>
                      ))}
                      {application.skills.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                          +{application.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => toast.info('Viewing resume and application details')}
                      className="text-primary-600 hover:text-primary-900 mr-2"
                    >
                      View
                    </button>
                    
                    <div className="relative inline-block text-left group">
                      <button className="text-secondary-600 hover:text-secondary-900">
                        Change Status
                      </button>
                      <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 invisible group-hover:visible">
                        <div className="py-1">
                          <button
                            onClick={() => updateApplicationStatus(application._id, 'pending')}
                            className="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                          >
                            Pending
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(application._id, 'reviewed')}
                            className="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                          >
                            Reviewed
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(application._id, 'rejected')}
                            className="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                          >
                            Rejected
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage;
