import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../utils/apiClient';
import { toast } from 'react-toastify';

const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        // Get the auth token
        const token = localStorage.getItem('token');
        const config = token ? {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        } : {};
        
        // Since the job/:id endpoint is returning 404, let's use get-jobs directly
        console.log("Fetching job details from get-jobs endpoint...");
        const response = await apiClient.get(`/jobs/get-jobs`, config);
        
        // Find the specific job by ID
        let jobData = null;
        if (response.data && Array.isArray(response.data)) {
          jobData = response.data.find(job => job._id === id);
        } else if (response.data && response.data.jobs && Array.isArray(response.data.jobs)) {
          jobData = response.data.jobs.find(job => job._id === id);
        }
        
        if (!jobData) {
          console.error("Job not found in the response data:", id);
          setError('Job not found');
        } else {
          console.log("Job found:", jobData);
          setJob(jobData);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching job details:", err);
        setError('Failed to fetch job details. Please try again later.');
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    
    try {
      if (!isAuthenticated) {
        navigate('/login', { state: { from: `/jobs/${id}` } });
        return;
      }
      
      if (!resumeFile) {
        toast.error('Please upload your resume');
        return;
      }

      setApplying(true);
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('jobId', id);
      formData.append('coverLetter', coverLetter);
      formData.append('resume', resumeFile);

      // Get the auth token
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        setApplying(false);
        return;
      }

      const response = await apiClient.post(
        `/applications/apply`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      toast.success('Application submitted successfully!');
      setCoverLetter('');
      setResumeFile(null);
      
      // Redirect to applications page after successful submission
      setTimeout(() => {
        navigate('/applications');
      }, 1500);
      
    } catch (err) {
      console.error('Error applying for job:', err);
      toast.error(err.response?.data?.message || 'Failed to submit application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-medium text-secondary-900 mb-2">Error Loading Job</h3>
            <p className="text-secondary-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-secondary-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-secondary-900 mb-2">Job Not Found</h3>
            <p className="text-secondary-600 mb-4">The job you're looking for doesn't exist or has been removed.</p>
            <Link to="/jobs" className="btn btn-primary">
              Browse All Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link to="/jobs" className="text-primary-600 hover:text-primary-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Jobs
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-secondary-900 mb-2">{job.title}</h1>
              <p className="text-lg text-secondary-700">{job.company}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                job.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {job.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-6 text-sm text-secondary-600">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {job.location || 'Remote'}
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {job.type || 'Full-time'}
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Posted on {formatDate(job.createdAt)}
            </div>
          </div>

          <div className="prose max-w-none mb-8">
            <h3 className="text-lg font-medium text-secondary-900 mb-3">Job Description</h3>
            <p className="text-secondary-700 whitespace-pre-line">{job.description}</p>
          </div>

          <div className="prose max-w-none mb-8">
            <h3 className="text-lg font-medium text-secondary-900 mb-3">Requirements</h3>
            <p className="text-secondary-700 whitespace-pre-line">{job.requirements || 'No specific requirements mentioned.'}</p>
          </div>

          <div className="prose max-w-none mb-8">
            <h3 className="text-lg font-medium text-secondary-900 mb-3">Salary Range</h3>
            <p className="text-secondary-700">{job.salary || 'Not specified'}</p>
          </div>

          {isAuthenticated && !user?.isAdmin && (
            <div className="border-t border-secondary-200 pt-6">
              <h3 className="text-lg font-medium text-secondary-900 mb-4">Apply for this Position</h3>
              <form onSubmit={handleApply}>
                <div className="mb-4">
                  <label htmlFor="coverLetter" className="block text-sm font-medium text-secondary-700 mb-1">
                    Cover Letter
                  </label>
                  <textarea
                    id="coverLetter"
                    rows={4}
                    className="input w-full"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Tell us why you're a great fit for this position..."
                  ></textarea>
                </div>

                <div className="mb-6">
                  <label htmlFor="resume" className="block text-sm font-medium text-secondary-700 mb-1">
                    Resume
                  </label>
                  <div className="flex items-center">
                    <label className="btn btn-secondary cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload Resume
                      <input
                        type="file"
                        id="resume"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setResumeFile(e.target.files[0])}
                      />
                    </label>
                    {resumeFile && (
                      <span className="ml-3 text-sm text-secondary-600 truncate max-w-xs">
                        {resumeFile.name}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-secondary-500">
                    PDF, DOC, or DOCX files only. Maximum file size: 5MB.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={applying}
                  className="btn btn-primary w-full py-3"
                >
                  {applying ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting Application...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              </form>
            </div>
          )}

          {!isAuthenticated && (
            <div className="border-t border-secondary-200 pt-6 text-center">
              <p className="text-secondary-600 mb-4">
                Please log in to apply for this position.
              </p>
              <Link to="/login" className="btn btn-primary">
                Log In to Apply
              </Link>
            </div>
          )}

          {isAuthenticated && user?.isAdmin && (
            <div className="border-t border-secondary-200 pt-6 text-center">
              <p className="text-secondary-600">
                As an admin, you cannot apply for jobs. Please use the admin dashboard to manage job postings.
              </p>
              <Link to="/admin/jobs" className="btn btn-primary mt-4">
                Go to Admin Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;