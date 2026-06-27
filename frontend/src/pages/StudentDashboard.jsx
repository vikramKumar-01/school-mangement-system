import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User, BookOpen, CalendarCheck, DollarSign, TrendingUp,
  CheckCircle, XCircle, Minus, Clock, AlertCircle, IndianRupee,
  GraduationCap, ChevronRight
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { studentService } from '../services/student.service';
import { feeService } from '../services/fee.service';
import { attendanceService } from '../services/attendance.service';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [studentRecord, setStudentRecord] = useState(null);
  const [fees, setFees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');

        // 1. Find the student record matching this user's fullName
        const stuRes = await studentService.getAll({ search: user.fullName, limit: 5 });
        const matched = (stuRes?.students || []).find(
          (s) => s.name?.toLowerCase() === user.fullName?.toLowerCase()
        );
        setStudentRecord(matched || null);

        // 2. Fetch fees for this student (filter by studentId if found)
        const feeParams = matched ? { studentId: matched._id, limit: 20 } : { limit: 20 };
        const feeRes = await feeService.getAll(feeParams);
        setFees(feeRes?.fees || []);

        // 3. Fetch attendance records
        const attParams = matched ? { studentId: matched._id, limit: 50 } : { limit: 50 };
        const attRes = await attendanceService.getAll(attParams);
        setAttendance(attRes?.attendance || attRes?.records || []);
      } catch (err) {
        console.error('StudentDashboard load error:', err);
        setError('Could not load your data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    if (user?.fullName) load();
  }, [user]);

  // ── Computed stats ───────────────────────────────────────────────────────
  const totalFees = fees.reduce((sum, f) => sum + (f.amount || 0), 0);
  const paidFees = fees.filter((f) => f.status === 'Paid').reduce((sum, f) => sum + (f.amount || 0), 0);
  const pendingFees = fees.filter((f) => f.status === 'pending' || f.status === 'Pending' || f.status === 'Unpaid')
    .reduce((sum, f) => sum + (f.amount || 0), 0);

  const presentCount = attendance.filter((a) => a.status === 'Present').length;
  const absentCount = attendance.filter((a) => a.status === 'Absent').length;
  const holidayCount = attendance.filter((a) => a.status === 'Holiday').length;
  const totalDays = attendance.length;
  const attendancePct = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0;

  const recentAttendance = [...attendance]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 7);

  const recentFees = [...fees]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const statusIcon = (status) => {
    if (status === 'Present') return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    if (status === 'Absent') return <XCircle className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-slate-400" />;
  };

  const feeStatusBadge = (status) => {
    const s = status?.toLowerCase();
    if (s === 'paid') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400';
    if (s === 'pending' || s === 'unpaid') return 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400';
    if (s === 'overdue') return 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400';
    return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-64">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-blue-500" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {user.fullName.split(' ')[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Here's a summary of your academic profile, attendance, and fee status.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-4 text-sm text-amber-700 dark:text-amber-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* ── Student Profile Card ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="shrink-0 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl font-bold shadow-lg shadow-blue-500/20">
            {user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user.fullName}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold capitalize">
                <GraduationCap className="h-3.5 w-3.5" />
                {user.role}
              </span>
              {studentRecord?.class && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold">
                  <BookOpen className="h-3.5 w-3.5" />
                  Class {studentRecord.class}
                </span>
              )}
              {studentRecord?.rollNumber && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                  Roll No: {studentRecord.rollNumber}
                </span>
              )}
            </div>

            {studentRecord && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                {studentRecord.fatherName && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">Father's Name</p>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{studentRecord.fatherName}</p>
                  </div>
                )}
                {studentRecord.phone && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">Contact</p>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{studentRecord.phone}</p>
                  </div>
                )}
                {studentRecord.address && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">Address</p>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-0.5 truncate">{studentRecord.address}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats Row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Attendance Rate',
            value: `${attendancePct}%`,
            sub: `${presentCount} present / ${totalDays} days`,
            icon: CalendarCheck,
            color: attendancePct >= 75
              ? 'from-emerald-400 to-teal-500'
              : 'from-red-400 to-rose-500',
          },
          {
            label: 'Days Present',
            value: presentCount,
            sub: `${absentCount} absent, ${holidayCount} holiday`,
            icon: CheckCircle,
            color: 'from-blue-400 to-indigo-500',
          },
          {
            label: 'Fees Paid',
            value: `₹${paidFees.toLocaleString('en-IN')}`,
            sub: `of ₹${totalFees.toLocaleString('en-IN')} total`,
            icon: IndianRupee,
            color: 'from-violet-400 to-purple-500',
          },
          {
            label: 'Pending Fees',
            value: `₹${pendingFees.toLocaleString('en-IN')}`,
            sub: pendingFees > 0 ? 'Please clear soon' : 'All clear! ✅',
            icon: DollarSign,
            color: pendingFees > 0 ? 'from-amber-400 to-orange-500' : 'from-emerald-400 to-teal-500',
          },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{card.label}</p>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} text-white shadow-md`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{card.value}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* ── Recent Attendance + Fee Records ────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Attendance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Attendance</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Last 7 records</p>
            </div>
            <Link
              to="/dashboard/attendance"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              View All <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentAttendance.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <CalendarCheck className="h-8 w-8 text-slate-200 dark:text-slate-700" />
              <p className="text-xs text-slate-400">No attendance records yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentAttendance.map((rec, i) => (
                <div key={rec._id || i} className="flex items-center gap-3 px-5 py-3">
                  {statusIcon(rec.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {rec.status}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {new Date(rec.date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    rec.status === 'Present'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                      : rec.status === 'Absent'
                      ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {rec.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fee Records */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Fee Records</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Latest 5 transactions</p>
            </div>
            <Link
              to="/dashboard/fees"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              View All <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentFees.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <DollarSign className="h-8 w-8 text-slate-200 dark:text-slate-700" />
              <p className="text-xs text-slate-400">No fee records found.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentFees.map((fee, i) => (
                <div key={fee._id || i} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 shrink-0">
                    <IndianRupee className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {fee.feeType || fee.type || 'Fee Payment'}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {fee.createdAt ? new Date(fee.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      ₹{(fee.amount || 0).toLocaleString('en-IN')}
                    </p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 inline-block ${feeStatusBadge(fee.status)}`}>
                      {fee.status || 'N/A'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Attendance Progress Bar */}
      {totalDays > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Attendance Overview</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
              <span>Overall Attendance</span>
              <span className={attendancePct >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                {attendancePct}%
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  attendancePct >= 75
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                    : 'bg-gradient-to-r from-red-400 to-rose-500'
                }`}
                style={{ width: `${attendancePct}%` }}
              />
            </div>
            <div className="flex gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" /> Present: {presentCount}</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500 inline-block" /> Absent: {absentCount}</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-400 inline-block" /> Holiday: {holidayCount}</span>
            </div>
            {attendancePct < 75 && (
              <div className="flex items-center gap-2 mt-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 px-3 py-2 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Your attendance is below 75%. Please regularize to avoid academic penalty.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
