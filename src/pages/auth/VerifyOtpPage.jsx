import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { toast } from 'react-toastify';

const OtpSchema = Yup.object().shape({
  otp: Yup.string()
    .required('OTP is required')
    .matches(/^\d{6}$/, 'OTP must be a 6-digit number'),
});

const VerifyOtpPage = () => {
  const { verifyOtp, otp, loading } = useAuth();
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if no email is stored (user didn't come from registration)
    if (!otp.email) {
      navigate('/register');
    }

    // Countdown timer for resend option
    const timer = countdown > 0 && setInterval(() => setCountdown(countdown - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown, otp.email, navigate]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      await verifyOtp(values);
      // Navigation to login page is handled in the verifyOtp function
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed. Please try again.');
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/resend-otp`, { email: otp.email });
      toast.success('OTP resent successfully!');
      setCountdown(60);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-secondary-900">
            Verify your email
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            We've sent a 6-digit verification code to{' '}
            <span className="font-medium">{otp.email || 'your email'}</span>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <Formik
          initialValues={{ otp: '' }}
          validationSchema={OtpSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-secondary-700">
                  Verification Code
                </label>
                <div className="mt-1">
                  <Field
                    id="otp"
                    name="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    maxLength="6"
                    className={`input w-full text-center text-lg tracking-widest ${errors.otp && touched.otp ? 'border-red-300 focus:ring-red-500' : ''}`}
                  />
                  <ErrorMessage name="otp" component="div" className="mt-1 text-sm text-red-600" />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="btn btn-primary w-full py-3"
                >
                  {isSubmitting || loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            </Form>
          )}
        </Formik>

        <div className="mt-6 text-center">
          <p className="text-sm text-secondary-600">
            Didn't receive the code?{' '}
            {countdown > 0 ? (
              <span className="text-secondary-500">
                Resend in {countdown} seconds
              </span>
            ) : (
              <button
                onClick={handleResendOtp}
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Resend code
              </button>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
