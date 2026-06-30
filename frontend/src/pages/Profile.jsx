import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import useAuth from '../hooks/useAuth';
import { changePasswordSchema } from '../validations/profile.validation';
import { studentService } from '../services/student.service';
import { teacherService } from '../services/teacher.service';
import {
  AlertCircle, Camera, CheckCircle, ShieldCheck, User, Lock,
  Mail, Fingerprint, Eye, EyeOff, Calendar, Activity, BadgeCheck,
  BookOpen, Phone, Home, Users, Hash
} from 'lucide-react';


const Profile = () => {
  const { user, changePassword, updateProfile } = useAuth();

  const [imageError, setImageError]       = useState('');
  const [imageSuccess, setImageSuccess]   = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [imagePreview, setImagePreview] = useState(user?.profileImage || null);
  const [showNewPassword, setShowNewPassword]     = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ── Student / Teacher record ─────────────────────────────────────────────
  const [profileRecord, setProfileRecord] = useState(null);
  const [profileRecordLoading, setProfileRecordLoading] = useState(false);

  useEffect(() => {
    const fetchRecord = async () => {
      if (!user) return;
      setProfileRecordLoading(true);
      try {
        if (user.role === 'student') {
          // Search by name to find the student record linked to this user account
          const res = await studentService.getAll({ search: user.fullName, limit: 20 });
          const matched = (res?.students || []).find(
            s => s.name?.toLowerCase() === user.fullName?.toLowerCase() ||
                 s.user?.userId === user.userId
          );
          setProfileRecord(matched || null);
        } else if (user.role === 'teacher') {
          const res = await teacherService.getAll({ search: user.fullName, limit: 20 });
          const matched = (res?.teachers || []).find(
            t => t.name?.toLowerCase() === user.fullName?.toLowerCase() ||
                 t.user?.userId === user.userId
          );
          setProfileRecord(matched || null);
        }
      } catch (err) {
        console.error('Failed to load profile record:', err);
      } finally {
        setProfileRecordLoading(false);
      }
    };
    fetchRecord();
  }, [user]);

  // ── Password form ────────────────────────────────────────────────────────
  const passwordForm = useFormik({
    initialValues: { oldPassword: '', newPassword: '', confirmNewPassword: '' },
    validationSchema: changePasswordSchema,
    onSubmit: async (values) => {
      setPasswordError('');
      setPasswordSuccess('');
      try {
        await changePassword(values.oldPassword, values.newPassword);
        setPasswordSuccess('Password updated successfully!');
        passwordForm.resetForm();
        setTimeout(() => setPasswordSuccess(''), 4000);
      } catch (err) {
        setPasswordError(err || 'Failed to update password');
      }
    },
  });

  // ── Image handler (auto-upload on select) ────────────────────────────────
  const handleImageChange = async (e) => {
    const file = e.currentTarget.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    setImageUploading(true);
    setImageError('');
    setImageSuccess('');
    try {
      const formData = new FormData();
      formData.append('fullName', user.fullName);
      formData.append('profileImage', file);
      await updateProfile(user._id, formData);
      setImageSuccess('Profile photo updated!');
      setTimeout(() => setImageSuccess(''), 4000);
    } catch (err) {
      setImageError(err || 'Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

  const roleColors = {
    admin:   'bg-rose-500/10   text-rose-400   border border-rose-500/20',
    teacher: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    student: 'bg-sky-500/10   text-sky-400    border border-sky-500/20',
  };
  const roleColor = roleColors[user?.role] || 'bg-slate-500/10 text-slate-400 border border-slate-500/20';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">My Profile</h1>
        <p className="mt-1 text-sm text-slate-400">
          View your account details. You can update your profile photo and password.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3 items-start">

        {/* ── Left: Avatar Card ──────────────────────────────────────────── */}
        <div className="glass-panel rounded-3xl p-6 text-center space-y-5">

          {/* Avatar with camera overlay */}
          <div className="relative mx-auto h-28 w-28 rounded-full overflow-hidden bg-slate-800 border-4 border-slate-700 shadow-xl group">
            {imagePreview ? (
              <img src={imagePreview} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-bold text-white text-3xl bg-gradient-to-br from-sky-600 to-indigo-600">
                {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
              </div>
            )}
            <label className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity gap-1">
              {imageUploading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Camera className="h-5 w-5 text-white" />
                  <span className="text-[10px] text-white font-bold">Change</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                disabled={imageUploading}
              />
            </label>
          </div>

          {/* Image feedback */}
          {imageSuccess && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-400">
              <CheckCircle className="h-4 w-4 shrink-0" /><p>{imageSuccess}</p>
            </div>
          )}
          {imageError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-2.5 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" /><p>{imageError}</p>
            </div>
          )}

          {/* Name & role badge */}
          <div>
            <h2 className="text-xl font-bold text-white leading-tight">{user?.fullName}</h2>
            <span className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize ${roleColor}`}>
              <ShieldCheck className="h-3.5 w-3.5" />
              {user?.role}
            </span>
          </div>

          {/* Quick overview */}
          <div className="text-left space-y-3 text-sm text-slate-400 border-t border-slate-800 pt-4">
            <div className="flex items-center gap-3">
              <Fingerprint className="h-4 w-4 text-slate-500 shrink-0" />
              <span className="truncate font-mono text-sky-400">{user?.userId || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-slate-500 shrink-0" />
              <span className="truncate">{user?.email || 'No email set'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Activity className="h-4 w-4 text-slate-500 shrink-0" />
              <span className={`font-semibold capitalize flex items-center gap-1.5 ${user?.status === 'active' ? 'text-emerald-400' : 'text-amber-400'}`}>
                <span className={`h-2 w-2 rounded-full inline-block ${user?.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
                {user?.status || 'active'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-slate-500 shrink-0" />
              <span className="text-xs">Joined {formatDate(user?.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* ── Right: Info + Password ─────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-8">

          {/* 1. Account Information — Read Only */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-sky-400" />
              <h3 className="text-lg font-bold text-white">Account Information</h3>
              <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">Read Only</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                <div className="glass-input py-2.5 px-4 text-sm text-white font-semibold opacity-70 cursor-not-allowed select-none rounded-xl">
                  {user?.fullName || '—'}
                </div>
              </div>

              {/* User ID */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">User ID</label>
                <div className="glass-input py-2.5 px-4 text-sm font-mono text-sky-400 font-bold bg-sky-500/5 opacity-80 cursor-not-allowed select-none rounded-xl">
                  {user?.userId || '—'}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <div className="glass-input py-2.5 px-4 text-sm text-slate-300 opacity-70 cursor-not-allowed select-none truncate rounded-xl">
                  {user?.email || '—'}
                </div>
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Role</label>
                <div className={`glass-input py-2.5 px-4 text-sm font-bold capitalize cursor-not-allowed select-none rounded-xl ${roleColor}`}>
                  {user?.role || '—'}
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Account Status</label>
                <div className={`glass-input py-2.5 px-4 text-sm font-bold capitalize cursor-not-allowed select-none flex items-center gap-2 rounded-xl ${user?.status === 'active' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  <span className={`h-2 w-2 rounded-full ${user?.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
                  {user?.status || 'active'}
                </div>
              </div>

              {/* Member Since */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Member Since</label>
                <div className="glass-input py-2.5 px-4 text-sm text-slate-400 opacity-70 cursor-not-allowed select-none rounded-xl">
                  {formatDate(user?.createdAt)}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 flex items-center gap-1.5 pt-1">
              <BadgeCheck className="h-3.5 w-3.5 shrink-0" />
              To update your name, email, or other details, please contact the administrator.
            </p>
          </div>

          {/* 2. Student Academic Details — Read Only */}
          {user?.role === 'student' && (
            <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-sky-400" />
                <h3 className="text-lg font-bold text-white">Academic Details</h3>
                <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">Read Only</span>
              </div>

              {profileRecordLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-sky-500" />
                </div>
              ) : profileRecord ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Class */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><BookOpen className="h-3 w-3" /> Class</label>
                    <div className="glass-input py-2.5 px-4 text-sm font-bold text-sky-400 bg-sky-500/5 cursor-not-allowed select-none rounded-xl">
                      {profileRecord.class || '—'}
                    </div>
                  </div>

                  {/* Roll Number */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Hash className="h-3 w-3" /> Roll Number</label>
                    <div className="glass-input py-2.5 px-4 text-sm font-mono font-bold text-white cursor-not-allowed select-none rounded-xl">
                      {profileRecord.rollNumber || '—'}
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Users className="h-3 w-3" /> Gender</label>
                    <div className="glass-input py-2.5 px-4 text-sm text-slate-300 cursor-not-allowed select-none rounded-xl">
                      {profileRecord.gender || '—'}
                    </div>
                  </div>

                  {/* Father's Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><User className="h-3 w-3" /> Father's Name</label>
                    <div className="glass-input py-2.5 px-4 text-sm text-slate-300 cursor-not-allowed select-none rounded-xl">
                      {profileRecord.fatherName || '—'}
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Phone className="h-3 w-3" /> Phone Number</label>
                    <div className="glass-input py-2.5 px-4 text-sm font-mono text-slate-300 cursor-not-allowed select-none rounded-xl">
                      {profileRecord.phone || '—'}
                    </div>
                  </div>

                  {/* Admission Date */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Admission Date</label>
                    <div className="glass-input py-2.5 px-4 text-sm text-slate-300 cursor-not-allowed select-none rounded-xl">
                      {profileRecord.admissionDate ? formatDate(profileRecord.admissionDate) : '—'}
                    </div>
                  </div>

                  {/* Address — full width */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Home className="h-3 w-3" /> Address</label>
                    <div className="glass-input py-2.5 px-4 text-sm text-slate-300 cursor-not-allowed select-none rounded-xl min-h-[44px]">
                      {profileRecord.address || '—'}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-6">No academic record found. Please contact the administrator.</p>
              )}
            </div>
          )}

          {/* 3. Teacher Details — Read Only */}
          {user?.role === 'teacher' && (
            <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">Teaching Details</h3>
                <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">Read Only</span>
              </div>

              {profileRecordLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-indigo-500" />
                </div>
              ) : profileRecord ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Subject */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><BookOpen className="h-3 w-3" /> Subject</label>
                    <div className="glass-input py-2.5 px-4 text-sm font-bold text-indigo-400 bg-indigo-500/5 cursor-not-allowed select-none rounded-xl">
                      {profileRecord.subject || '—'}
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Users className="h-3 w-3" /> Gender</label>
                    <div className="glass-input py-2.5 px-4 text-sm text-slate-300 cursor-not-allowed select-none rounded-xl">
                      {profileRecord.gender || '—'}
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Phone className="h-3 w-3" /> Phone Number</label>
                    <div className="glass-input py-2.5 px-4 text-sm font-mono text-slate-300 cursor-not-allowed select-none rounded-xl">
                      {profileRecord.phone || '—'}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Mail className="h-3 w-3" /> Work Email</label>
                    <div className="glass-input py-2.5 px-4 text-sm text-slate-300 cursor-not-allowed select-none truncate rounded-xl">
                      {profileRecord.email || '—'}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-6">No teaching record found. Please contact the administrator.</p>
              )}
            </div>
          )}

          {/* Change Password */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
              <Lock className="h-5 w-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-white">Security &amp; Password</h3>
            </div>

            {passwordError && (
              <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
                <AlertCircle className="h-5 w-5 shrink-0" /><p>{passwordError}</p>
              </div>
            )}
            {passwordSuccess && (
              <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400">
                <CheckCircle className="h-5 w-5 shrink-0" /><p>{passwordSuccess}</p>
              </div>
            )}

            <form onSubmit={passwordForm.handleSubmit} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-slate-350" htmlFor="oldPassword">Current Password</label>
                <input
                  id="oldPassword" name="oldPassword" type="password"
                  className={`w-full glass-input py-2.5 ${passwordForm.touched.oldPassword && passwordForm.errors.oldPassword ? 'border-red-500/50' : ''}`}
                  placeholder="••••••••"
                  value={passwordForm.values.oldPassword}
                  onChange={passwordForm.handleChange}
                  onBlur={passwordForm.handleBlur}
                />
                {passwordForm.touched.oldPassword && passwordForm.errors.oldPassword && (
                  <p className="text-xs text-red-400 mt-1">{passwordForm.errors.oldPassword}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* New Password */}
                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-slate-350" htmlFor="newPassword">New Password</label>
                  <div className="relative">
                    <input
                      id="newPassword" name="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      className={`w-full glass-input py-2.5 pr-10 ${passwordForm.touched.newPassword && passwordForm.errors.newPassword ? 'border-red-500/50' : ''}`}
                      placeholder="••••••••"
                      value={passwordForm.values.newPassword}
                      onChange={passwordForm.handleChange}
                      onBlur={passwordForm.handleBlur}
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300">
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordForm.touched.newPassword && passwordForm.errors.newPassword && (
                    <p className="text-xs text-red-400 mt-1">{passwordForm.errors.newPassword}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-slate-350" htmlFor="confirmNewPassword">Confirm New Password</label>
                  <div className="relative">
                    <input
                      id="confirmNewPassword" name="confirmNewPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={`w-full glass-input py-2.5 pr-10 ${passwordForm.touched.confirmNewPassword && passwordForm.errors.confirmNewPassword ? 'border-red-500/50' : ''}`}
                      placeholder="••••••••"
                      value={passwordForm.values.confirmNewPassword}
                      onChange={passwordForm.handleChange}
                      onBlur={passwordForm.handleBlur}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300">
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordForm.touched.confirmNewPassword && passwordForm.errors.confirmNewPassword && (
                    <p className="text-xs text-red-400 mt-1">{passwordForm.errors.confirmNewPassword}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={passwordForm.isSubmitting}
                  className="rounded-xl bg-indigo-500 hover:bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-50 min-h-[44px]"
                >
                  {passwordForm.isSubmitting ? 'Updating...' : 'Update Password'}
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

