import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';

const ProfileSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^\+?[0-9]{10,14}$/, 'Phone number is not valid'),
  title: Yup.string(),
  location: Yup.string(),
  bio: Yup.string().max(500, 'Bio must be at most 500 characters'),
});

const ProfilePage = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [resume, setResume] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        // Since there's no profile endpoint yet, we'll use the user data from AuthContext
        setUserData(user || {});
        setLoading(false);
      } catch (err) {
        toast.error('Failed to fetch profile data');
        setError('Failed to fetch profile data. Please try again later.');
        setLoading(false);
        console.error(err);
      }
    };

    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated, user]);

  // Display user role in the profile header
  const getRoleDisplay = () => {
    if (!user) return '';
    return user.isAdmin ? 'Administrator' : 'Job Seeker';
  };

  const handleProfileUpdate = async (values, { setSubmitting }) => {
    try {
      // For now, just show success message since there's no update endpoint
      // This should be replaced with a real API call when available
      toast.success('Profile updated successfully');
      setUserData(values);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // For now, just show a success message
      // This should be replaced with a real API call when available
      toast.success('Resume selected: ' + file.name);
      
      // Update the resume information locally
      setResume(file);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload resume');
      console.error(err);
    }
  };

  const initialValues = {
    name: userData?.name || '',
    email: userData?.email || '',
    phone: userData?.phone || '',
    title: userData?.title || 'Software Engineer',
    location: userData?.location || 'Remote',
    bio: userData?.bio || 'Passionate developer with expertise in web technologies.',
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-secondary-900">
            {userData?.name || user?.name || 'Your'} Profile
          </h1>
          <p className="text-secondary-600 mt-1">
            <span className="font-medium">{getRoleDisplay()}</span> • Update your personal information and resume
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <Formik
              initialValues={initialValues}
              validationSchema={ProfileSchema}
              onSubmit={handleProfileUpdate}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-1">
                        Full Name
                      </label>
                      <Field
                        id="name"
                        name="name"
                        type="text"
                        className={`input w-full ${errors.name && touched.name ? 'border-red-300 focus:ring-red-500' : ''}`}
                      />
                      <ErrorMessage name="name" component="div" className="mt-1 text-sm text-red-600" />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-1">
                        Email Address
                      </label>
                      <Field
                        id="email"
                        name="email"
                        type="email"
                        disabled
                        className="input w-full bg-secondary-50 cursor-not-allowed"
                      />
                      <p className="mt-1 text-sm text-secondary-500">Email cannot be changed</p>
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-secondary-700 mb-1">
                        Phone Number
                      </label>
                      <Field
                        id="phone"
                        name="phone"
                        type="text"
                        className={`input w-full ${errors.phone && touched.phone ? 'border-red-300 focus:ring-red-500' : ''}`}
                      />
                      <ErrorMessage name="phone" component="div" className="mt-1 text-sm text-red-600" />
                    </div>

                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-secondary-700 mb-1">
                        Professional Title
                      </label>
                      <Field
                        id="title"
                        name="title"
                        type="text"
                        className="input w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-secondary-700 mb-1">
                        Location
                      </label>
                      <Field
                        id="location"
                        name="location"
                        type="text"
                        className="input w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Resume/CV
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeUpload}
                        className="w-full p-2 border border-secondary-300 rounded-md"
                      />
                      <p className="mt-1 text-sm text-secondary-500">
                        {resume ? `Selected: ${resume.name}` : 'Upload your latest resume (PDF, DOC, DOCX)'}
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="bio" className="block text-sm font-medium text-secondary-700 mb-1">
                        Bio
                      </label>
                      <Field
                        as="textarea"
                        id="bio"
                        name="bio"
                        rows="4"
                        className={`input w-full ${errors.bio && touched.bio ? 'border-red-300 focus:ring-red-500' : ''}`}
                      />
                      <ErrorMessage name="bio" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-secondary-200">
                    <button
                      type="submit"
                      disabled={isSubmitting || loading}
                      className="btn btn-primary py-2 px-6"
                    >
                      {isSubmitting || loading ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Account Settings</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-secondary-200">
              <div>
                <h3 className="text-secondary-900 font-medium">Change Password</h3>
                <p className="text-secondary-500 text-sm">Update your password for security</p>
              </div>
              <button 
                className="text-primary-600 hover:text-primary-800 font-medium"
                onClick={() => toast.info('Password change functionality would be implemented here')}
              >
                Update
              </button>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-secondary-200">
              <div>
                <h3 className="text-secondary-900 font-medium">Notification Settings</h3>
                <p className="text-secondary-500 text-sm">Manage how you receive notifications</p>
              </div>
              <button 
                className="text-primary-600 hover:text-primary-800 font-medium"
                onClick={() => toast.info('Notification settings would be implemented here')}
              >
                Configure
              </button>
            </div>
            
            <div className="flex justify-between items-center py-3">
              <div>
                <h3 className="text-red-600 font-medium">Delete Account</h3>
                <p className="text-secondary-500 text-sm">Permanently delete your account and data</p>
              </div>
              <button 
                className="text-red-600 hover:text-red-800 font-medium"
                onClick={() => toast.warning('Account deletion would require confirmation')}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
