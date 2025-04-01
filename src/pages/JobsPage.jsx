import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

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
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/jobs/get-jobs`, config);
        
        if (response.data && Array.isArray(response.data)) {
          console.log("Jobs data received:", response.data);
          setJobs(response.data);
          setFilteredJobs(response.data);
        } else if (response.data && response.data.jobs && Array.isArray(response.data.jobs)) {
          // Handle case where jobs are in a nested property
          console.log("Jobs extracted from response object:", response.data.jobs);
          setJobs(response.data.jobs);
          setFilteredJobs(response.data.jobs);
        } else {
          console.error("Invalid job data format:", response.data);
          setJobs([]);
          setFilteredJobs([]);
          setError('Received invalid job data format from server');
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

  // Filter jobs based on search term and filters
  const filteredJobsList = filteredJobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filters.category || job.category === filters.category;
    const matchesLocation = !filters.location || job.location === filters.location;
    const matchesType = !filters.type || job.jobType === filters.type;
    
    return matchesSearch && matchesCategory && matchesLocation && matchesType;
  });

  // Get unique values for filter dropdowns
  const categories = [...new Set(jobs.map(job => job.category))].filter(Boolean);
  const locations = [...new Set(jobs.map(job => job.location))].filter(Boolean);
  const types = [...new Set(jobs.map(job => job.jobType))].filter(Boolean);

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="bg-secondary-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-secondary-900 sm:text-4xl">
            Available Job Opportunities
          </h1>
          <p className="mt-3 text-xl text-secondary-600 max-w-2xl mx-auto">
            Find your perfect role from our curated list of opportunities
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for jobs by title, company, or keywords..."
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Category</label>
              <select
                className="input w-full"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <option value="">All Categories</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Location</label>
              <select
                className="input w-full"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              >
                <option value="">All Locations</option>
                {locations.map((location, index) => (
                  <option key={index} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Job Type</label>
              <select
                className="input w-full"
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <option value="">All Types</option>
                {types.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Job Listings */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <svg className="animate-spin h-10 w-10 text-primary-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-secondary-600">Loading jobs...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              <p>{error}</p>
            </div>
          ) : filteredJobsList.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-secondary-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-secondary-900 mb-1">No jobs found</h3>
              <p className="text-secondary-600">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredJobsList.map((job) => (
              <div key={job._id} className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-secondary-900 mb-1">
                        {job.title}
                      </h2>
                      <p className="text-secondary-600 mb-2">{job.company}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {job.jobType || 'Full-time'}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                          {job.category || 'General'}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {job.experience || 'Entry Level'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-secondary-500 text-sm">
                        Posted: {formatDate(job.createdAt || new Date())}
                      </p>
                      <p className="text-secondary-700 flex items-center justify-end mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {job.location || 'Remote'}
                      </p>
                    </div>
                  </div>
                  <p className="text-secondary-600 mt-3 line-clamp-3">{job.description}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <div>
                      <span className="text-secondary-900 font-medium">{job.salary || '$Competitive'}</span>
                    </div>
                    <Link
                      to={`/jobs/${job._id}`}
                      className="btn btn-primary py-2 px-4"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default JobsPage;
