import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { teacherService } from '../services/teacher.service';
import { teacherSchema } from '../validations/teacher.validation';
import useAuth from '../hooks/useAuth';
import { Plus, Edit2, Trash2, Search, X, AlertCircle, Phone, Mail, BookOpen, IndianRupee } from 'lucide-react';

const TeacherList = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Pagination States
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTeachers, setTotalTeachers] = useState(0);

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await teacherService.getAll({
        search,
        subject: subjectFilter,
        page,
        limit: 10
      });
      setTeachers(res.teachers);
      setTotalPages(res.pagination.totalPages);
      setTotalTeachers(res.pagination.totalTeachers);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [search, subjectFilter, page]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await teacherService.delete(id);
        setSuccessMsg('Teacher deleted successfully');
        fetchTeachers();
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to delete teacher');
      }
    }
  };

  const openAddModal = () => {
    setEditingTeacher(null);
    formik.resetForm();
    setModalOpen(true);
  };

  const openEditModal = (t) => {
    setEditingTeacher(t);
    formik.setValues({
      name: t.name,
      subject: t.subject || '',
      email: t.email,
      phone: t.phone || '',
      salary: t.salary || '',
    });
    setModalOpen(false);
    setTimeout(() => setModalOpen(true), 50);
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      subject: '',
      email: '',
      phone: '',
      salary: '',
    },
    validationSchema: teacherSchema,
    onSubmit: async (values) => {
      setError('');
      try {
        const payload = {
          ...values,
          salary: values.salary ? Number(values.salary) : undefined
        };

        if (editingTeacher) {
          await teacherService.update(editingTeacher._id, payload);
          setSuccessMsg('Teacher updated successfully');
        } else {
          await teacherService.create(payload);
          setSuccessMsg('Teacher registered successfully');
        }

        setModalOpen(false);
        fetchTeachers();
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to save teacher');
      }
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Teachers</h1>
          <p className="mt-1 text-sm text-slate-400">View and manage faculty profile details.</p>
        </div>
        {isAdmin && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition-all active:scale-95 shadow-md shadow-sky-500/10 min-h-[44px]"
          >
            <Plus className="h-5 w-5" />
            Add Teacher
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

      {/* Filters and search */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-xl">
          {/* Search bar */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-10 glass-input py-2"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Subject Filter */}
          <input
            type="text"
            placeholder="Filter by subject..."
            className="glass-input py-2 px-4 sm:w-48 text-sm"
            value={subjectFilter}
            onChange={(e) => {
              setSubjectFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="text-sm text-slate-400 font-medium">
          Total Teachers: <span className="text-white font-bold">{totalTeachers}</span>
        </div>
      </div>

      {/* Mobile Card view vs Desktop Table view */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-sky-500"></div>
        </div>
      ) : teachers.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <p className="text-slate-450">No teachers found.</p>
        </div>
      ) : (
        <>
          {/* 1. Mobile Cards (< 768px) */}
          <div className="grid gap-4 sm:grid-cols-2 md:hidden">
            {teachers.map((t) => (
              <div key={t._id} className="glass-card p-5 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">{t.name}</h3>
                  <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase">
                    {t.subject || 'Faculty'}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-400 border-t border-slate-850 pt-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                    <a href={`mailto:${t.email}`} className="hover:underline">{t.email}</a>
                  </div>
                  {t.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      <a href={`tel:${t.phone}`} className="hover:underline">{t.phone}</a>
                    </div>
                  )}
                  {isAdmin && t.salary && (
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      <span className="text-slate-300 font-semibold">Salary: ₹{t.salary.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {isAdmin && (
                  <div className="flex gap-2 border-t border-slate-850 pt-3">
                    <button
                      onClick={() => openEditModal(t)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-sky-400 text-xs font-bold py-2 min-h-[36px]"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(t._id)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-850 hover:bg-red-500/10 text-red-400 text-xs font-bold py-2 min-h-[36px]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 2. Desktop Table (>= 768px) */}
          <div className="hidden md:block glass-panel rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/40 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Phone</th>
                    {isAdmin && <th className="px-6 py-4">Salary</th>}
                    {isAdmin && <th className="px-6 py-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {teachers.map((t) => (
                    <tr key={t._id} className="hover:bg-slate-900/20 transition-all">
                      <td className="px-6 py-4 font-semibold text-white">{t.name}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-xs font-semibold">
                          {t.subject || 'Faculty'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        <a href={`mailto:${t.email}`} className="hover:underline">{t.email}</a>
                      </td>
                      <td className="px-6 py-4 text-slate-350">
                        {t.phone ? <a href={`tel:${t.phone}`} className="hover:underline">{t.phone}</a> : '—'}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-emerald-400 font-semibold font-mono">
                          {t.salary ? `₹${t.salary.toLocaleString()}` : '—'}
                        </td>
                      )}
                      {isAdmin && (
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex gap-1.5">
                            <button
                              onClick={() => openEditModal(t)}
                              className="rounded-lg p-2 text-sky-400 hover:bg-sky-500/10 hover:text-sky-350 transition-colors min-h-[40px] min-w-[40px]"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(t._id)}
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

      {/* Add / Edit Teacher Modal Drawer */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="relative w-full max-w-md rounded-t-3xl sm:rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-lg font-bold text-white">
                {editingTeacher ? 'Edit Teacher details' : 'Register Faculty'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-slate-350" htmlFor="name">
                  Teacher Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className={`w-full glass-input py-2.5 ${
                    formik.touched.name && formik.errors.name ? 'border-red-500/50' : ''
                  }`}
                  placeholder="e.g. Prof. Marcus"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.name && formik.errors.name && (
                  <p className="text-xs text-red-400 mt-1">{formik.errors.name}</p>
                )}
              </div>

              {/* Subject */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-slate-350" htmlFor="subject">
                  Subject *
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  className={`w-full glass-input py-2.5 ${
                    formik.touched.subject && formik.errors.subject ? 'border-red-500/50' : ''
                  }`}
                  placeholder="e.g. Advanced Physics"
                  value={formik.values.subject}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.subject && formik.errors.subject && (
                  <p className="text-xs text-red-400 mt-1">{formik.errors.subject}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-slate-350" htmlFor="email">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`w-full glass-input py-2.5 ${
                    formik.touched.email && formik.errors.email ? 'border-red-500/50' : ''
                  }`}
                  placeholder="marcus@school.com"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="text-xs text-red-400 mt-1">{formik.errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-slate-350" htmlFor="phone">
                  Contact Phone *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  className={`w-full glass-input py-2.5 ${
                    formik.touched.phone && formik.errors.phone ? 'border-red-500/50' : ''
                  }`}
                  placeholder="+1 555-987-6543"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.phone && formik.errors.phone && (
                  <p className="text-xs text-red-400 mt-1">{formik.errors.phone}</p>
                )}
              </div>

              {/* Salary */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-slate-350" htmlFor="salary">
                  Salary
                </label>
                <input
                  id="salary"
                  name="salary"
                  type="number"
                  className={`w-full glass-input py-2.5 ${
                    formik.touched.salary && formik.errors.salary ? 'border-red-500/50' : ''
                  }`}
                  placeholder="e.g. 5000"
                  value={formik.values.salary}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.salary && formik.errors.salary && (
                  <p className="text-xs text-red-400 mt-1">{formik.errors.salary}</p>
                )}
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
                  {editingTeacher ? 'Save Changes' : 'Add Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherList;
