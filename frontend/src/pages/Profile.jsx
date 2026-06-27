import React, { useState } from 'react';
import { useFormik } from 'formik';
import useAuth from '../hooks/useAuth';
import { changePasswordSchema, updateProfileSchema } from '../validations/profile.validation';
import { AlertCircle, Camera, CheckCircle, ShieldCheck, User, Lock, Mail } from 'lucide-react';

const Profile = () => {
  const { user, changePassword, updateProfile } = useAuth();
  
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  const [imagePreview, setImagePreview] = useState(user?.profileImage || null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Form for Profile Detail Updates
  const profileForm = useFormik({
    initialValues: {
      fullName: user?.fullName || '',
    },
    validationSchema: updateProfileSchema,
    onSubmit: async (values) => {
      setProfileError('');
      setProfileSuccess('');
      
      const formData = new FormData();
      formData.append('fullName', values.fullName);
      if (selectedFile) {
        formData.append('profileImage', selectedFile);
      }

      try {
        await updateProfile(user._id, formData);
        setProfileSuccess('Profile details updated successfully!');
        setSelectedFile(null);
        setTimeout(() => setProfileSuccess(''), 3000);
      } catch (err) {
        setProfileError(err || 'Failed to update profile');
      }
    },
  });

  // Form for Password Updates
  const passwordForm = useFormik({
    initialValues: {
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
    validationSchema: changePasswordSchema,
    onSubmit: async (values) => {
      setPasswordError('');
      setPasswordSuccess('');
      try {
        await changePassword(values.oldPassword, values.newPassword);
        setPasswordSuccess('Password updated successfully!');
        passwordForm.resetForm();
        setTimeout(() => setPasswordSuccess(''), 3000);
      } catch (err) {
        setPasswordError(err || 'Failed to update password');
      }
    },
  });

  const handleImageChange = (e) => {
    const file = e.currentTarget.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Profile Settings</h1>
        <p className="mt-1 text-sm text-slate-400">Manage your credentials, profile pictures, and name.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3 items-start">
        {/* Left Side: Card View of User */}
        <div className="glass-panel rounded-3xl p-6 text-center space-y-4">
          <div className="relative mx-auto h-28 w-28 rounded-full overflow-hidden bg-slate-800 border-4 border-slate-700 shadow-xl group">
            {imagePreview ? (
              <img src={imagePreview} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-bold text-white text-3xl">
                {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
              </div>
            )}
            <label className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
              <Camera className="h-6 w-6 text-white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-white leading-tight">{user.fullName}</h2>
            <p className="text-xs text-slate-400 capitalize mt-1 inline-flex items-center gap-1 bg-slate-850 px-3 py-1 rounded-full">
              <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
              {user.role}
            </p>
          </div>

          <div className="text-left space-y-3 text-sm text-slate-350 border-t border-slate-850 pt-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-slate-500 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider shrink-0">Status:</span>
              <span className="text-emerald-400 font-semibold capitalize">{user.status}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Account Forms */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. Edit Profile Form */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-850 pb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-sky-400" />
              <h3 className="text-lg font-bold text-white">Personal Information</h3>
            </div>

            {profileError && (
              <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>{profileError}</p>
              </div>
            )}

            {profileSuccess && (
              <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400">
                <CheckCircle className="h-5 w-5 shrink-0" />
                <p>{profileSuccess}</p>
              </div>
            )}

            <form onSubmit={profileForm.handleSubmit} className="space-y-4">
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-slate-350" htmlFor="fullName">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  className={`w-full glass-input py-2.5 ${
                    profileForm.touched.fullName && profileForm.errors.fullName ? 'border-red-500/50' : ''
                  }`}
                  placeholder="e.g. John Doe"
                  value={profileForm.values.fullName}
                  onChange={profileForm.handleChange}
                  onBlur={profileForm.handleBlur}
                />
                {profileForm.touched.fullName && profileForm.errors.fullName && (
                  <p className="text-xs text-red-400 mt-1">{profileForm.errors.fullName}</p>
                )}
              </div>

              {selectedFile && (
                <p className="text-xs text-sky-400 font-semibold animate-pulse">
                  * A new profile image is selected. Click Save to upload.
                </p>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={profileForm.isSubmitting}
                  className="rounded-xl bg-sky-500 hover:bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-50 min-h-[44px]"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>

          {/* 2. Change Password Form */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-850 pb-3 flex items-center gap-2">
              <Lock className="h-5 w-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-white">Security & Password</h3>
            </div>

            {passwordError && (
              <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>{passwordError}</p>
              </div>
            )}

            {passwordSuccess && (
              <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400">
                <CheckCircle className="h-5 w-5 shrink-0" />
                <p>{passwordSuccess}</p>
              </div>
            )}

            <form onSubmit={passwordForm.handleSubmit} className="space-y-4">
              {/* Old Password */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-slate-350" htmlFor="oldPassword">
                  Current Password
                </label>
                <input
                  id="oldPassword"
                  name="oldPassword"
                  type="password"
                  className={`w-full glass-input py-2.5 ${
                    passwordForm.touched.oldPassword && passwordForm.errors.oldPassword ? 'border-red-550/50' : ''
                  }`}
                  placeholder="••••••••"
                  value={passwordForm.values.oldPassword}
                  onChange={passwordForm.handleChange}
                  onBlur={passwordForm.handleBlur}
                />
                {passwordForm.touched.oldPassword && passwordForm.errors.oldPassword && (
                  <p className="text-xs text-red-400 mt-1">{passwordForm.errors.oldPassword}</p>
                )}
              </div>

              {/* New Password */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-slate-350" htmlFor="newPassword">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    className={`w-full glass-input py-2.5 ${
                      passwordForm.touched.newPassword && passwordForm.errors.newPassword ? 'border-red-500/50' : ''
                    }`}
                    placeholder="••••••••"
                    value={passwordForm.values.newPassword}
                    onChange={passwordForm.handleChange}
                    onBlur={passwordForm.handleBlur}
                  />
                  {passwordForm.touched.newPassword && passwordForm.errors.newPassword && (
                    <p className="text-xs text-red-400 mt-1">{passwordForm.errors.newPassword}</p>
                  )}
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-slate-350" htmlFor="confirmNewPassword">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmNewPassword"
                    name="confirmNewPassword"
                    type="password"
                    className={`w-full glass-input py-2.5 ${
                      passwordForm.touched.confirmNewPassword && passwordForm.errors.confirmNewPassword ? 'border-red-500/50' : ''
                    }`}
                    placeholder="••••••••"
                    value={passwordForm.values.confirmNewPassword}
                    onChange={passwordForm.handleChange}
                    onBlur={passwordForm.handleBlur}
                  />
                  {passwordForm.touched.confirmNewPassword && passwordForm.errors.confirmNewPassword && (
                    <p className="text-xs text-red-400 mt-1">{passwordForm.errors.confirmNewPassword}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={passwordForm.isSubmitting}
                  className="rounded-xl bg-sky-500 hover:bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-50 min-h-[44px]"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
