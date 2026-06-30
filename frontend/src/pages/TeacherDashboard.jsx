import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  Calendar,
  FileText,
  CheckSquare,
  Bell,
  MessageSquare,
  Volume2,
  Clock,
  TrendingUp,
  Award,
  Upload,
  Plus,
  BookOpenCheck,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ArrowRight,
  GraduationCap,
  X,
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
  Bar
} from 'recharts';
import useAuth from '../hooks/useAuth';
import { studentService } from '../services/student.service';
import { classService } from '../services/class.service';
import { teacherService } from '../services/teacher.service';
import { attendanceService } from '../services/attendance.service';
import { assignmentService } from '../services/assignment.service';
import { marksService } from '../services/marks.service';
import { studyMaterialService } from '../services/studymaterial.service';
import { timetableService } from '../services/timetable.service';
import { noticeService } from '../services/notice.service';
import TeacherGeolocationAttendance from '../components/TeacherGeolocationAttendance';

const TeacherDashboard = () => {
  const { user } = useAuth();

  // State for loaded data
  const [stats, setStats] = useState({
    totalStudents: 154,
    myClasses: 4,
    todaysClasses: 3,
    pendingAssignments: 8,
    todayAttendance: '94.8%',
    announcementsCount: 5
  });
  const [teacherDetail, setTeacherDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [modalType, setModalType] = useState(null); // 'attendance' | 'assignment' | 'marks' | 'notes' | 'notice'
  const [modalSuccess, setModalSuccess] = useState('');

  // Quick Action form states
  const [attendanceForm, setAttendanceForm] = useState({ classId: '', studentId: '', status: 'Present' });
  const [assignmentForm, setAssignmentForm] = useState({ title: '', classId: '', dueDate: '' });
  const [marksForm, setMarksForm] = useState({ studentId: '', subject: '', marks: '', total: '100' });
  const [notesForm, setNotesForm] = useState({ title: '', classId: '', file: null });
  const [noticeForm, setNoticeForm] = useState({ title: '', content: '', category: 'general' });

  // Mock list items for rich dynamic display
  const [timetable, setTimetable] = useState([]);
  const [timetableForm, setTimetableForm] = useState({ id: '', classId: '', subject: '', day: 'Monday', timeStart: '', timeEnd: '', room: '' });

  const [classesList, setClassesList] = useState([
    { id: 1, name: 'Class 10-A', count: 42, subject: 'Mathematics' },
    { id: 2, name: 'Class 9-B', count: 38, subject: 'Mathematics' },
    { id: 3, name: 'Class 12-A', count: 35, subject: 'Advanced Calculus' },
    { id: 4, name: 'Class 11-A', count: 39, subject: 'Geometry' }
  ]);

  const [assignments, setAssignments] = useState([
    { id: 1, title: 'Calculus Exercise 4.2', class: 'Class 12-A', due: 'Today, 04:00 PM', submissions: '28/35' },
    { id: 2, title: 'Algebra Practice Sheet', class: 'Class 9-B', due: 'Tomorrow, 11:59 PM', submissions: '15/38' },
    { id: 3, title: 'Trigonometry Homework', class: 'Class 10-A', due: '29 Jun, 11:59 PM', submissions: '40/42' }
  ]);

  const [studentPerformanceData, setStudentPerformanceData] = useState([
    { name: 'Class 9-B', Average: 78, PassRate: 92 },
    { name: 'Class 10-A', Average: 84, PassRate: 95 },
    { name: 'Class 11-A', Average: 76, PassRate: 90 },
    { name: 'Class 12-A', Average: 89, PassRate: 97 }
  ]);

  const [announcements, setAnnouncements] = useState([
    { id: 1, title: 'Mid-Term Exam Dates Released', date: 'Today', author: 'Principal Office', desc: 'Examinations will commence from July 15th.' },
    { id: 2, title: 'Staff Meeting on Curriculum Adjustments', date: 'Yesterday', author: 'Vice Principal', desc: 'Meeting in Conference Hall at 2:00 PM on Friday.' },
    { id: 3, title: 'Science Fair Project Submissions Open', date: '25 Jun', author: 'Science Club Coordinator', desc: 'Encourage students to submit entries by next week.' }
  ]);

  // Load live data if available
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        // 1. Fetch current teacher profile details
        const teacherRes = await teacherService.getAll({ userId: user._id, limit: 1 }).catch(() => null);
        const match = teacherRes?.teachers?.[0];
        setTeacherDetail(match || null);

        // 2. Fetch live stats summaries where available
        const [studentRes, classRes, timetableRes] = await Promise.all([
          studentService.getAll({ limit: 1 }).catch(() => null),
          classService.getAll({ limit: 100 }).catch(() => null),
          timetableService.getAll({}).catch(() => null),
        ]);

        if (studentRes?.pagination?.totalStudents) {
          setStats(prev => ({
            ...prev,
            totalStudents: studentRes.pagination.totalStudents
          }));
        }

        if (classRes?.classes && classRes.classes.length > 0) {
          setClassesList(classRes.classes);
          setStats(prev => ({
            ...prev,
            myClasses: classRes.pagination?.totalClasses || classRes.classes.length
          }));
        }

        if (timetableRes) {
          const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
          const todaysTimetable = timetableRes.filter(t => t.day === today);
          setTimetable(todaysTimetable);
        }
      } catch (err) {
        console.error('Error in teacher dashboard loading:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Modal actions handlers
  const handleQuickAction = (type) => {
    setModalType(type);
    setModalSuccess('');
  };

  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    try {
      setModalSuccess('');
      // Find student by roll number
      const rollNum = Number(attendanceForm.studentId);
      if (isNaN(rollNum)) {
        alert("Please enter a valid numeric Roll Number");
        return;
      }

      // Find the matched class from teacher's list
      const matchedClass = (classesList || []).find(
        c => (c._id || c.id) === attendanceForm.classId
      );

      if (!matchedClass) {
        alert("Please select a valid classroom");
        return;
      }

      // Fetch students belonging strictly to the selected class section
      const stuRes = await studentService.getAll({ 
        class: matchedClass.className, 
        limit: 1000 
      });
      const matchedStudent = (stuRes?.students || []).find(
        s => Number(s.rollNumber) === rollNum
      );

      if (!matchedStudent) {
        alert(`No student found with Roll Number: ${rollNum} in Class ${matchedClass.className}`);
        return;
      }

      // Send local timezone-accurate date string to avoid midnight offsets
      const localDateStr = new Date().toLocaleDateString('en-CA');

      await attendanceService.create({
        student: matchedStudent._id,
        status: attendanceForm.status,
        date: localDateStr
      });

      setModalSuccess('Attendance logged successfully!');
      setTimeout(() => {
        setModalType(null);
        setAttendanceForm({ classId: '', studentId: '', status: 'Present' });
      }, 1500);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to submit attendance');
    }
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    if (!assignmentForm.title || !assignmentForm.classId) return;

    try {
      // Find class name for UI listing
      const classRes = await classService.getAll({ limit: 50 }).catch(() => null);
      const matchedClass = (classRes?.classes || []).find(c => c._id === assignmentForm.classId);

      await assignmentService.create({
        title: assignmentForm.title,
        classId: assignmentForm.classId,
        dueDate: assignmentForm.dueDate ? new Date(assignmentForm.dueDate) : new Date(Date.now() + 86400000 * 7),
      });

      // Add new assignment to local list
      setAssignments(prev => [
        {
          id: Date.now(),
          title: assignmentForm.title,
          class: matchedClass?.className ? `${matchedClass.className} ${matchedClass.section || ''}` : 'Class Unit',
          due: assignmentForm.dueDate || 'Next week',
          submissions: '0/' + (matchedClass?.studentsCount || '40')
        },
        ...prev
      ]);

      setModalSuccess('Assignment assigned successfully!');
      setTimeout(() => {
        setModalType(null);
        setAssignmentForm({ title: '', classId: '', dueDate: '' });
      }, 1500);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to assign homework');
    }
  };

  const handleMarksSubmit = async (e) => {
    e.preventDefault();
    try {
      const rollNum = Number(marksForm.studentId);
      if (isNaN(rollNum)) {
        alert("Please enter a valid numeric Roll Number");
        return;
      }

      const stuRes = await studentService.getAll({ limit: 100 });
      const matchedStudent = (stuRes?.students || []).find(s => Number(s.rollNumber) === rollNum);

      if (!matchedStudent) {
        alert("No student found with Roll Number: " + rollNum);
        return;
      }

      await marksService.create({
        student: matchedStudent._id,
        subject: marksForm.subject,
        marksObtained: Number(marksForm.marks),
        maxMarks: Number(marksForm.total),
        examType: 'Mid-Term'
      });

      setModalSuccess('Student marks logged successfully!');
      setTimeout(() => {
        setModalType(null);
        setMarksForm({ studentId: '', subject: '', marks: '', total: '100' });
      }, 1500);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to submit marks record');
    }
  };

  const handleNotesSubmit = async (e) => {
    e.preventDefault();
    try {
      await studyMaterialService.create({
        title: notesForm.title,
        subject: teacherDetail?.subject || 'Mathematics',
        classId: notesForm.classId,
        fileUrl: '/notes_document.pdf' // mock placeholder file url
      });

      setModalSuccess('Study material uploaded and shared!');
      setTimeout(() => {
        setModalType(null);
        setNotesForm({ title: '', classId: '', file: null });
      }, 1500);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to upload study notes');
    }
  };

  const handleNoticeSubmit = async (e) => {
    e.preventDefault();
    try {
      await noticeService.create({
        title: noticeForm.title,
        content: noticeForm.content,
        category: noticeForm.category,
        author: user.fullName || 'Teacher'
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
        // Trigger a re-fetch of timetable data by just reloading or calling fetch DashboardData if it was extracted,
        // but since fetchDashboardData is inside useEffect, we might need to reload or move it outside.
        // For now, window.location.reload() is a quick fix, but moving fetchDashboardData outside would be better.
        window.location.reload();
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
    <div className="space-y-6 text-left pb-12">

      {/* ── Header: Teacher Profile Card ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-32 w-32 bg-blue-500/5 rounded-full translate-x-10 -translate-y-10 blur-xl"></div>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Initials/Avatar */}
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-xl shadow-blue-500/20 flex items-center justify-center text-white text-3xl font-black shrink-0">
            {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
          </div>
          <div className="flex-1 text-center sm:text-left space-y-2.5">
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{user.fullName}</h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 capitalize">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {teacherDetail?.qualification || 'Senior Educator'}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{user.email}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1 text-xs">
              <div>
                <p className="font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Department</p>
                <p className="font-bold text-slate-850 dark:text-slate-200 mt-0.5">{teacherDetail?.subject || 'Mathematics'}</p>
              </div>
              <div>
                <p className="font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Assigned Classes</p>
                <p className="font-bold text-slate-850 dark:text-slate-200 mt-0.5">{stats.myClasses} Class Units</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Campus Status</p>
                <p className="font-bold text-emerald-600 dark:text-emerald-450 mt-0.5 flex items-center gap-1 justify-center sm:justify-start">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Class Hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Geolocation Attendance ── */}
      <TeacherGeolocationAttendance />

      {/* ── Quick Action Buttons ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Mark Attendance', icon: BookOpenCheck, color: 'hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 bg-amber-500/5', type: 'attendance', perm: 'markAttendance' },
          { label: 'Add Assignment', icon: Plus, color: 'hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 bg-blue-500/5', type: 'assignment', perm: 'createAssignment' },
          { label: 'Record Exam Marks', icon: Award, color: 'hover:border-violet-500 hover:text-violet-600 dark:hover:text-violet-400 bg-violet-500/5', type: 'marks', perm: 'logMarks' },
          { label: 'Upload Study Notes', icon: Upload, color: 'hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 bg-emerald-500/5', type: 'notes', perm: 'createAssignment' },
          { label: 'Publish Notice', icon: Volume2, color: 'hover:border-rose-500 hover:text-rose-655 dark:hover:text-rose-400 bg-rose-500/5', type: 'notice', perm: 'postNotice' },
          { label: 'Manage Timetable', icon: Calendar, color: 'hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-400 bg-sky-500/5', type: 'timetable', perm: 'createAssignment' }
        ].filter(act => {
          if (!teacherDetail?.permissions) return true;
          return teacherDetail.permissions[act.perm] !== false;
        }).map((act, i) => {
          const Icon = act.icon;
          return (
            <button
              key={i}
              onClick={() => handleQuickAction(act.type)}
              className={`flex flex-col sm:flex-row items-center gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm transition-all text-sm font-bold text-slate-700 dark:text-slate-300 hover:scale-[1.01] hover:shadow-md cursor-pointer ${act.color}`}
            >
              <div className="p-2 rounded-xl bg-white dark:bg-slate-950 shadow-sm shrink-0">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-center sm:text-left">{act.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Summary Cards Grid ── */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-6">
        {[
          { title: 'Total Students', value: stats.totalStudents, icon: Users, color: 'bg-blue-500/10 text-blue-600' },
          { title: 'My Classes', value: stats.myClasses, icon: BookOpen, color: 'bg-violet-500/10 text-violet-600' },
          { title: "Today's Classes", value: stats.todaysClasses, icon: Clock, color: 'bg-amber-500/10 text-amber-600' },
          { title: 'Pending Tasks', value: stats.pendingAssignments, icon: FileText, color: 'bg-rose-500/10 text-rose-600' },
          { title: 'Attendance Rate', value: stats.todayAttendance, icon: CheckSquare, color: 'bg-emerald-500/10 text-emerald-600' },
          { title: 'Announcements', value: stats.announcementsCount, icon: Volume2, color: 'bg-teal-500/10 text-teal-600' }
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 truncate">{card.title}</span>
                <div className={`p-1.5 rounded-lg ${card.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-800 dark:text-white leading-none">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* ── Workspace widgets grid ── */}
      <div className="grid gap-6 lg:grid-cols-12">

        {/* ── LEFT COLUMN ── */}
        <div className="lg:col-span-8 space-y-6">

          {/* Today's Timetable */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Today's Timetable</h3>
                <p className="text-xs text-slate-450 dark:text-slate-550 mt-0.5">Your schedule for classes today</p>
              </div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-full">
                Live Hours
              </span>
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

          {/* Student Performance charts */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Class Academic Performance</h3>
                <p className="text-xs text-slate-450 dark:text-slate-550 mt-0.5">Comparing class average marks & pass rate</p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }} />
                  <Bar dataKey="Average" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Average Score %" />
                  <Bar dataKey="PassRate" fill="#10b981" radius={[4, 4, 0, 0]} name="Pass Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Announcements */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Announcements</h3>
                <p className="text-xs text-slate-450 dark:text-slate-550 mt-0.5">Circulars and notices from the school administration</p>
              </div>
            </div>

            <div className="space-y-4">
              {announcements.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/30 dark:hover:bg-slate-950/10 transition-all space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400">
                      {item.date}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">{item.author}</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-800 dark:text-white">{item.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="lg:col-span-4 space-y-6">

          {/* Timetable / Calendar Grid Widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Academic Calendar</h3>
              <Calendar className="h-4.5 w-4.5 text-blue-500" />
            </div>

            {/* Minimal calendar mockup */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => <div key={i} className="py-1">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-700 dark:text-slate-350">
              {Array.from({ length: 30 }, (_, i) => {
                const day = i + 1;
                const isToday = day === 28;
                return (
                  <div
                    key={i}
                    className={`py-1.5 rounded-lg flex items-center justify-center ${isToday
                        ? 'bg-blue-600 text-white font-black shadow-md shadow-blue-500/20'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-850'
                      }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>

          {/* My Classes */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">My Classes</h3>
              <Link to="/dashboard/classes" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Manage</Link>
            </div>

            <div className="space-y-2.5">
              {classesList.map((cls) => (
                <div key={cls._id || cls.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/80">
                  <div>
                    <p className="text-xs font-black text-slate-800 dark:text-white">
                      {cls.className ? `${cls.className} ${cls.section || ''}` : cls.name}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">{cls.subject || 'General'}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                    {cls.count} Students
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Assignments list */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Assignments</h3>
              <span className="text-[10px] font-bold bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full">Due Soon</span>
            </div>

            <div className="space-y-3">
              {assignments.map((asg) => (
                <div key={asg.id} className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-250 truncate">{asg.title}</p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 font-bold">{asg.submissions}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                    <span>{asg.class}</span>
                    <span className="text-rose-500 font-semibold">{asg.due}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ── MODALS (Quick Actions Form Renderings) ── */}
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
                <h4 className="text-lg font-black text-slate-900 dark:text-white">Action Completed!</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">{modalSuccess}</p>
              </div>
            ) : (
              <>
                {/* 1. Mark Attendance Form */}
                {modalType === 'attendance' && (
                  <form onSubmit={handleAttendanceSubmit} className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-950 dark:text-white">Mark Quick Attendance</h3>
                    <p className="text-xs text-slate-400">Record a student attendance entry instantly.</p>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">Select Class</label>
                      <select
                        required
                        value={attendanceForm.classId}
                        onChange={(e) => setAttendanceForm({ ...attendanceForm, classId: e.target.value })}
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

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">Student Roll No / Name</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Roll 101 or Alice Johnson"
                        value={attendanceForm.studentId}
                        onChange={(e) => setAttendanceForm({ ...attendanceForm, studentId: e.target.value })}
                        className="w-full glass-input p-2.5 text-xs text-slate-850 dark:text-slate-200"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">Status</label>
                      <div className="flex gap-2">
                        {['Present', 'Absent', 'Holiday'].map(st => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setAttendanceForm({ ...attendanceForm, status: st })}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${attendanceForm.status === st
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850'
                              }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-lg shadow-blue-500/10 cursor-pointer">
                      Submit Attendance Entry
                    </button>
                  </form>
                )}

                {/* 2. Add Assignment Form */}
                {modalType === 'assignment' && (
                  <form onSubmit={handleAssignmentSubmit} className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-950 dark:text-white">Create Classroom Assignment</h3>
                    <p className="text-xs text-slate-400">Post a new assignment unit to your class.</p>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">Assignment Title</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Calculus Section 4.2 Problems"
                        value={assignmentForm.title}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                        className="w-full glass-input p-2.5 text-xs text-slate-850 dark:text-slate-200"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">Target Class</label>
                      <select
                        required
                        value={assignmentForm.classId}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, classId: e.target.value })}
                        className="w-full glass-input p-2.5 text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-950"
                      >
                        <option value="">Select Class Section</option>
                        {classesList.map(c => (
                          <option key={c._id || c.id} value={c._id || c.id}>
                            {c.className ? `${c.className} ${c.section || ''}` : c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">Due Date & Time</label>
                      <input
                        required
                        type="datetime-local"
                        value={assignmentForm.dueDate}
                        onClick={(e) => e.target.showPicker && e.target.showPicker()}
                        onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                        className="w-full glass-input p-2.5 text-xs text-slate-850 dark:text-slate-200 cursor-pointer"
                      />
                    </div>

                    <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-lg shadow-blue-500/10 cursor-pointer">
                      Publish & Assign Task
                    </button>
                  </form>
                )}

                {/* 3. Record Exam Marks Form */}
                {modalType === 'marks' && (
                  <form onSubmit={handleMarksSubmit} className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-950 dark:text-white">Record Assessment Score</h3>
                    <p className="text-xs text-slate-400">Log score ratings directly into student performance card.</p>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">Student Roll No</label>
                        <input
                          required
                          type="text"
                          placeholder="e.g. 102"
                          value={marksForm.studentId}
                          onChange={(e) => setMarksForm({ ...marksForm, studentId: e.target.value })}
                          className="w-full glass-input p-2.5 text-xs text-slate-850 dark:text-slate-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">Subject Module</label>
                        <input
                          required
                          type="text"
                          placeholder="e.g. Math Paper 1"
                          value={marksForm.subject}
                          onChange={(e) => setMarksForm({ ...marksForm, subject: e.target.value })}
                          className="w-full glass-input p-2.5 text-xs text-slate-850 dark:text-slate-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">Obtained Marks</label>
                        <input
                          required
                          type="number"
                          placeholder="85"
                          value={marksForm.marks}
                          onChange={(e) => setMarksForm({ ...marksForm, marks: e.target.value })}
                          className="w-full glass-input p-2.5 text-xs text-slate-850 dark:text-slate-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">Max Points</label>
                        <input
                          required
                          type="number"
                          placeholder="100"
                          value={marksForm.total}
                          onChange={(e) => setMarksForm({ ...marksForm, total: e.target.value })}
                          className="w-full glass-input p-2.5 text-xs text-slate-850 dark:text-slate-200"
                        />
                      </div>
                    </div>

                    <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-lg shadow-blue-500/10 cursor-pointer">
                      Log Exam Assessment Score
                    </button>
                  </form>
                )}

                {/* 4. Upload Study Notes Form */}
                {modalType === 'notes' && (
                  <form onSubmit={handleNotesSubmit} className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-950 dark:text-white">Upload Study Materials</h3>
                    <p className="text-xs text-slate-400">Share lecture files, worksheets, or guidelines.</p>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">Material Title</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Calculus Lecture Handout PDF"
                        value={notesForm.title}
                        onChange={(e) => setNotesForm({ ...notesForm, title: e.target.value })}
                        className="w-full glass-input p-2.5 text-xs text-slate-850 dark:text-slate-200"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">Share With Class</label>
                      <select
                        required
                        value={notesForm.classId}
                        onChange={(e) => setNotesForm({ ...notesForm, classId: e.target.value })}
                        className="w-full glass-input p-2.5 text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-950"
                      >
                        <option value="">Select Target Class Section</option>
                        {classesList.map(c => (
                          <option key={c._id || c.id} value={c._id || c.id}>
                            {c.className ? `${c.className} ${c.section || ''}` : c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">Select Document File</label>
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-slate-250 dark:border-slate-800 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950/20 transition-all">
                          <div className="flex flex-col items-center justify-center pt-3 pb-3">
                            <Upload className="w-5 h-5 text-slate-400 mb-1" />
                            <p className="text-[10px] text-slate-500 dark:text-slate-450 font-bold">PDF, DOCX, ZIP, or PNG up to 10MB</p>
                          </div>
                          <input type="file" className="hidden" onChange={(e) => setNotesForm({ ...notesForm, file: e.target.files[0] })} />
                        </label>
                      </div>
                    </div>

                    <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-lg shadow-blue-500/10 cursor-pointer">
                      Upload and Publish Document
                    </button>
                  </form>
                )}

                {/* 5. Publish Notice Form */}
                {modalType === 'notice' && (
                  <form onSubmit={handleNoticeSubmit} className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-950 dark:text-white">Publish Notice Circular</h3>
                    <p className="text-xs text-slate-400">Post a new circular announcement on student active boards.</p>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">Notice Title</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Science Project Submission Dates"
                        value={noticeForm.title}
                        onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                        className="w-full glass-input p-2.5 text-xs text-slate-850 dark:text-slate-200"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">Circular Notice Category</label>
                      <select
                        value={noticeForm.category}
                        onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value })}
                        className="w-full glass-input p-2.5 text-xs text-slate-850 dark:text-slate-200 bg-white dark:bg-slate-950"
                      >
                        <option value="general">General Notice</option>
                        <option value="exam">Academic Exam</option>
                        <option value="event">School Event Announcement</option>
                        <option value="holiday">Holiday Notice</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">Notice Content Details</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Describe announcement guidelines..."
                        value={noticeForm.content}
                        onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                        className="w-full glass-input p-2.5 text-xs text-slate-850 dark:text-slate-200"
                      />
                    </div>

                    <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-lg shadow-blue-500/10 cursor-pointer">
                      Publish Notice Circular
                    </button>
                  </form>
                )}

                {/* 6. Add/Edit Timetable Form */}
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

export default TeacherDashboard;
