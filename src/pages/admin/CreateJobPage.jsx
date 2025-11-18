import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiClient from '../../utils/apiClient';

const CreateJobPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Job categories for the dropdown
  const jobCategories = [
    'Technology', 
    'Healthcare', 
    'Finance', 
    'Education', 
    'Marketing', 
    'Sales', 
    'Customer Support', 
    'Human Resources',
    'Finance',
    'Operations',
    'Legal',
    'Other'
  ];
  
  const experienceOptions = [
    'Entry Level',
    'Mid Level',
    'Senior Level',
    'Director',
    'Executive'
  ];

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setLoading(true);
      
      // Get the auth token
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        setLoading(false);
        setSubmitting(false);
        return;
      }
      
      // Set up request with authorization header
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      console.log("Posting job with data:", values);
      
      // Use the correct endpoint as specified in the API
      try {
        const response = await apiClient.post(`/jobs/post-job`, values, config);
        console.log("Job posting response:", response.data);
        
        toast.success('Job posted successfully!');
        resetForm();
        // Redirect to jobs list page after successful creation
        setTimeout(() => {
          navigate('/admin/jobs');
        }, 1500);
      } catch (apiError) {
        console.error("API error posting job:", apiError);
        toast.error(apiError.response?.data?.message || 'Failed to post job. Please try again.');
      }
    } catch (err) {
      console.error("Error in job submission:", err);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      title: '',
      company: '',
      location: '',
      type: 'Full-time',
      category: '',
      experienceLevel: '',
      salary: '',
      description: '',
      requirements: '',
      responsibilities: '',
      benefits: '',
      applicationDeadline: '',
      contactEmail: '',
      contactPhone: '',
      website: '',
      isActive: true
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Job title is required'),
      company: Yup.string().required('Company name is required'),
      location: Yup.string().required('Location is required'),
      type: Yup.string().required('Job type is required'),
      category: Yup.string().required('Category is required'),
      experienceLevel: Yup.string().required('Experience level is required'),
      salary: Yup.string(),
      description: Yup.string().required('Job description is required'),
      requirements: Yup.string().required('Requirements are required'),
      responsibilities: Yup.string().required('Responsibilities are required'),
      benefits: Yup.string(),
      applicationDeadline: Yup.date().nullable(),
      contactEmail: Yup.string().email('Invalid email address'),
      contactPhone: Yup.string(),
      website: Yup.string().url('Invalid URL'),
      isActive: Yup.boolean()
    }),
    onSubmit: handleSubmit,
  });

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Create New Job</h1>
        <p className="text-secondary-600">Fill in the details below to post a new job opportunity</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="border-b border-secondary-200 pb-6">
            <h2 className="text-lg font-medium text-secondary-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-secondary-700 mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="input w-full"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="e.g., Senior Software Engineer"
                />
                {formik.touched.title && formik.errors.title ? (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.title}</p>
                ) : null}
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-secondary-700 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  className="input w-full"
                  value={formik.values.company}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="e.g., Tech Innovations Inc."
                />
                {formik.touched.company && formik.errors.company ? (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.company}</p>
                ) : null}
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-secondary-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  className="input w-full"
                  value={formik.values.location}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="e.g., San Francisco, CA or Remote"
                />
                {formik.touched.location && formik.errors.location ? (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.location}</p>
                ) : null}
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-secondary-700 mb-1">
                  Job Type *
                </label>
                <select
                  id="type"
                  name="type"
                  className="input w-full"
                  value={formik.values.type}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Internship">Internship</option>
                </select>
                {formik.touched.type && formik.errors.type ? (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.type}</p>
                ) : null}
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-secondary-700 mb-1">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  className="input w-full"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="">Select a category</option>
                  {jobCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {formik.touched.category && formik.errors.category ? (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.category}</p>
                ) : null}
              </div>

              <div>
                <label htmlFor="experienceLevel" className="block text-sm font-medium text-secondary-700 mb-1">
                  Experience Level *
                </label>
                <select
                  id="experienceLevel"
                  name="experienceLevel"
                  className="input w-full"
                  value={formik.values.experienceLevel}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="">Select experience level</option>
                  {experienceOptions.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                {formik.touched.experienceLevel && formik.errors.experienceLevel ? (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.experienceLevel}</p>
                ) : null}
              </div>

              <div>
                <label htmlFor="salary" className="block text-sm font-medium text-secondary-700 mb-1">
                  Salary Range
                </label>
                <input
                  type="text"
                  id="salary"
                  name="salary"
                  className="input w-full"
                  value={formik.values.salary}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="e.g., $80,000 - $120,000"
                />
                {formik.touched.salary && formik.errors.salary ? (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.salary}</p>
                ) : null}
              </div>

              <div>
                <label htmlFor="applicationDeadline" className="block text-sm font-medium text-secondary-700 mb-1">
                  Application Deadline
                </label>
                <input
                  type="date"
                  id="applicationDeadline"
                  name="applicationDeadline"
                  className="input w-full"
                  value={formik.values.applicationDeadline}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.applicationDeadline && formik.errors.applicationDeadline ? (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.applicationDeadline}</p>
                ) : null}
              </div>
            </div>
          </div>

          {/* Job Description Section */}
          <div className="border-b border-secondary-200 pb-6">
            <h2 className="text-lg font-medium text-secondary-900 mb-4">Job Description</h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-secondary-700 mb-1">
                  Job Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  className="input w-full"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Provide a detailed description of the role and what the position entails..."
                ></textarea>
                {formik.touched.description && formik.errors.description ? (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.description}</p>
                ) : null}
              </div>

              <div>
                <label htmlFor="requirements" className="block text-sm font-medium text-secondary-700 mb-1">
                  Requirements *
                </label>
                <textarea
                  id="requirements"
                  name="requirements"
                  rows={4}
                  className="input w-full"
                  value={formik.values.requirements}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="List the qualifications, skills, and experience required for this position..."
                ></textarea>
                {formik.touched.requirements && formik.errors.requirements ? (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.requirements}</p>
                ) : null}
              </div>

              <div>
                <label htmlFor="responsibilities" className="block text-sm font-medium text-secondary-700 mb-1">
                  Responsibilities *
                </label>
                <textarea
                  id="responsibilities"
                  name="responsibilities"
                  rows={4}
                  className="input w-full"
                  value={formik.values.responsibilities}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Describe the key responsibilities and duties of this role..."
                ></textarea>
                {formik.touched.responsibilities && formik.errors.responsibilities ? (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.responsibilities}</p>
                ) : null}
              </div>

              <div>
                <label htmlFor="benefits" className="block text-sm font-medium text-secondary-700 mb-1">
                  Benefits
                </label>
                <textarea
                  id="benefits"
                  name="benefits"
                  rows={3}
                  className="input w-full"
                  value={formik.values.benefits}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="List any benefits offered with this position (e.g., health insurance, PTO, etc.)..."
                ></textarea>
                {formik.touched.benefits && formik.errors.benefits ? (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.benefits}</p>
                ) : null}
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="border-b border-secondary-200 pb-6">
            <h2 className="text-lg font-medium text-secondary-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-secondary-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  className="input w-full"
                  value={formik.values.contactEmail}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="hr@company.com"
                />
                {formik.touched.contactEmail && formik.errors.contactEmail ? (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.contactEmail}</p>
                ) : null}
              </div>

              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-secondary-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactPhone"
                  className="input w-full"
                  value={formik.values.contactPhone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="(555) 123-4567"
                />
                {formik.touched.contactPhone && formik.errors.contactPhone ? (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.contactPhone}</p>
                ) : null}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="website" className="block text-sm font-medium text-secondary-700 mb-1">
                  Company Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  className="input w-full"
                  value={formik.values.website}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="https://www.company.com"
                />
                {formik.touched.website && formik.errors.website ? (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.website}</p>
                ) : null}
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div>
            <h2 className="text-lg font-medium text-secondary-900 mb-4">Status</h2>
            <div className="flex items-center">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                checked={formik.values.isActive}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-secondary-900">
                Active (Check this box to make the job visible to job seekers)
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={() => navigate('/admin/jobs')}
              className="btn btn-secondary py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formik.isSubmitting || loading}
              className="btn btn-primary py-2 px-4"
            >
              {formik.isSubmitting || loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Posting Job...
                </>
              ) : (
                'Post Job'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJobPage;