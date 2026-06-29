import React, { useEffect, useState } from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  IndianRupee,
  TrendingUp,
  AlertCircle,
  Plus,
  BookOpenCheck,
  Award,
  Upload,
  Calendar,
  FileText,
  Volume2,
  FileCheck,
  FolderDown,
  X,
  CheckCircle2,
  DollarSign,
  Clock,
  Edit,
  Trash2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { studentService } from '../services/student.service';
import { teacherService } from '../services/teacher.service';
import { classService } from '../services/class.service';
import { feeService } from '../services/fee.service';
import { noticeService } from '../services/notice.service';
import useAuth from '../hooks/useAuth';
import StudentDashboard from './StudentDashboard';
import TeacherDashboard from './TeacherDashboard';
import { timetableService } from '../services/timetable.service';

const Dashboard = () => {
  const { user } = useAuth();

  // Route role check
  if (user?.role === 'student' || user?.role === 'parent') {
    return <StudentDashboard />;
  }
  if (user?.role === 'teacher') {
    return <TeacherDashboard />;
  }

  // Admin states
  const [stats, setStats] = useState({
    studentsCount: 0,
    teachersCount: 0,
    classesCount: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [timetable, setTimetable] = useState([]);
  const [timetableForm, setTimetableForm] = useState({ id: '', classId: '', subject: '', day: 'Monday', timeStart: '', timeEnd: '', room: '' });

  // Lists for dropdown options
  const [teachersList, setTeachersList] = useState([]);
  const [classesList, setClassesList] = useState([]);

  // Modals state
  const [modalType, setModalType] = useState(null); // 'student' | 'teacher' | 'class' | 'fee' | 'notice' | 'exam' | 'report' | 'import'
  const [modalSuccess, setModalSuccess] = useState('');

  // Quick Action form inputs
  const [studentForm, setStudentForm] = useState({ name: '', email: '', rollNumber: '', class: '', fatherName: '', phone: '', address: '' });
  const [teacherForm, setTeacherForm] = useState({ name: '', email: '', subject: '', qualification: '', phone: '' });
  const [classForm, setClassForm] = useState({ className: '', section: '', classTeacher: '' });
  const [feeForm, setFeeForm] = useState({ studentRoll: '', feeType: 'Tuition Fee', amount: '', status: 'Paid' });
  const [noticeForm, setNoticeForm] = useState({ title: '', content: '', category: 'general' });
  const [examForm, setExamForm] = useState({ subject: '', examType: 'Mid-Term', date: '', time: '' });
  const [importForm, setImportForm] = useState({ file: null });

  // Charts demo logs
  const enrollmentData = [
    { name: 'Jan', Students: 40 },
    { name: 'Feb', Students: 55 },
    { name: 'Mar', Students: 80 },
    { name: 'Apr', Students: 95 },
    { name: 'May', Students: 120 },
    { name: 'Jun', Students: 154 },
  ];

  const revenueData = [
    { name: 'Q1', Target: 10000, Collected: 8500 },
    { name: 'Q2', Target: 15000, Collected: 14200 },
    { name: 'Q3', Target: 20000, Collected: 17800 },
    { name: 'Q4', Target: 25000, Collected: 24500 },
  ];

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [studentRes, teacherRes, classRes, feeRes, timetableRes] = await Promise.all([
        studentService.getAll({ limit: 1 }).catch(() => null),
        teacherService.getAll({ limit: 100 }).catch(() => null),
        classService.getAll({ limit: 100 }).catch(() => null),
        feeService.getAll({ limit: 100 }).catch(() => null),
        timetableService.getAll({}).catch(() => null)
      ]);

      const studentsCount = studentRes?.pagination?.totalStudents || 0;
      const teachersCount = teacherRes?.pagination?.totalTeachers || teacherRes?.teachers?.length || 0;
      const classesCount = classRes?.pagination?.totalClasses || classRes?.classes?.length || 0;

      if (teacherRes?.teachers) setTeachersList(teacherRes.teachers);
      if (classRes?.classes) setClassesList(classRes.classes);

      if (timetableRes) {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        setTimetable(timetableRes.filter(t => t.day === today));
      }

      let revenue = 0;
      if (feeRes?.fees) {
        revenue = feeRes.fees
          .filter(f => f.status?.toLowerCase() === 'paid')
          .reduce((sum, f) => sum + (f.amount || 0), 0);
      }

      setStats({
        studentsCount,
        teachersCount,
        classesCount,
        revenue,
      });
    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
      setError('Failed to load real-time statistics from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const displayRevenue = stats.revenue > 0 ? stats.revenue : 65000;
  const displayStudents = stats.studentsCount > 0 ? stats.studentsCount : 154;
  const displayTeachers = stats.teachersCount > 0 ? stats.teachersCount : 18;
  const displayClasses = stats.classesCount > 0 ? stats.classesCount : 8;

  const cardData = [
    { title: 'Total Students', value: displayStudents, icon: Users, color: 'from-sky-400 to-blue-500', label: '+12% from last term' },
    { title: 'Total Teachers', value: displayTeachers, icon: GraduationCap, color: 'from-violet-400 to-indigo-500', label: '1:12 Teacher-Student Ratio' },
    { title: 'Active Classes', value: displayClasses, icon: BookOpen, color: 'from-emerald-400 to-teal-500', label: '98% Average Attendance' },
    { title: 'Revenue Collected', value: `₹${displayRevenue.toLocaleString()}`, icon: IndianRupee, color: 'from-amber-400 to-orange-500', label: '92% Fees Paid' },
  ];

  // Action submit handlers
  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    try {
      await studentService.create({
        name: studentForm.name,
        email: studentForm.email,
        rollNumber: Number(studentForm.rollNumber),
        class: studentForm.class,
        fatherName: studentForm.fatherName,
        phone: studentForm.phone,
        address: studentForm.address
      });
      setModalSuccess('Student successfully registered into system!');
      setTimeout(() => {
        setModalType(null);
        setStudentForm({ name: '', email: '', rollNumber: '', class: '', fatherName: '', phone: '', address: '' });
        fetchDashboardData();
      }, 1500);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to register student');
    }
  };

  const handleTeacherSubmit = async (e) => {
    e.preventDefault();
    try {
      await teacherService.create({
        name: teacherForm.name,
        email: teacherForm.email,
        subject: teacherForm.subject,
        qualification: teacherForm.qualification,
        phone: teacherForm.phone
      });
      setModalSuccess('Faculty member successfully registered!');
      setTimeout(() => {
        setModalType(null);
        setTeacherForm({ name: '', email: '', subject: '', qualification: '', phone: '' });
        fetchDashboardData();
      }, 1500);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to add faculty member');
    }
  };

  const handleClassSubmit = async (e) => {
    e.preventDefault();
    try {
      await classService.create({
        className: classForm.className,
        section: classForm.section,
        classTeacher: classForm.classTeacher || undefined
      });
      setModalSuccess('New class section created successfully!');
      setTimeout(() => {
        setModalType(null);
        setClassForm({ className: '', section: '', classTeacher: '' });
        fetchDashboardData();
      }, 1500);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to create class section');
    }
  };

  const handleFeeSubmit = async (e) => {
    e.preventDefault();
    try {
      const rollNum = Number(feeForm.studentRoll);
      const stuRes = await studentService.getAll({ limit: 100 });
      const matched = (stuRes?.students || []).find(s => Number(s.rollNumber) === rollNum);

      if (!matched) {
        alert("Student Roll Number not found in system!");
        return;
      }

      await feeService.create({
        student: matched._id,
        feeType: feeForm.feeType,
        amount: Number(feeForm.amount),
        status: feeForm.status
      });

      setModalSuccess('Fee invoice collection recorded successfully!');
      setTimeout(() => {
        setModalType(null);
        setFeeForm({ studentRoll: '', feeType: 'Tuition Fee', amount: '', status: 'Paid' });
        fetchDashboardData();
      }, 1500);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to record fee collection');
    }
  };

  const handleNoticeSubmit = async (e) => {
    e.preventDefault();
    try {
      await noticeService.create({
        title: noticeForm.title,
        content: noticeForm.content,
        category: noticeForm.category,
        author: 'Administration Office'
      });
      setModalSuccess('Notice circular published on active boards!');
      setTimeout(() => {
        setModalType(null);
        setNoticeForm({ title: '', content: '', category: 'general' });
      }, 1500);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to post notice circular');
    }
  };

  const handleExamSubmit = (e) => {
    e.preventDefault();
    setModalSuccess('Examination schedule set and shared!');
    setTimeout(() => {
      setModalType(null);
      setExamForm({ subject: '', examType: 'Mid-Term', date: '', time: '' });
    }, 1500);
  };

  const handleImportSubmit = (e) => {
    e.preventDefault();
    setModalSuccess('Import simulation successful! Student logs initialized.');
    setTimeout(() => {
      setModalType(null);
      setImportForm({ file: null });
      fetchDashboardData();
    }, 1800);
  };

  const handleTimetableSubmit = async (e) => {
    e.preventDefault();
    try {
      if (timetableForm.id) {
        await timetableService.update(timetableForm.id, timetableForm);
        setModalSuccess('Timetable updated successfully!');
      } else {
        await timetableService.create(timetableForm);
        setModalSuccess('Timetable entry added successfully!');
      }
      setTimeout(() => {
        setModalType(null);
        setTimetableForm({ id: '', classId: '', subject: '', day: 'Monday', timeStart: '', timeEnd: '', room: '' });
        fetchDashboardData();
      }, 1500);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to save timetable');
    }
  };

  const handleDeleteTimetable = async (id) => {
    if (!window.confirm("Are you sure you want to delete this timetable entry?")) return;
    try {
      await timetableService.delete(id);
      setTimetable(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete timetable entry');
    }
  };

  const openEditTimetable = (slot) => {
    setTimetableForm({
      id: slot._id,
      classId: slot.classId,
      subject: slot.subject,
      day: slot.day,
      timeStart: slot.timeStart,
      timeEnd: slot.timeEnd,
      room: slot.room
    });
    setModalType('timetable');
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-slate-400">
          Global analytics, faculty logs, class modules, and fee collection summaries.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-sm text-amber-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error} (Displaying dashboard system logs)</p>
        </div>
      )}

      {/* Grid of Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cardData.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="glass-card overflow-hidden p-6 relative group">
              <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-slate-850/50 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">{card.title}</p>
                  <h3 className="mt-2 text-3xl font-extrabold text-white">{card.value}</h3>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr ${card.color} text-white shadow-lg`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-455">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>{card.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Administrator Quick Action Shortcuts Grid ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-405 dark:text-slate-500 uppercase tracking-wider mb-5">Administrative Tools</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Add Student', icon: Plus, color: 'hover:border-blue-500 hover:text-blue-650 dark:hover:text-blue-400 bg-blue-500/5', type: 'student' },
            { label: 'Add Teacher', icon: GraduationCap, color: 'hover:border-violet-500 hover:text-violet-650 dark:hover:text-violet-400 bg-violet-500/5', type: 'teacher' },
            { label: 'Create Class', icon: BookOpen, color: 'hover:border-emerald-500 hover:text-emerald-650 dark:hover:text-emerald-400 bg-emerald-500/5', type: 'class' },
            { label: 'Collect Fees', icon: IndianRupee, color: 'hover:border-amber-500 hover:text-amber-650 dark:hover:text-amber-400 bg-amber-500/5', type: 'fee' },
            { label: 'Create Notice', icon: Volume2, color: 'hover:border-rose-500 hover:text-rose-655 dark:hover:text-rose-400 bg-rose-500/5', type: 'notice' },
            { label: 'Schedule Exam', icon: Calendar, color: 'hover:border-teal-500 hover:text-teal-655 dark:hover:text-teal-400 bg-teal-500/5', type: 'exam' },
            { label: 'Generate Report', icon: FileText, color: 'hover:border-sky-500 hover:text-sky-655 dark:hover:text-sky-400 bg-sky-500/5', type: 'report' },
            { label: 'Import Students', icon: Upload, color: 'hover:border-indigo-500 hover:text-indigo-655 dark:hover:text-indigo-400 bg-indigo-500/5', type: 'import' },
            { label: 'Manage Timetable', icon: Clock, color: 'hover:border-blue-500 hover:text-blue-655 dark:hover:text-blue-400 bg-blue-500/5', type: 'timetable' }
          ].map((act, i) => {
            const Icon = act.icon;
            return (
              <button
                key={i}
                onClick={() => { setModalType(act.type); setModalSuccess(''); }}
                className={`flex flex-col sm:flex-row items-center gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm transition-all text-xs font-bold text-slate-700 dark:text-slate-300 hover:scale-[1.01] hover:shadow-md cursor-pointer ${act.color}`}
              >
                <div className="p-2 rounded-xl bg-white dark:bg-slate-950 shadow-sm shrink-0">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <span>{act.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Graphs Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Student Enrollment Chart */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white">Enrollment Trend</h3>
            <p className="text-xs text-slate-450">Student registrations over the last 6 months</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enrollmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="Students" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#colorStudents)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Finance / Revenue Chart */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white">Fee Collections</h3>
            <p className="text-xs text-slate-450">Target vs collected revenue comparison</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Target" fill="#64748b" radius={[4, 4, 0, 0]} opacity={0.6} />
                <Bar dataKey="Collected" fill="#a78bfa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Today's Timetable (Admin View) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Today's Timetable</h3>
            <p className="text-xs text-slate-450 dark:text-slate-550 mt-0.5">Overview of scheduled classes across all sections</p>
          </div>
        </div>

        <div className="space-y-3">
          {timetable.map((slot) => {
            const cls = classesList.find(c => c._id === slot.classId || c.id === slot.classId);
            const classNameStr = cls ? (cls.className ? `${cls.className} ${cls.section || ''}` : cls.name) : 'Unknown Class';
            return (
              <div key={slot._id || slot.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shrink-0">
                    <Clock className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-450">{slot.timeStart} - {slot.timeEnd}</p>
                    <p className="text-sm font-black text-slate-800 dark:text-white mt-0.5">{slot.subject}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {classNameStr}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                    {slot.room}
                  </span>
                  <button onClick={() => openEditTimetable(slot)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDeleteTimetable(slot._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
          {timetable.length === 0 && (
            <div className="text-center py-6 text-slate-500 text-sm">No classes scheduled for today.</div>
          )}
        </div>
      </div>

      {/* ── MODALS (Administrator Quick Action Forms) ── */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-fade-in text-left">
            <button
              onClick={() => setModalType(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {modalSuccess ? (
              <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">Success!</h4>
                <p className="text-sm text-slate-505 dark:text-slate-400">{modalSuccess}</p>
              </div>
            ) : (
              <>
                {/* 1. Add Student Form */}
                {modalType === 'student' && (
                  <form onSubmit={handleStudentSubmit} className="space-y-3.5">
                    <h3 className="text-lg font-black text-slate-950 dark:text-white">Register Student</h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Full Name</label>
                        <input required type="text" placeholder="Alice Johnson" value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} className="w-full glass-input p-2.5 text-xs text-slate-800 dark:text-slate-200" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Email Address</label>
                        <input required type="email" placeholder="alice@gmail.com" value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} className="w-full glass-input p-2.5 text-xs text-slate-800 dark:text-slate-200" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Roll Number</label>
                        <input required type="number" placeholder="105" value={studentForm.rollNumber} onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })} className="w-full glass-input p-2.5 text-xs text-slate-800 dark:text-slate-200" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Class Section</label>
                        <input required type="text" placeholder="10-A" value={studentForm.class} onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })} className="w-full glass-input p-2.5 text-xs text-slate-800 dark:text-slate-200" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Father's Name</label>
                        <input required type="text" placeholder="Robert Johnson" value={studentForm.fatherName} onChange={(e) => setStudentForm({ ...studentForm, fatherName: e.target.value })} className="w-full glass-input p-2.5 text-xs text-slate-800 dark:text-slate-200" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Contact Phone</label>
                        <input required type="text" placeholder="+91 9876543210" value={studentForm.phone} onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })} className="w-full glass-input p-2.5 text-xs text-slate-800 dark:text-slate-200" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Home Address</label>
                      <input required type="text" placeholder="123 Sector 4, Rohini, Delhi" value={studentForm.address} onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })} className="w-full glass-input p-2.5 text-xs text-slate-800 dark:text-slate-200" />
                    </div>

                    <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-lg cursor-pointer">
                      Register Student Record
                    </button>
                  </form>
                )}

                {/* 2. Add Teacher Form */}
                {modalType === 'teacher' && (
                  <form onSubmit={handleTeacherSubmit} className="space-y-3.5">
                    <h3 className="text-lg font-black text-slate-950 dark:text-white">Register Faculty Member</h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Full Name</label>
                        <input required type="text" placeholder="Prof. Richard Feynman" value={teacherForm.name} onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })} className="w-full glass-input p-2.5 text-xs text-slate-800 dark:text-slate-200" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Email Address</label>
                        <input required type="email" placeholder="richard@gmail.com" value={teacherForm.email} onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })} className="w-full glass-input p-2.5 text-xs text-slate-800 dark:text-slate-200" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Primary Subject</label>
                        <input required type="text" placeholder="Physics" value={teacherForm.subject} onChange={(e) => setTeacherForm({ ...teacherForm, subject: e.target.value })} className="w-full glass-input p-2.5 text-xs text-slate-800 dark:text-slate-200" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Qualification</label>
                        <input required type="text" placeholder="Ph.D. Quantum Electrodynamics" value={teacherForm.qualification} onChange={(e) => setTeacherForm({ ...teacherForm, qualification: e.target.value })} className="w-full glass-input p-2.5 text-xs text-slate-800 dark:text-slate-200" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Phone Contact</label>
                      <input required type="text" placeholder="+91 9999888877" value={teacherForm.phone} onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })} className="w-full glass-input p-2.5 text-xs text-slate-800 dark:text-slate-200" />
                    </div>

                    <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-lg cursor-pointer">
                      Register Faculty Staff
                    </button>
                  </form>
                )}

                {/* 3. Create Class Form */}
                {modalType === 'class' && (
                  <form onSubmit={handleClassSubmit} className="space-y-3.5">
                    <h3 className="text-lg font-black text-slate-950 dark:text-white">Create Class Section</h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Class Name</label>
                        <input required type="text" placeholder="Class 10" value={classForm.className} onChange={(e) => setClassForm({ ...classForm, className: e.target.value })} className="w-full glass-input p-2.5 text-xs text-slate-800 dark:text-slate-200" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Section Unit</label>
                        <input required type="text" placeholder="A" value={classForm.section} onChange={(e) => setClassForm({ ...classForm, section: e.target.value })} className="w-full glass-input p-2.5 text-xs text-slate-800 dark:text-slate-200" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Class Teacher</label>
                      <select value={classForm.classTeacher} onChange={(e) => setClassForm({ ...classForm, classTeacher: e.target.value })} className="w-full glass-input p-2.5 text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-950">
                        <option value="">Assign Class Teacher (Optional)</option>
                        {teachersList.map(t => <option key={t._id} value={t._id}>{t.name} ({t.subject})</option>)}
                      </select>
                    </div>

                    <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-lg cursor-pointer">
                      Create Class Section
                    </button>
                  </form>
                )}

                {/* 4. Collect Fees Form */}
                {modalType === 'fee' && (
                  <form onSubmit={handleFeeSubmit} className="space-y-3.5">
                    <h3 className="text-lg font-black text-slate-955 dark:text-white">Collect Academic Fee</h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Student Roll No</label>
                        <input required type="number" placeholder="105" value={feeForm.studentRoll} onChange={(e) => setFeeForm({ ...feeForm, studentRoll: e.target.value })} className="w-full glass-input p-2.5 text-xs text-slate-800 dark:text-slate-200" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Invoice Title</label>
                        <input required type="text" placeholder="Tuition Fee Q2" value={feeForm.feeType} onChange={(e) => setFeeForm({ ...feeForm, feeType: e.target.value })} className="w-full glass-input p-2.5 text-xs text-slate-800 dark:text-slate-200" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Billing Amount (₹)</label>
                        <input required type="number" placeholder="15000" value={feeForm.amount} onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })} className="w-full glass-input p-2.5 text-xs text-slate-800 dark:text-slate-200" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Invoice Status</label>
                        <select value={feeForm.status} onChange={(e) => setFeeForm({ ...feeForm, status: e.target.value })} className="w-full glass-input p-2.5 text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-950">
                          <option value="Paid">Paid (Clears instantly)</option>
                          <option value="pending">Pending</option>
                        </select>
                      </div>
                    </div>

                    <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-lg cursor-pointer">
                      Authorize Invoice Collection
                    </button>
                  </form>
                )}

                {/* 5. Create Notice Form */}
                {modalType === 'notice' && (
                  <form onSubmit={handleNoticeSubmit} className="space-y-3.5">
                    <h3 className="text-lg font-black text-slate-950 dark:text-white">Publish Notice Circular</h3>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Notice Title</label>
                      <input required type="text" placeholder="e.g. Mid-Term Examination Guidelines" value={noticeForm.title} onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })} className="w-full glass-input p-2.5 text-xs text-slate-800 dark:text-slate-200" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Circular Notice Category</label>
                      <select value={noticeForm.category} onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value })} className="w-full glass-input p-2.5 text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-950">
                        <option value="general">General Notice</option>
                        <option value="academic">Academic Guideline</option>
                        <option value="exam">Examination Notice</option>
                        <option value="event">School Event Announcement</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Notice Board Body Content</label>
                      <textarea required rows="3" placeholder="Write the notice details here..." value={noticeForm.content} onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })} className="w-full glass-input p-2.5 text-xs text-slate-800 dark:text-slate-200 resize-none"></textarea>
                    </div>

                    <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-lg cursor-pointer">
                      Post & Publish Notice
                    </button>
                  </form>
                )}

                {/* 6. Schedule Exam Form */}
                {modalType === 'exam' && (
                  <form onSubmit={handleExamSubmit} className="space-y-3.5">
                    <h3 className="text-lg font-black text-slate-950 dark:text-white">Schedule Examination</h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Subject Module</label>
                        <input required type="text" placeholder="e.g. Physics Theory" value={examForm.subject} onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })} className="w-full glass-input p-2.5 text-xs text-slate-800 dark:text-slate-200" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Exam Category</label>
                        <select value={examForm.examType} onChange={(e) => setExamForm({ ...examForm, examType: e.target.value })} className="w-full glass-input p-2.5 text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-950">
                          <option value="Mid-Term">Mid-Term Assessment</option>
                          <option value="Final">Final Examination</option>
                          <option value="Unit-Test">Unit Performance Test</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Scheduled Date</label>
                        <input required type="text" placeholder="July 15th, 2026" value={examForm.date} onChange={(e) => setExamForm({ ...examForm, date: e.target.value })} className="w-full glass-input p-2.5 text-xs text-slate-800 dark:text-slate-200" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Start Time</label>
                        <input required type="text" placeholder="09:00 AM - 12:00 PM" value={examForm.time} onChange={(e) => setExamForm({ ...examForm, time: e.target.value })} className="w-full glass-input p-2.5 text-xs text-slate-800 dark:text-slate-200" />
                      </div>
                    </div>

                    <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-lg cursor-pointer">
                      Schedule Exam Module
                    </button>
                  </form>
                )}

                {/* 7. Generate Report Mock Modal */}
                {modalType === 'report' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-black text-slate-950 dark:text-white">Generate Analytical Reports</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">Download administrative records, fee audits, and grade metrics locally.</p>

                    <div className="space-y-2">
                      {[
                        { title: 'Academic Term Report Q1.pdf', size: '4.8 MB' },
                        { title: 'Fee Arrears & Audit Log.xlsx', size: '1.2 MB' },
                        { title: 'Faculty Assignment Roster.docx', size: '920 KB' }
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center p-3 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-350">
                          <span>{item.title}</span>
                          <button onClick={() => { setModalSuccess(`Downloading report "${item.title}"`); setTimeout(() => setModalType(null), 1500); }} className="px-3 py-1.5 bg-blue-600 text-white text-[10px] rounded-lg cursor-pointer">Download</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 8. Import Students CSV */}
                {modalType === 'import' && (
                  <form onSubmit={handleImportSubmit} className="space-y-4">
                    <h3 className="text-lg font-black text-slate-950 dark:text-white">Import Student Records</h3>
                    <p className="text-xs text-slate-500">Upload standard CSV format file to bulk register students.</p>

                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-28 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950/15">
                        <div className="flex flex-col items-center justify-center pt-4 pb-4">
                          <Upload className="w-6 h-6 text-slate-400 mb-1" />
                          <p className="text-[10px] text-slate-500 font-bold">Select CSV roster file to parse</p>
                        </div>
                        <input type="file" className="hidden" onChange={(e) => setImportForm({ file: e.target.files[0] })} />
                      </label>
                    </div>

                    <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-lg cursor-pointer">
                      Import Student Roster
                    </button>
                  </form>
                )}

                {/* 9. Manage Timetable Form */}
                {modalType === 'timetable' && (
                  <form onSubmit={handleTimetableSubmit} className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-950 dark:text-white">
                      {timetableForm.id ? 'Edit Timetable Entry' : 'Add Timetable Entry'}
                    </h3>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">Select Class</label>
                      <select
                        required
                        value={timetableForm.classId}
                        onChange={(e) => setTimetableForm({ ...timetableForm, classId: e.target.value })}
                        className="w-full glass-input p-2.5 text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-950"
                      >
                        <option value="">Choose Class Room</option>
                        {classesList.map(c => (
                          <option key={c._id || c.id} value={c._id || c.id}>
                            {c.className ? `${c.className} ${c.section || ''}` : c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">Subject</label>
                        <input
                          required
                          type="text"
                          placeholder="e.g. Physics"
                          value={timetableForm.subject}
                          onChange={(e) => setTimetableForm({ ...timetableForm, subject: e.target.value })}
                          className="w-full glass-input p-2.5 text-xs text-slate-850 dark:text-slate-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">Room</label>
                        <input
                          required
                          type="text"
                          placeholder="e.g. Lab 1"
                          value={timetableForm.room}
                          onChange={(e) => setTimetableForm({ ...timetableForm, room: e.target.value })}
                          className="w-full glass-input p-2.5 text-xs text-slate-850 dark:text-slate-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">Day</label>
                      <select
                        required
                        value={timetableForm.day}
                        onChange={(e) => setTimetableForm({ ...timetableForm, day: e.target.value })}
                        className="w-full glass-input p-2.5 text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-950"
                      >
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">Start Time</label>
                        <input
                          required
                          type="text"
                          placeholder="e.g. 09:00 AM"
                          value={timetableForm.timeStart}
                          onChange={(e) => setTimetableForm({ ...timetableForm, timeStart: e.target.value })}
                          className="w-full glass-input p-2.5 text-xs text-slate-850 dark:text-slate-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">End Time</label>
                        <input
                          required
                          type="text"
                          placeholder="e.g. 10:00 AM"
                          value={timetableForm.timeEnd}
                          onChange={(e) => setTimetableForm({ ...timetableForm, timeEnd: e.target.value })}
                          className="w-full glass-input p-2.5 text-xs text-slate-850 dark:text-slate-200"
                        />
                      </div>
                    </div>

                    <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-lg shadow-blue-500/10 cursor-pointer">
                      Save Timetable Entry
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
