import React, { useState } from 'react';
import { useFormik } from 'formik';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { registerSchema } from '../validations/auth.validation';
import { User, Mail, Lock, AlertCircle, Camera, CheckCircle } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const formik = useFormik({
    initialValues: {
      fullName: '',
      email: '',
      password: '',
      role: 'admin', // default
      profileImage: null,
    },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      setError('');
      setIsSubmittingLocal(true);
      
      const formData = new FormData();
      formData.append('fullName', values.fullName);
      formData.append('email', values.email);
      formData.append('password', values.password);
      formData.append('role', values.role);
      if (values.profileImage) {
        formData.append('profileImage', values.profileImage);
      }

      try {
        await register(formData);
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (err) {
        setError(err);
      } finally {
        setIsSubmittingLocal(false);
      }
    },
  });

  const handleImageChange = (e) => {
    const file = e.currentTarget.files[0];
    if (file) {
      formik.setFieldValue('profileImage', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8 space-y-4 animate-fade-in">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
          <CheckCircle className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-white">Registration Successful!</h2>
        <p className="text-sm text-slate-400 max-w-xs mx-auto">
          Your account has been created. Redirecting you to the sign-in page...
        </p>
        <Link 
          to="/login" 
          className="inline-block mt-4 text-sm font-semibold text-sky-400 hover:text-sky-350"
        >
          Click here if not redirected automatically
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-white">Create Account</h2>
        <p className="text-sm text-slate-400">Get started with Apex Academy</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {/* Profile Image Upload */}
        <div className="flex flex-col items-center space-y-2">
          <div className="relative h-20 w-20 overflow-hidden rounded-full bg-slate-850 border-2 border-dashed border-slate-700 flex items-center justify-center hover:border-sky-500/50 transition-colors">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <Camera className="h-8 w-8 text-slate-500" />
            )}
            <input
              id="profileImage"
              name="profileImage"
              type="file"
              accept="image/*"
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={handleImageChange}
            />
          </div>
          <span className="text-xs text-slate-450 font-medium">Upload Profile Picture</span>
        </div>

        {/* Full Name Field */}
        <div className="space-y-1 text-left">
          <label className="text-xs font-semibold text-slate-350" htmlFor="fullName">
            Full Name
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <User className="h-5 w-5 text-slate-500" />
            </div>
            <input
              id="fullName"
              name="fullName"
              type="text"
              className={`w-full pl-10 glass-input ${
                formik.touched.fullName && formik.errors.fullName ? 'border-red-500/50' : ''
              }`}
              placeholder="John Doe"
              value={formik.values.fullName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>
          {formik.touched.fullName && formik.errors.fullName && (
            <p className="text-xs text-red-400 mt-1">{formik.errors.fullName}</p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-1 text-left">
          <label className="text-xs font-semibold text-slate-350" htmlFor="email">
            Email Address
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="h-5 w-5 text-slate-500" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              className={`w-full pl-10 glass-input ${
                formik.touched.email && formik.errors.email ? 'border-red-500/50' : ''
              }`}
              placeholder="you@school.com"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>
          {formik.touched.email && formik.errors.email && (
            <p className="text-xs text-red-400 mt-1">{formik.errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1 text-left">
          <label className="text-xs font-semibold text-slate-350" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-5 w-5 text-slate-500" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              className={`w-full pl-10 glass-input ${
                formik.touched.password && formik.errors.password ? 'border-red-500/50' : ''
              }`}
              placeholder="••••••••"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>
          {formik.touched.password && formik.errors.password && (
            <p className="text-xs text-red-400 mt-1">{formik.errors.password}</p>
          )}
        </div>

        {/* Role Selection */}
        <div className="space-y-1 text-left">
          <label className="text-xs font-semibold text-slate-350" htmlFor="role">
            I am a...
          </label>
          <select
            id="role"
            name="role"
            className="w-full glass-input"
            value={formik.values.role}
            onChange={formik.handleChange}
          >
            <option value="admin" className="bg-slate-900 text-white">Administrator</option>
            <option value="teacher" className="bg-slate-900 text-white">Teacher</option>
            <option value="student" className="bg-slate-900 text-white">Student</option>
            <option value="parent" className="bg-slate-900 text-white">Parent</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmittingLocal}
          className="flex w-full items-center justify-center rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-sky-600 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none min-h-[44px]"
        >
          {isSubmittingLocal ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          ) : (
            'Register'
          )}
        </button>
      </form>

      <div className="text-center text-sm text-slate-400 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-sky-400 hover:text-sky-350 transition-colors">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default Register;
