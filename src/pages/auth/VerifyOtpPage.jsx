import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../utils/apiClient';
import { toast } from 'react-toastify';

const VerifyOtpPage = () => {
  const { otp, verifyOtp } = useAuth();
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
      const response = await apiClient.post(`/auth/resend-otp`, { email: otp.email });
      toast.success('OTP resent successfully!');
      setCountdown(60);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  const formik = useFormik({
    initialValues: {
      otp: '',
    },
    validationSchema: Yup.object({
      otp: Yup.string()
        .required('OTP is required')
        .length(6, 'OTP must be exactly 6 digits')
        .matches(/^[0-9]+$/, 'OTP must contain only digits'),
    }),
    onSubmit: handleSubmit,
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-xl shadow-lg p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-secondary-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-secondary-600">
            We've sent a 6-digit code to <span className="font-medium">{otp.email}</span>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
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

          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-secondary-700">
              Enter OTP
            </label>
            <div className="mt-1">
              <input
                id="otp"
                name="otp"
                type="text"
                autoComplete="off"
                maxLength="6"
                required
                className="input w-full text-center text-2xl tracking-widest"
                value={formik.values.otp}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.otp && formik.errors.otp ? (
                <p className="mt-2 text-sm text-red-600">{formik.errors.otp}</p>
              ) : null}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {formik.isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-secondary-600">
            Didn't receive the code?{' '}
            <button
              onClick={handleResendOtp}
              disabled={countdown > 0}
              className={`font-medium ${countdown > 0 ? 'text-secondary-400 cursor-not-allowed' : 'text-primary-600 hover:text-primary-500'}`}
            >
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;