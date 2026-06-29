import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useFormik } from 'formik';
import { studentService } from '../services/student.service';
import { classService } from '../services/class.service';
import { studentSchema } from '../validations/student.validation';
import useAuth from '../hooks/useAuth';
import { Plus, Edit2, Trash2, Search, X, AlertCircle, Phone, Home, Calendar, User, Eye, FileText, CheckCircle, IndianRupee, CalendarCheck } from 'lucide-react';
import { marksService } from '../services/marks.service';
import { feeService } from '../services/fee.service';
import { attendanceService } from '../services/attendance.service';

const StudentList = () => {
  const { user } = useAuth();
  const canModify = ['admin', 'teacher'].includes(user?.role);
  const isAdmin = user?.role === 'admin';

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filters
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // Profile Modal States
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentMarks, setStudentMarks] = useState([]);
  const [studentFees, setStudentFees] = useState([]);
  const [studentAttendance, setStudentAttendance] = useState([]);
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await studentService.getAll({
        search,
        class: selectedClass,
        page,
        limit: 10
      });
      setStudents(res.students);
      setTotalPages(res.pagination.totalPages);
      setTotalStudents(res.pagination.totalStudents);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassesList = async () => {
    try {
      const res = await classService.getAll({ limit: 100 });
      setClasses(res.classes);
    } catch (err) {
      console.error('Failed to load class list for filter/form dropdown:', err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, selectedClass, page]);

  useEffect(() => {
    fetchClassesList();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentService.delete(id);
        setSuccessMsg('Student record deleted');
        fetchStudents();
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to delete student');
      }
    }
  };

  const viewProfile = async (student) => {
    setSelectedStudent(student);
    setProfileOpen(true);
    setProfileLoading(true);
    setStudentMarks([]);
    setStudentFees([]);
    setStudentAttendance([]);
    try {
      const [marksData, feeData, attendanceData] = await Promise.all([
        marksService.getAll({ studentId: student._id }).catch(() => []),
        feeService.getAll({ studentId: student._id }).catch(() => null),
        attendanceService.getAll({ studentId: student._id }).catch(() => null)
      ]);
      setStudentMarks(marksData || []);
      setStudentFees(feeData?.fees || feeData || []);
      setStudentAttendance(attendanceData?.attendance || attendanceData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingStudent(null);
    formik.resetForm();
    setModalOpen(true);
  };

  const openEditModal = (std) => {
    setEditingStudent(std);
    formik.setValues({
      name: std.name,
      class: std.class,
      rollNumber: std.rollNumber,
      fatherName: std.fatherName || '',
      phone: std.phone || '',
      address: std.address || '',
      admissionDate: std.admissionDate ? std.admissionDate.split('T')[0] : '',
    });
    setModalOpen(false);
    setTimeout(() => setModalOpen(true), 50);
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      gender: '',
      class: '',
      rollNumber: '',
      fatherName: '',
      phone: '',
      address: '',
      admissionDate: '',
    },
    validationSchema: studentSchema,
    onSubmit: async (values) => {
      setError('');
      try {
        const payload = { ...values };
        if (!payload.admissionDate) delete payload.admissionDate;

        if (editingStudent) {
          await studentService.update(editingStudent._id, payload);
          setSuccessMsg('Student record updated');
        } else {
          const res = await studentService.create(payload);
          // If the backend returns credentials, show them in success message
          if (res?.credentials) {
            setSuccessMsg(`Student created! UserID: ${res.credentials.userId} | Password: ${res.credentials.password}`);
          } else {
            setSuccessMsg('Student record created');
          }
        }

        setModalOpen(false);
        fetchStudents();
        // Keep the message longer so they can read the credentials
        setTimeout(() => setSuccessMsg(''), 15000);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to save student');
      }
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Students</h1>
          <p className="mt-1 text-sm text-slate-400">View and manage student profile records.</p>
        </div>
        {canModify && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition-all active:scale-95 shadow-md shadow-sky-500/10 min-h-[44px]"
          >
            <Plus className="h-5 w-5" />
            Add Student
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

      {/* Filters, search, and count */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl">
          {/* Search bar */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Search by name or roll number..."
              className="w-full pl-10 glass-input py-2"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Class Filter */}
          <select
            className="glass-input py-2 px-4 sm:w-48 text-sm"
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setPage(1);
            }}
          >
            <option value="" className="bg-slate-900 text-slate-400">All Classes</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls.className} className="bg-slate-900 text-white">
                {cls.className} {cls.section ? `(${cls.section})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm text-slate-400 font-medium">
          Total Students: <span className="text-white font-bold">{totalStudents}</span>
        </div>
      </div>

      {/* Grid view on mobile / Tablet, List view on Desktop */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-sky-500"></div>
        </div>
      ) : students.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <p className="text-slate-450">No student records found.</p>
        </div>
      ) : (
        <>
          {/* 1. Mobile Adaptive Card Layout (< 768px) */}
          <div className="grid gap-4 sm:grid-cols-2 md:hidden">
            {students.map((std) => (
              <div key={std._id} className="glass-card p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <button 
                      onClick={() => viewProfile(std)}
                      className="text-lg font-bold text-sky-400 hover:text-sky-300 hover:underline leading-tight text-left"
                    >
                      {std.name}
                    </button>
                    <br />
                    <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 text-xs font-semibold uppercase">
                      {std.class}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-slate-500 block">Roll: {std.rollNumber}</span>
                    <span className="text-[10px] font-mono text-sky-500 bg-sky-500/10 px-2 py-0.5 rounded-full mt-1 inline-block">ID: {std.user?.userId || 'N/A'}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-400 border-t border-slate-850 pt-3">
                  {std.fatherName && (
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      <span>F: {std.fatherName}</span>
                    </div>
                  )}
                  {std.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      <a href={`tel:${std.phone}`} className="hover:underline">{std.phone}</a>
                    </div>
                  )}
                  {std.address && (
                    <div className="flex items-center gap-2">
                      <Home className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{std.address}</span>
                    </div>
                  )}
                  {std.admissionDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      <span>Joined: {new Date(std.admissionDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {canModify && (
                  <div className="flex gap-2 border-t border-slate-850 pt-3">
                    <button
                      onClick={() => openEditModal(std)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-sky-400 text-xs font-bold py-2 min-h-[36px]"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(std._id)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-850 hover:bg-red-500/10 text-red-400 text-xs font-bold py-2 min-h-[36px]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 2. Desktop Responsive Table View (>= 768px) */}
          <div className="hidden md:block glass-panel rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/40 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">User ID</th>
                    <th className="px-6 py-4">Class</th>
                    <th className="px-6 py-4">Roll Number</th>
                    <th className="px-6 py-4">Father's Name</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Admission Date</th>
                    {canModify && <th className="px-6 py-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {students.map((std) => (
                    <tr key={std._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 text-sm font-medium">
                        <button 
                          onClick={() => viewProfile(std)}
                          className="text-sky-400 hover:text-sky-300 hover:underline text-left font-bold"
                        >
                          {std.name}
                        </button>
                      </td>
                      <td className="px-6 py-4 font-mono text-sky-400 text-xs bg-sky-500/5">{std.user?.userId || '—'}</td>
                      <td className="p-4 text-sm text-slate-400">
                        <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 text-xs font-semibold uppercase">
                          {std.class}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-300">{std.rollNumber}</td>
                      <td className="px-6 py-4 text-slate-350">{std.fatherName || '—'}</td>
                      <td className="px-6 py-4 text-slate-350">
                        {std.phone ? <a href={`tel:${std.phone}`} className="hover:underline">{std.phone}</a> : '—'}
                      </td>
                      <td className="px-6 py-4 text-slate-450">
                        {std.admissionDate ? new Date(std.admissionDate).toLocaleDateString() : '—'}
                      </td>
                      {canModify && (
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex gap-1.5">
                            <button
                              onClick={() => openEditModal(std)}
                              className="rounded-lg p-2 text-sky-400 hover:bg-sky-500/10 hover:text-sky-350 transition-colors min-h-[40px] min-w-[40px]"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => handleDelete(std._id)}
                                className="rounded-lg p-2 text-red-400 hover:bg-red-500/10 hover:text-red-350 transition-colors min-h-[40px] min-w-[40px]"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
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

      {/* Edit Student Modal */}
      {modalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl animate-fade-in text-left max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
              <h3 className="text-xl font-black text-slate-950 dark:text-white">
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-4">

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                      Full Name *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      className={`w-full glass-input py-2.5 ${formik.touched.name && formik.errors.name ? 'border-red-500/50' : ''
                        }`}
                      placeholder=""
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.name && formik.errors.name && (
                      <p className="text-[10px] text-red-400 mt-1">{formik.errors.name}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                      Roll Number *
                    </label>
                    <input
                      id="rollNumber"
                      name="rollNumber"
                      type="number"
                      disabled={!!editingStudent}
                      className={`w-full glass-input py-2.5 disabled:opacity-50 disabled:cursor-not-allowed ${formik.touched.rollNumber && formik.errors.rollNumber ? 'border-red-500/50' : ''
                        }`}
                      placeholder=""
                      value={formik.values.rollNumber}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.rollNumber && formik.errors.rollNumber && (
                      <p className="text-[10px] text-red-400 mt-1">{formik.errors.rollNumber}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                      Gender *
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      disabled={!!editingStudent}
                      className={`w-full glass-input py-2.5 disabled:opacity-50 disabled:cursor-not-allowed ${formik.touched.gender && formik.errors.gender ? 'border-red-500/50' : ''
                        }`}
                      value={formik.values.gender}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      <option value="" className="bg-slate-900">Select Gender</option>
                      <option value="Male" className="bg-slate-900 text-white">Male</option>
                      <option value="Female" className="bg-slate-900 text-white">Female</option>
                    </select>
                    {formik.touched.gender && formik.errors.gender && (
                      <p className="text-[10px] text-red-400 mt-1">{formik.errors.gender}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                      Class Section *
                    </label>
                    <select
                      id="class"
                      name="class"
                      className={`w-full glass-input py-2.5 ${formik.touched.class && formik.errors.class ? 'border-red-500/50' : ''
                        }`}
                      value={formik.values.class}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      <option value="" className="bg-slate-900">Select Class</option>
                      {classes.map(c => (
                        <option key={c._id} value={c.className} className="bg-slate-900 text-white">
                          {c.className} {c.section ? `(${c.section})` : ''}
                        </option>
                      ))}
                    </select>
                    {formik.touched.class && formik.errors.class && (
                      <p className="text-[10px] text-red-400 mt-1">{formik.errors.class}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                      Admission Date
                    </label>
                    <input
                      id="admissionDate"
                      name="admissionDate"
                      type="date"
                      className="w-full glass-input py-2.5"
                      value={formik.values.admissionDate}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                      Father's Name
                    </label>
                    <input
                      id="fatherName"
                      name="fatherName"
                      type="text"
                      className="w-full glass-input py-2.5"
                      placeholder=""
                      value={formik.values.fatherName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="text"
                      className={`w-full glass-input py-2.5 ${formik.touched.phone && formik.errors.phone ? 'border-red-500/50' : ''
                        }`}
                      placeholder=""
                      value={formik.values.phone}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.phone && formik.errors.phone && (
                      <p className="text-[10px] text-red-400 mt-1">{formik.errors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                    Full Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows="2"
                    className="w-full glass-input py-2.5"
                    placeholder="Residential address..."
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  ></textarea>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={formik.isSubmitting}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-sm font-bold text-white shadow-lg shadow-blue-500/10 cursor-pointer transition-colors"
                >
                  {formik.isSubmitting ? 'Processing...' : (editingStudent ? 'Update Profile' : 'Register Student')}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Profile Modal */}
      {profileOpen && selectedStudent && createPortal(
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setProfileOpen(false)}></div>
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl animate-fade-in text-left max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            <div className="flex items-start justify-between border-b border-slate-800 pb-6 mb-6">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="h-16 w-16 sm:h-20 sm:w-20 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-full flex items-center justify-center shrink-0">
                  <User className="h-8 w-8 sm:h-10 sm:w-10" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-3xl font-black text-white">{selectedStudent.name}</h3>
                  <div className="flex flex-wrap gap-2 sm:gap-3 text-sm mt-2">
                    <span className="font-mono bg-slate-800 px-2 sm:px-3 py-1 rounded-full text-xs text-slate-300">Roll: {selectedStudent.rollNumber}</span>
                    <span className="bg-sky-500/10 text-sky-400 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold">Class {selectedStudent.class}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setProfileOpen(false);
                  setSelectedStudent(null);
                }}
                className="p-2 rounded-xl bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white cursor-pointer transition-colors shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {profileLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-800 border-t-sky-500"></div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 pb-4">
                
                {/* General Info */}
                <div className="space-y-4">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <User className="h-4 w-4" /> Personal Details
                  </h4>
                  <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800/50 space-y-4 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Father's Name</span>
                      <span className="font-bold text-white text-right">{selectedStudent.fatherName || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Phone Number</span>
                      <span className="font-bold text-white font-mono text-right">{selectedStudent.phone || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Admission Date</span>
                      <span className="font-bold text-white text-right">
                        {selectedStudent.admissionDate ? new Date(selectedStudent.admissionDate).toLocaleDateString() : '-'}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5 pt-1">
                      <span className="text-slate-500 font-medium">Address</span>
                      <span className="font-bold text-white leading-relaxed">{selectedStudent.address || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Marks / Progress */}
                <div className="space-y-4">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" /> Academic Progress
                  </h4>
                  <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800/50 space-y-4 max-h-56 overflow-y-auto custom-scrollbar">
                    {studentMarks.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-6 font-medium">No marks recorded yet.</p>
                    ) : (
                      studentMarks.map((mark, i) => {
                        const percentage = ((mark.marksObtained / mark.maxMarks) * 100).toFixed(1);
                        return (
                          <div key={i} className="flex justify-between items-center border-b border-slate-800/60 pb-3 last:border-0 last:pb-0">
                            <div>
                              <p className="text-sm font-bold text-white">{mark.subject}</p>
                              <p className="text-xs font-medium text-slate-500 mt-0.5">{mark.examType || 'Exam'}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-mono font-bold text-sky-400">{mark.marksObtained} <span className="text-slate-600">/</span> {mark.maxMarks}</p>
                              <p className="text-xs font-bold text-slate-400 mt-0.5">{percentage}%</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Fees Pending */}
                <div className="space-y-4 mt-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <IndianRupee className="h-4 w-4" /> Fee Status
                  </h4>
                  <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800/50 max-h-48 overflow-y-auto custom-scrollbar">
                    {studentFees.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-6 font-medium">No fee records found.</p>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {studentFees.map((fee, i) => (
                          <div key={i} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center shadow-inner">
                            <div>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Amount</p>
                              <p className="text-base font-black text-white">₹{fee.amount}</p>
                            </div>
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider ${fee.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                              {fee.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Attendance */}
                <div className="space-y-4 mt-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <CalendarCheck className="h-4 w-4" /> Attendance Record
                  </h4>
                  <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800/50 space-y-4 max-h-48 overflow-y-auto custom-scrollbar">
                    {studentAttendance.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-6 font-medium">No attendance records found.</p>
                    ) : (
                      studentAttendance.slice(0, 10).map((att, i) => {
                        let statusColor = "bg-slate-500/10 text-slate-400 border-slate-500/20";
                        if (att.status === 'Present') statusColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                        else if (att.status === 'Absent') statusColor = "bg-red-500/10 text-red-400 border-red-500/20";
                        else if (att.status === 'Holiday') statusColor = "bg-sky-500/10 text-sky-400 border-sky-500/20";

                        return (
                          <div key={i} className="flex justify-between items-center border-b border-slate-800/60 pb-3 last:border-0 last:pb-0">
                            <div>
                              <p className="text-sm font-bold text-white">{new Date(att.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${statusColor}`}>
                              {att.status}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default StudentList;
