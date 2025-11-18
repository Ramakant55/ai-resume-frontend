import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { toast } from 'react-toastify';

const JobSchema = Yup.object().shape({
  title: Yup.string()
    .required('Job title is required')
    .min(3, 'Title must be at least 3 characters'),
  company: Yup.string()
    .required('Company name is required'),
  location: Yup.string()
    .required('Location is required'),
  jobType: Yup.string()
    .required('Job type is required'),
  category: Yup.string()
    .required('Category is required'),
  experience: Yup.string()
    .required('Experience level is required'),
  salary: Yup.string()
    .required('Salary information is required'),
  description: Yup.string()
    .required('Job description is required')
    .min(50, 'Description must be at least 50 characters'),
  requirements: Yup.array()
    .of(Yup.string().required('Requirement cannot be empty'))
    .min(1, 'At least one requirement is required'),
  skills: Yup.array()
    .of(Yup.string().required('Skill cannot be empty'))
    .min(1, 'At least one skill is required'),
});

const CreateJobPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const initialValues = {
    title: '',
    company: '',
    location: '',
    jobType: 'Full-time',
    category: 'Engineering',
    experience: 'Entry Level',
    salary: '',
    description: '',
    requirements: [''],
    skills: [''],
    isActive: true
  };

  const jobTypeOptions = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
  
  const categoryOptions = [
    'Engineering', 
    'Design', 
    'Product Management', 
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
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/jobs/post-job`, values, config);
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

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-secondary-900 mb-6">Post a New Job</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <Formik
          initialValues={initialValues}
          validationSchema={JobSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, isSubmitting, handleChange }) => (
            <Form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-secondary-700 mb-1">
                    Job Title*
                  </label>
                  <Field
                    id="title"
                    name="title"
                    type="text"
                    className={`input w-full ${errors.title && touched.title ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="e.g. Frontend Developer"
                  />
                  <ErrorMessage name="title" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-secondary-700 mb-1">
                    Company Name*
                  </label>
                  <Field
                    id="company"
                    name="company"
                    type="text"
                    className={`input w-full ${errors.company && touched.company ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="e.g. TechCorp"
                  />
                  <ErrorMessage name="company" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-secondary-700 mb-1">
                    Location*
                  </label>
                  <Field
                    id="location"
                    name="location"
                    type="text"
                    className={`input w-full ${errors.location && touched.location ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="e.g. New York, NY or Remote"
                  />
                  <ErrorMessage name="location" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="jobType" className="block text-sm font-medium text-secondary-700 mb-1">
                    Job Type*
                  </label>
                  <Field
                    as="select"
                    id="jobType"
                    name="jobType"
                    className={`input w-full ${errors.jobType && touched.jobType ? 'border-red-300 focus:ring-red-500' : ''}`}
                  >
                    {jobTypeOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </Field>
                  <ErrorMessage name="jobType" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-secondary-700 mb-1">
                    Category*
                  </label>
                  <Field
                    as="select"
                    id="category"
                    name="category"
                    className={`input w-full ${errors.category && touched.category ? 'border-red-300 focus:ring-red-500' : ''}`}
                  >
                    {categoryOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </Field>
                  <ErrorMessage name="category" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-secondary-700 mb-1">
                    Experience Level*
                  </label>
                  <Field
                    as="select"
                    id="experience"
                    name="experience"
                    className={`input w-full ${errors.experience && touched.experience ? 'border-red-300 focus:ring-red-500' : ''}`}
                  >
                    {experienceOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </Field>
                  <ErrorMessage name="experience" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="salary" className="block text-sm font-medium text-secondary-700 mb-1">
                    Salary Range*
                  </label>
                  <Field
                    id="salary"
                    name="salary"
                    type="text"
                    className={`input w-full ${errors.salary && touched.salary ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="e.g. $80,000 - $100,000 per year"
                  />
                  <ErrorMessage name="salary" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <div className="flex items-center h-10">
                    <Field
                      id="isActive"
                      name="isActive"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-secondary-900">
                      Publish job immediately
                    </label>
                  </div>
                  <p className="text-xs text-secondary-500 mt-1">
                    Uncheck this if you want to save the job as a draft
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-secondary-700 mb-1">
                  Job Description*
                </label>
                <Field
                  as="textarea"
                  id="description"
                  name="description"
                  rows="6"
                  className={`input w-full ${errors.description && touched.description ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="Provide a detailed description of the job role, responsibilities, and qualifications..."
                />
                <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600" />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Requirements*
                </label>
                <FieldArray name="requirements">
                  {({ remove, push }) => (
                    <div className="space-y-2">
                      {values.requirements.map((requirement, index) => (
                        <div key={index} className="flex">
                          <Field
                            name={`requirements.${index}`}
                            className={`input w-full ${
                              errors.requirements?.[index] && touched.requirements?.[index]
                                ? 'border-red-300 focus:ring-red-500'
                                : ''
                            }`}
                            placeholder="e.g. Bachelor's degree in Computer Science or related field"
                          />
                          <button
                            type="button"
                            className="ml-2 text-red-600 hover:text-red-800"
                            onClick={() => remove(index)}
                            disabled={values.requirements.length === 1}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      {errors.requirements && typeof errors.requirements === 'string' && (
                        <div className="mt-1 text-sm text-red-600">{errors.requirements}</div>
                      )}
                      <button
                        type="button"
                        className="mt-2 inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-800"
                        onClick={() => push('')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Requirement
                      </button>
                    </div>
                  )}
                </FieldArray>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Required Skills*
                </label>
                <FieldArray name="skills">
                  {({ remove, push }) => (
                    <div className="space-y-2">
                      {values.skills.map((skill, index) => (
                        <div key={index} className="flex">
                          <Field
                            name={`skills.${index}`}
                            className={`input w-full ${
                              errors.skills?.[index] && touched.skills?.[index]
                                ? 'border-red-300 focus:ring-red-500'
                                : ''
                            }`}
                            placeholder="e.g. React.js"
                          />
                          <button
                            type="button"
                            className="ml-2 text-red-600 hover:text-red-800"
                            onClick={() => remove(index)}
                            disabled={values.skills.length === 1}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      {errors.skills && typeof errors.skills === 'string' && (
                        <div className="mt-1 text-sm text-red-600">{errors.skills}</div>
                      )}
                      <button
                        type="button"
                        className="mt-2 inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-800"
                        onClick={() => push('')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Skill
                      </button>
                    </div>
                  )}
                </FieldArray>
              </div>

              <div className="pt-4 border-t border-secondary-200 flex justify-end space-x-3">
                <button
                  type="button"
                  className="btn btn-secondary py-2 px-4"
                  onClick={() => navigate('/admin/jobs')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="btn btn-primary py-2 px-6"
                >
                  {isSubmitting || loading ? 'Posting...' : 'Post Job'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CreateJobPage;
