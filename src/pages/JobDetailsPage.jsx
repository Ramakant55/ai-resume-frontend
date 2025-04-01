import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const JobDetailsPage = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applied, setApplied] = useState(false);

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
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/jobs/get-jobs`, config);
        
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

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/applications/apply`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
        }
      );

      setApplied(true);
      toast.success('Application submitted successfully!');
      setResumeFile(null);
      setCoverLetter('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application');
      console.error('Error submitting application:', err);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-primary-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-secondary-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-xl font-bold text-secondary-900 mb-2">Job Not Found</h1>
          <p className="text-secondary-600 mb-4">{error || 'The job you are looking for does not exist or has been removed.'}</p>
          <button 
            onClick={() => navigate('/jobs')}
            className="btn btn-primary py-2 px-4"
          >
            Browse Jobs
          </button>
        </div>
      </div>
    );
  }

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="bg-secondary-50 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Job Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6 border-b border-secondary-200">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <h1 className="text-2xl font-bold text-secondary-900">{job.title}</h1>
                <p className="text-secondary-600 text-lg">{job.company}</p>
              </div>
              <div className="mt-4 md:mt-0">
                {!user?.isAdmin && (
                  <button
                    onClick={() => document.getElementById('application-form').scrollIntoView({ behavior: 'smooth' })}
                    className="btn btn-primary py-2 px-6"
                  >
                    Apply Now
                  </button>
                )}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <div className="flex items-center text-secondary-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {job.jobType || 'Full-time'}
              </div>
              <div className="flex items-center text-secondary-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {job.location || 'Remote'}
              </div>
              <div className="flex items-center text-secondary-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Posted: {formatDate(job.createdAt || new Date())}
              </div>
              <div className="flex items-center text-secondary-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Salary: {job.salary || 'Competitive'}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Description */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-secondary-900 mb-4">Job Description</h2>
              <div className="prose max-w-none text-secondary-700">
                <p>{job.description}</p>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-secondary-900 mb-4">Requirements</h2>
              <ul className="list-disc pl-5 space-y-2 text-secondary-700">
                {job.requirements ? (
                  job.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))
                ) : (
                  <>
                    <li>Bachelor's degree in related field</li>
                    <li>2+ years of relevant experience</li>
                    <li>Strong communication skills</li>
                    <li>Ability to work in a team environment</li>
                  </>
                )}
              </ul>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-secondary-900 mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills ? (
                  job.skills.map((skill, index) => (
                    <span key={index} className="bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full">
                      {skill}
                    </span>
                  ))
                ) : (
                  <>
                    <span className="bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full">Communication</span>
                    <span className="bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full">Problem Solving</span>
                    <span className="bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full">Teamwork</span>
                  </>
                )}
              </div>
            </div>
            
            {/* Application Form (only for normal users) */}
            {!user?.isAdmin && (
              <div id="application-form" className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-secondary-900 mb-4">Apply for this Position</h2>
                
                {!isAuthenticated ? (
                  <div className="text-center py-8">
                    <p className="text-secondary-600 mb-4">You need to be logged in to apply for this job</p>
                    <button
                      onClick={() => navigate('/login')}
                      className="btn btn-primary py-2 px-6"
                    >
                      Log in to Apply
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Resume/CV (PDF, DOC, DOCX)
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setResumeFile(e.target.files[0])}
                        className="w-full p-2 border border-secondary-300 rounded-md"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Cover Letter (Optional)
                      </label>
                      <textarea
                        rows="4"
                        className="input w-full"
                        placeholder="Tell us why you're a good fit for this role..."
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                      ></textarea>
                    </div>
                    
                    <div>
                      <button
                        type="submit"
                        disabled={applying}
                        className="btn btn-primary py-3 px-6 w-full"
                      >
                        {applying ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Submitting...
                          </span>
                        ) : 'Submit Application'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-8">
            {/* Company Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-secondary-900 mb-4">About the Company</h2>
              <div className="text-secondary-700 space-y-3">
                <p>{job.companyDescription || 'A leading company in the industry with a focus on innovation and growth.'}</p>
                
                <div className="pt-3 border-t border-secondary-200">
                  <h3 className="font-medium text-secondary-900 mb-2">Company Details</h3>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>{job.company}</span>
                    </div>
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{job.location || 'Remote, Worldwide'}</span>
                    </div>
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>{job.contactEmail || 'jobs@company.com'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Similar Jobs */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-secondary-900 mb-4">Similar Jobs</h2>
              <div className="space-y-4">
                <p className="text-secondary-600 text-center">More job recommendations will appear here based on your profile and browsing history.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;
