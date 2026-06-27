import React from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { GraduationCap } from 'lucide-react';

const AuthLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  // If already authenticated, redirect to dashboard
  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-800">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      {/* Decorative gradient glowing spots */}
      <div className="absolute -left-48 -top-48 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"></div>
      <div className="absolute -bottom-48 -right-48 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center flex flex-col items-center">
          <Link to="/" className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-transform">
            <GraduationCap className="h-6 w-6" />
          </Link>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading transition-colors">
            Apex Academy
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium transition-colors">
            School Management System
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-slate-800 dark:text-slate-100 transition-all duration-300">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
