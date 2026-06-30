import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { attendanceService } from '../services/attendance.service';
import { studentService } from '../services/student.service';
import { attendanceSchema } from '../validations/attendance.validation';
import useAuth from '../hooks/useAuth';
import { Plus, Edit2, Trash2, Calendar, Search, X, AlertCircle, CheckCircle, XCircle, AlertOctagon } from 'lucide-react';

const AttendanceList = () => {
  const { user } = useAuth();
  const canModify = ['admin', 'teacher'].includes(user?.role);

  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Date and Status Filters
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Stats summaries
  const [summary, setSummary] = useState({ present: 0, absent: 0, holiday: 0 });

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await attendanceService.getAll({
        date: selectedDate || undefined,
        status: statusFilter || undefined,
        page,
        limit: 10
      });
      setRecords(res.attendance);
      setTotalPages(res.pagination.totalPages);
      setTotalRecords(res.pagination.totalAttendance);

      // Compute simple dashboard summary from the current batch/total
      let present = 0, absent = 0, holiday = 0;
      res.attendance.forEach(rec => {
        if (rec.status === 'Present') present++;
        else if (rec.status === 'Absent') absent++;
        else if (rec.status === 'Holiday') holiday++;
      });
      setSummary({ present, absent, holiday });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsList = async () => {
    try {
      const res = await studentService.getAll({ limit: 1000 });
      setStudents(res.students);
    } catch (err) {
      console.error('Failed to load students for attendance marking:', err);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate, statusFilter, page]);

  useEffect(() => {
    if (canModify) {
      fetchStudentsList();
    }
  }, [canModify]);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this attendance entry?')) {
      try {
        await attendanceService.delete(id);
        setSuccessMsg('Attendance record deleted');
        fetchAttendance();
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to delete attendance record');
      }
    }
  };

  const openAddModal = () => {
    setEditingRecord(null);
    formik.resetForm();
    setModalOpen(true);
  };

  const openEditModal = (rec) => {
    setEditingRecord(rec);
    formik.setValues({
      student: rec.student?._id || '',
      date: rec.date ? rec.date.split('T')[0] : new Date().toISOString().split('T')[0],
      status: rec.status || 'Present',
    });
    setModalOpen(false);
    setTimeout(() => setModalOpen(true), 50);
  };

  const formik = useFormik({
    initialValues: {
      student: '',
      date: new Date().toLocaleDateString('en-CA'),
      status: 'Present',
    },
    validationSchema: attendanceSchema,
    onSubmit: async (values) => {
      setError('');
      try {
        const payload = {
          ...values,
          date: new Date(values.date).toISOString()
        };

        if (editingRecord) {
          await attendanceService.update(editingRecord._id, payload);
          setSuccessMsg('Attendance record updated');
        } else {
          await attendanceService.create(payload);
          setSuccessMsg('Attendance logged successfully');
        }

        setModalOpen(false);
        fetchAttendance();
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to save attendance');
      }
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Attendance</h1>
          <p className="mt-1 text-sm text-slate-400">Track student presence, absences, and holidays.</p>
        </div>
        {canModify && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition-all active:scale-95 shadow-md shadow-sky-500/10 min-h-[44px]"
          >
            <Plus className="h-5 w-5" />
            Mark Attendance
          </button>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400">
          <AlertCircle className="h-5 w-5 shrink-0" stroke="currentColor" />
          <p>{successMsg}</p>
        </div>
      )}

      {/* Quick Status Cards for Selected Date */}
      <div className="grid gap-4 grid-cols-3">
        <div className="glass-panel rounded-2xl p-4 text-center">
          <span className="text-xs text-slate-450 uppercase font-bold tracking-wide">Present</span>
          <h4 className="text-xl sm:text-2xl font-extrabold text-emerald-400 mt-1">{summary.present}</h4>
        </div>
        <div className="glass-panel rounded-2xl p-4 text-center">
          <span className="text-xs text-slate-450 uppercase font-bold tracking-wide">Absent</span>
          <h4 className="text-xl sm:text-2xl font-extrabold text-red-400 mt-1">{summary.absent}</h4>
        </div>
        <div className="glass-panel rounded-2xl p-4 text-center">
          <span className="text-xs text-slate-450 uppercase font-bold tracking-wide">Holiday</span>
          <h4 className="text-xl sm:text-2xl font-extrabold text-amber-400 mt-1">{summary.holiday}</h4>
        </div>
      </div>

      {/* Filters (Date Select + Status) */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-xl">
          {/* Date Selector */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Calendar className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="date"
              className="w-full pl-10 glass-input py-2 text-sm"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Status filter */}
          <select
            className="glass-input py-2 px-4 sm:w-48 text-sm"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="" className="bg-slate-900 text-slate-400">All Statuses</option>
            <option value="Present" className="bg-slate-900 text-white">Present</option>
            <option value="Absent" className="bg-slate-900 text-white">Absent</option>
            <option value="Holiday" className="bg-slate-900 text-white">Holiday</option>
          </select>
        </div>

        <div className="text-sm text-slate-400 font-medium">
          Total Logs: <span className="text-white font-bold">{totalRecords}</span>
        </div>
      </div>

      {/* Data Views */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-sky-500"></div>
        </div>
      ) : records.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <p className="text-slate-450">No attendance records logged for this filter.</p>
        </div>
      ) : (
        <>
          {/* Mobile view (< 768px) */}
          <div className="grid gap-4 sm:grid-cols-2 md:hidden">
            {records.map((rec) => (
              <div key={rec._id} className="glass-card p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {rec.student?.name || <span className="text-slate-550 italic">Unknown Student</span>}
                    </h3>
                    <p className="text-xs text-slate-450 mt-0.5">Roll: {rec.student?.rollNumber || '—'}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                    rec.status === 'Present' 
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : rec.status === 'Absent'
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {rec.status === 'Present' && <CheckCircle className="h-3.5 w-3.5" />}
                    {rec.status === 'Absent' && <XCircle className="h-3.5 w-3.5" />}
                    {rec.status === 'Holiday' && <AlertOctagon className="h-3.5 w-3.5" />}
                    {rec.status}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-slate-850 pt-3 text-xs text-slate-450">
                  <span>Log Date:</span>
                  <span>{new Date(rec.date).toLocaleDateString()}</span>
                </div>

                {canModify && (
                  <div className="flex gap-2 border-t border-slate-850 pt-3">
                    <button
                      onClick={() => openEditModal(rec)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 border border-slate-800 hover:bg-slate-800 text-sky-400 text-xs font-bold py-2 rounded-lg transition-all min-h-[36px]"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(rec._id)}
                      className="inline-flex items-center justify-center border border-slate-800 hover:bg-red-500/10 text-red-400 p-2 rounded-lg transition-all min-h-[36px]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Table View (>= 768px) */}
          <div className="hidden md:block glass-panel rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/40 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Class</th>
                    <th className="px-6 py-4">Roll</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    {canModify && <th className="px-6 py-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {records.map((rec) => (
                    <tr key={rec._id} className="hover:bg-slate-900/20 transition-all">
                      <td className="px-6 py-4 font-semibold text-white">
                        {rec.student?.name || <span className="text-slate-550 italic">Unknown Student</span>}
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-mono text-xs capitalize">
                        {rec.student?.class || '—'}
                      </td>
                      <td className="px-6 py-4 text-slate-350">{rec.student?.rollNumber || '—'}</td>
                      <td className="px-6 py-4 text-slate-350">{new Date(rec.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                          rec.status === 'Present' 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : rec.status === 'Absent'
                            ? 'bg-red-500/10 text-red-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                      {canModify && (
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex gap-1.5">
                            <button
                              onClick={() => openEditModal(rec)}
                              className="rounded-lg p-2 text-sky-400 hover:bg-sky-500/10 hover:text-sky-350 transition-colors min-h-[40px] min-w-[40px]"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(rec._id)}
                              className="rounded-lg p-2 text-red-400 hover:bg-red-500/10 hover:text-red-350 transition-colors min-h-[40px] min-w-[40px]"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-800 px-6 py-4">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  className="rounded-lg border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-900/50 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                >
                  Previous
                </button>
                <span className="text-xs text-slate-450">
                  Page <span className="text-white font-semibold">{page}</span> of{' '}
                  <span className="text-white font-semibold">{totalPages}</span>
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  className="rounded-lg border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-900/50 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Pagination Controls on Mobile Card View */}
          {totalPages > 1 && (
            <div className="flex md:hidden items-center justify-between px-2 pt-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                className="rounded-lg border border-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:bg-slate-900 disabled:opacity-30 transition-all"
              >
                Prev
              </button>
              <span className="text-xs text-slate-400">
                Page <span className="text-white font-bold">{page}</span> of <span className="text-white">{totalPages}</span>
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                className="rounded-lg border border-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:bg-slate-900 disabled:opacity-30 transition-all"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Mark Attendance Modal Drawer */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="relative w-full max-w-md rounded-t-3xl sm:rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-lg font-bold text-white">
                {editingRecord ? 'Edit Attendance Status' : 'Mark Attendance Log'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-4">
              {/* Student Selection */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-slate-350" htmlFor="student">
                  Select Student *
                </label>
                <select
                  id="student"
                  name="student"
                  disabled={!!editingRecord}
                  className={`w-full glass-input py-2.5 disabled:opacity-50 ${
                    formik.touched.student && formik.errors.student ? 'border-red-500/50' : ''
                  }`}
                  value={formik.values.student}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="" className="bg-slate-900 text-slate-400">Choose Student</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id} className="bg-slate-900 text-white">
                      {s.name} (Roll: {s.rollNumber}, Class: {s.class})
                    </option>
                  ))}
                </select>
                {formik.touched.student && formik.errors.student && (
                  <p className="text-xs text-red-400 mt-1">{formik.errors.student}</p>
                )}
              </div>

              {/* Date */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-slate-350" htmlFor="date">
                  Attendance Date *
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  className={`w-full glass-input py-2.5 ${
                    formik.touched.date && formik.errors.date ? 'border-red-550/50' : ''
                  }`}
                  value={formik.values.date}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.date && formik.errors.date && (
                  <p className="text-xs text-red-400 mt-1">{formik.errors.date}</p>
                )}
              </div>

              {/* Status Selector */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-slate-350" htmlFor="status">
                  Attendance Status *
                </label>
                <select
                  id="status"
                  name="status"
                  className="w-full glass-input py-2.5"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                >
                  <option value="Present" className="bg-slate-900 text-white">Present</option>
                  <option value="Absent" className="bg-slate-900 text-white">Absent</option>
                  <option value="Holiday" className="bg-slate-900 text-white">Holiday</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 py-3 text-sm font-semibold transition-all min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-sky-500 hover:bg-sky-600 text-white py-3 text-sm font-semibold transition-all active:scale-[0.98] min-h-[44px]"
                >
                  {editingRecord ? 'Save Changes' : 'Log Attendance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceList;
