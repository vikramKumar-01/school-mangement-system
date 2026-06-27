import React, { useState } from 'react';
import { useFormik } from 'formik';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { loginSchema } from '../validations/auth.validation';
import { Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      setError('');
      setIsSubmittingLocal(true);
      try {
        await login(values.email, values.password);
      } catch (err) {
        setError(err);
      } finally {
        setIsSubmittingLocal(false);
      }
    },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-heading transition-colors">Sign In</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium transition-colors">Access your school dashboard</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 p-4 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1 text-left">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wide transition-colors" htmlFor="email">
            Email Address
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="h-5 w-5 text-slate-400 dark:text-slate-500" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              className={`w-full pl-10 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm ${
                formik.touched.email && formik.errors.email
                  ? 'border-red-300 dark:border-red-900/50 focus:ring-red-500/20 focus:border-red-500'
                  : ''
              }`}
              placeholder="you@school.com"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>
          {formik.touched.email && formik.errors.email && (
            <p className="text-xs text-red-500 mt-1 font-medium">{formik.errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1 text-left">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-355 uppercase tracking-wide transition-colors" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-5 w-5 text-slate-400 dark:text-slate-500" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              className={`w-full pl-10 pr-10 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm ${
                formik.touched.password && formik.errors.password
                  ? 'border-red-300 dark:border-red-900/50 focus:ring-red-500/20 focus:border-red-500'
                  : ''
              }`}
              placeholder="••••••••"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 dark:text-slate-500 hover:text-slate-655 dark:hover:text-white transition-colors cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {formik.touched.password && formik.errors.password && (
            <p className="text-xs text-red-500 mt-1 font-medium">{formik.errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmittingLocal}
          className="flex w-full items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-755 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none min-h-[44px] cursor-pointer"
        >
          {isSubmittingLocal ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6 font-medium transition-colors">
        Don't have an account?{' '}
        <Link to="/register" className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
          Create an Account
        </Link>
      </div>
    </div>
  );
};

export default Login;
