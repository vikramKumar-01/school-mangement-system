import React, { useEffect, useState } from 'react';
import { marksService } from '../services/marks.service';
import { studentService } from '../services/student.service';
import { classService } from '../services/class.service';
import { teacherService } from '../services/teacher.service';
import useAuth from '../hooks/useAuth';
import { Award, Plus, Calendar, AlertCircle, Check, Search, Trash2, Filter, TrendingUp, BookOpen, Clock, Lock } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const AcademicProgress = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';
  const isStudentOrParent = ['student', 'parent'].includes(user?.role);

  // States
  const [marks, setMarks] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form States for Teacher/Admin
  const [form, setForm] = useState({
    classId: '',
    studentId: '',
    subject: '',
    marksObtained: '',
    maxMarks: '100',
    examType: 'Mid-Term'
  });

  // Teacher specific permissions
  const [teacherPermissions, setTeacherPermissions] = useState(null);

  useEffect(() => {
    const fetchTeacherPerms = async () => {
      if (isTeacher) {
        const res = await teacherService.getAll({ userId: user._id, limit: 1 }).catch(() => null);
        const match = res?.teachers?.[0];
        setTeacherPermissions(match?.permissions || null);
      }
    };
    fetchTeacherPerms();
  }, [user, isTeacher]);

  const canLogMarks = isAdmin || (isTeacher && teacherPermissions?.logMarks !== false);
  const canView = !isTeacher || (teacherPermissions?.academicProgress !== false);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (isStudentOrParent) {
        // Fetch student's marks directly
        const res = await marksService.getAll();
        setMarks(res || []);
      } else {
        // Fetch all marks + class list for selectors
        const [marksRes, classRes] = await Promise.all([
          marksService.getAll(),
          classService.getAll({ limit: 100 })
        ]);
        setMarks(marksRes || []);
        setClasses(classRes?.classes || []);
      }
    } catch (err) {
      setError('Failed to load assessment data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [user]);

  // Load students when target class is selected
  useEffect(() => {
    const fetchStudentsForClass = async () => {
      if (!form.classId) {
        setStudents([]);
        return;
      }
      try {
        const selectedClassObj = classes.find(c => c._id === form.classId);
        if (selectedClassObj) {
          const res = await studentService.getAll({ class: selectedClassObj.className, limit: 200 });
          setStudents(res?.students || []);
        }
      } catch (err) {
        console.error('Failed to load class students', err);
      }
    };
    fetchStudentsForClass();
  }, [form.classId, classes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canLogMarks) {
      alert("Access Denied: You do not have permissions to record assessment scores.");
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const marksVal = Number(form.marksObtained);
      const maxVal = Number(form.maxMarks);

      if (isNaN(marksVal) || isNaN(maxVal) || marksVal < 0 || maxVal <= 0) {
        setError('Marks must be positive numbers');
        return;
      }

      if (marksVal > maxVal) {
        setError('Obtained marks cannot exceed maximum possible marks');
        return;
      }

      await marksService.create({
        student: form.studentId,
        subject: form.subject,
        marksObtained: marksVal,
        maxMarks: maxVal,
        examType: form.examType
      });

      setSuccess('Student assessment score logged successfully!');
      setForm(prev => ({
        ...prev,
        marksObtained: '',
        studentId: ''
      }));

      // Reload marks listing
      const updatedMarks = await marksService.getAll();
      setMarks(updatedMarks || []);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit score details');
    } finally {
      setSubmitting(false);
    }
  };

  // Student analytics calculations
  const calculateAnalytics = () => {
    if (marks.length === 0) return { avg: 0, highest: 0, lowest: 0, count: 0, chartData: [] };

    let totalObtained = 0;
    let totalMax = 0;
    let highestPct = 0;
    let lowestPct = 100;

    const chartData = [...marks]
      .reverse() // Sort chronologically for chart flow
      .map((m, index) => {
        const pct = Math.round((m.marksObtained / m.maxMarks) * 100);
        totalObtained += m.marksObtained;
        totalMax += m.maxMarks;
        highestPct = Math.max(highestPct, pct);
        lowestPct = Math.min(lowestPct, pct);

        return {
          name: m.subject,
          Percentage: pct,
          Score: `${m.marksObtained}/${m.maxMarks}`
        };
      });

    return {
      avg: Math.round((totalObtained / totalMax) * 100),
      highest: highestPct,
      lowest: lowestPct,
      count: marks.length,
      chartData
    };
  };

  const stats = calculateAnalytics();

  if (!loading && !canView) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800">
        <div className="mx-auto h-12 w-12 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Access Denied</h3>
        <p className="text-slate-400 text-sm">You do not have permission to access Academic Progress details.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Award className="h-8 w-8 text-sky-400" /> Academic Performance & Progress
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {isStudentOrParent 
            ? 'Track your test scores, performance percentages, and grade progress reports.' 
            : 'Record, list, and monitor student academic performance grades.'}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-450">
          <Check className="h-5 w-5 shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-sky-500"></div>
        </div>
      ) : isStudentOrParent ? (
        /* ── STUDENT & PARENT VIEW ── */
        <div className="grid gap-6">
          {/* Summary Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Cumulative Average', value: `${stats.avg}%`, desc: 'Overall score average', color: 'text-sky-400' },
              { label: 'Highest Percentage', value: `${stats.highest}%`, desc: 'Top test score recorded', color: 'text-emerald-400' },
              { label: 'Lowest Percentage', value: `${stats.lowest}%`, desc: 'Lowest test score recorded', color: 'text-rose-400' },
              { label: 'Exams Taken', value: stats.count, desc: 'Total graded assessments', color: 'text-violet-400' }
            ].map((card, i) => (
              <div key={i} className="glass-panel p-5 rounded-2xl border border-slate-805 space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">{card.label}</p>
                <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
                <p className="text-[10px] text-slate-450 mt-0.5">{card.desc}</p>
              </div>
            ))}
          </div>

          {/* Performance chart */}
          {stats.chartData.length > 0 && (
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-sky-400" /> Academic Progress Graph
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.chartData}>
                    <defs>
                      <linearGradient id="pctGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                      labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="Percentage" stroke="#38bdf8" strokeWidth={2.5} fillOpacity={1} fill="url(#pctGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Marks History Table */}
          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-850">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-sky-400" /> Graded Reports History
              </h3>
            </div>
            
            {marks.length === 0 ? (
              <div className="p-12 text-center text-slate-450">No academic reports found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-850 bg-slate-900/40 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <th className="px-6 py-4">Subject</th>
                      <th className="px-6 py-4 text-center">Score</th>
                      <th className="px-6 py-4 text-center">Percentage</th>
                      <th className="px-6 py-4 text-center">Exam Type</th>
                      <th className="px-6 py-4 text-right">Published Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-sm">
                    {marks.map((m) => {
                      const pct = Math.round((m.marksObtained / m.maxMarks) * 100);
                      return (
                        <tr key={m._id} className="hover:bg-slate-900/10 transition-colors">
                          <td className="px-6 py-4 font-bold text-white">{m.subject}</td>
                          <td className="px-6 py-4 text-center font-mono font-bold text-slate-300">
                            {m.marksObtained} <span className="text-slate-500 font-normal">/ {m.maxMarks}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                              pct >= 85 ? 'bg-emerald-500/10 text-emerald-400' :
                              pct >= 50 ? 'bg-sky-500/10 text-sky-400' : 'bg-red-500/10 text-red-400'
                            }`}>
                              {pct}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider">{m.examType}</span>
                          </td>
                          <td className="px-6 py-4 text-right text-xs text-slate-450">
                            {new Date(m.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── TEACHER & ADMIN VIEW ── */
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Add Marks Form Panel */}
          <div className="lg:col-span-1">
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-sky-400" /> Record Assessment Score
              </h3>

              {!canLogMarks ? (
                <div className="rounded-2xl bg-red-500/5 border border-red-500/10 p-5 space-y-4 text-center">
                  <div className="mx-auto h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">Record Marks Locked</p>
                    <p className="text-xs text-slate-450 leading-relaxed">
                      Your administrator has currently disabled the Log Exam Marks permission for your teacher account profile.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Select Class */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">Choose Classroom</label>
                    <select
                      required
                      value={form.classId}
                      onChange={(e) => setForm({ ...form, classId: e.target.value })}
                      className="w-full glass-input p-2.5 text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-950"
                    >
                      <option value="">Select Target Class</option>
                      {classes.map(c => (
                        <option key={c._id} value={c._id}>{c.className} {c.section ? `(${c.section})` : ''}</option>
                      ))}
                    </select>
                  </div>

                  {/* Select Student */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">Choose Student</label>
                    <select
                      required
                      disabled={!form.classId}
                      value={form.studentId}
                      onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                      className="w-full glass-input p-2.5 text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-950"
                    >
                      <option value="">{form.classId ? 'Select Student Profile' : 'Choose Class first'}</option>
                      {students.map(s => (
                        <option key={s._id} value={s._id}>{s.name} (Roll: {s.rollNumber})</option>
                      ))}
                    </select>
                  </div>

                  {/* Subject Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">Subject Module</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Calculus Final Exam"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full glass-input p-2.5 text-xs text-slate-800 dark:text-slate-205"
                    />
                  </div>

                  {/* Obtained Marks */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">Obtained Score</label>
                      <input
                        required
                        type="number"
                        placeholder="85"
                        value={form.marksObtained}
                        onChange={(e) => setForm({ ...form, marksObtained: e.target.value })}
                        className="w-full glass-input p-2.5 text-xs text-slate-800 dark:text-slate-205"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">Max Possible Score</label>
                      <input
                        required
                        type="number"
                        placeholder="100"
                        value={form.maxMarks}
                        onChange={(e) => setForm({ ...form, maxMarks: e.target.value })}
                        className="w-full glass-input p-2.5 text-xs text-slate-800 dark:text-slate-205"
                      />
                    </div>
                  </div>

                  {/* Exam Type */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">Assessment Type</label>
                    <select
                      value={form.examType}
                      onChange={(e) => setForm({ ...form, examType: e.target.value })}
                      className="w-full glass-input p-2.5 text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-950"
                    >
                      <option value="Mid-Term">Mid-Term Exam</option>
                      <option value="Final">Final Examination</option>
                      <option value="Quiz">Class Quiz Assessment</option>
                      <option value="Monthly">Monthly Test</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 rounded-xl bg-blue-650 hover:bg-blue-700 text-xs font-bold text-white shadow-lg shadow-blue-500/10 cursor-pointer disabled:opacity-50 transition-all active:scale-[0.98] min-h-[44px]"
                  >
                    {submitting ? 'Recording Graded Score...' : 'Record Student Score'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Graded Marks Listings Grid */}
          <div className="lg:col-span-2">
            <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
              <div className="p-5 border-b border-slate-850">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-sky-400" /> Graded Reports History
                </h3>
              </div>

              {marks.length === 0 ? (
                <div className="p-12 text-center text-slate-450">No graded scores have been published yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-850 bg-slate-900/40 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        <th className="px-6 py-4">Student Profile</th>
                        <th className="px-6 py-4">Subject / Exam</th>
                        <th className="px-6 py-4 text-center">Score</th>
                        <th className="px-6 py-4 text-center">Percentage</th>
                        <th className="px-6 py-4 text-right">Published Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 text-sm">
                      {marks.map((m) => {
                        const pct = Math.round((m.marksObtained / m.maxMarks) * 100);
                        return (
                          <tr key={m._id} className="hover:bg-slate-900/10 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-bold text-white leading-tight">{m.student?.name || 'Graded Student'}</p>
                              <p className="text-xs text-slate-500 font-mono mt-0.5">
                                Class {m.student?.class || '—'} {m.student?.rollNumber ? `| Roll: ${m.student.rollNumber}` : ''}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-semibold text-slate-300 leading-tight">{m.subject}</p>
                              <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">{m.examType}</p>
                            </td>
                            <td className="px-6 py-4 text-center font-mono font-bold text-slate-350">
                              {m.marksObtained} <span className="text-slate-500 font-normal">/ {m.maxMarks}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                                pct >= 85 ? 'bg-emerald-500/10 text-emerald-450' :
                                pct >= 50 ? 'bg-sky-500/10 text-sky-400' : 'bg-red-500/10 text-red-405'
                              }`}>
                                {pct}%
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right text-xs text-slate-450">
                              {new Date(m.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicProgress;
