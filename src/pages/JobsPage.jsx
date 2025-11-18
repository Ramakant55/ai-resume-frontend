import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../utils/apiClient';

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]); // added this line
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    type: ''
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        
        // Get the auth token for authenticated requests
        const token = localStorage.getItem('token');
        const config = token ? {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        } : {};
        
        // Since all-jobs endpoint is returning 404, let's use get-jobs directly
        console.log("Fetching jobs from get-jobs endpoint...");
        const response = await apiClient.get(`/jobs/get-jobs`, config);
        
        if (response.data && Array.isArray(response.data)) {
          console.log("Jobs data received:", response.data);
          setJobs(response.data);
          setFilteredJobs(response.data);
        } else if (response.data && response.data.jobs && Array.isArray(response.data.jobs)) {
          console.log("Jobs data received:", response.data.jobs);
          setJobs(response.data.jobs);
          setFilteredJobs(response.data.jobs);
        } else {
          console.error("Invalid jobs data format received:", response.data);
          setError('Received invalid jobs data format from server');
          setJobs([]);
          setFilteredJobs([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError('Failed to fetch jobs. Please try again later.');
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Filter jobs whenever searchTerm or filters change
  useEffect(() => {
    let result = jobs;
    
    // Apply search filter
    if (searchTerm) {
      const searchValue = searchTerm.toLowerCase();
      result = result.filter(job => 
        job.title?.toLowerCase().includes(searchValue) ||
        job.company?.toLowerCase().includes(searchValue) ||
        job.description?.toLowerCase().includes(searchValue)
      );
    }
    
    // Apply category filter
    if (filters.category) {
      result = result.filter(job => job.category === filters.category);
    }
    
    // Apply location filter
    if (filters.location) {
      result = result.filter(job => job.location === filters.location);
    }
    
    // Apply type filter
    if (filters.type) {
      result = result.filter(job => job.type === filters.type);
    }
    
    setFilteredJobs(result);
  }, [searchTerm, filters, jobs]);

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get unique values for filter dropdowns
  const getUniqueValues = (array, key) => {
    const uniqueValues = [...new Set(array.map(job => job[key]).filter(Boolean))];
    return uniqueValues.sort();
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      category: '',
      location: '',
      type: ''
    });
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
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">Find Your Dream Job</h1>
        <p className="text-secondary-600">Browse through our carefully curated job listings</p>
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

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-secondary-700 mb-1">
              Search Jobs
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                className="input w-full pl-10"
                placeholder="Search by title, company, or keywords..."
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

          {/* Category Filter */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-secondary-700 mb-1">
              Category
            </label>
            <select
              id="category"
              className="input w-full"
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
            >
              <option value="">All Categories</option>
              {jobs.length > 0 && getUniqueValues(jobs, 'category').map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-secondary-700 mb-1">
              Location
            </label>
            <select
              id="location"
              className="input w-full"
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
            >
              <option value="">All Locations</option>
              {jobs.length > 0 && getUniqueValues(jobs, 'location').map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset Filters Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={resetFilters}
            className="btn btn-secondary"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Job Listings */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-secondary-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-secondary-900 mb-1">No jobs found</h3>
          <p className="text-secondary-600 mb-4">
            {jobs.length === 0 
              ? "There are no jobs available at the moment." 
              : "No jobs match your current search and filter criteria."}
          </p>
          <button
            onClick={resetFilters}
            className="btn btn-primary"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-medium text-secondary-900">
              Showing {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <div key={job._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-secondary-900 mb-1">{job.title}</h3>
                      <p className="text-secondary-600">{job.company}</p>
                    </div>
                    {job.isActive && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                      {job.type || 'Full-time'}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                      {job.category || 'General'}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-secondary-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {job.location || 'Remote'}
                  </div>
                  
                  <p className="text-secondary-700 text-sm mb-6 line-clamp-3">
                    {job.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary-500">
                      Posted {formatDate(job.createdAt)}
                    </span>
                    <Link
                      to={`/jobs/${job._id}`}
                      className="btn btn-primary py-2 px-4 text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsPage;