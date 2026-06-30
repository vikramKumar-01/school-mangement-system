import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { classService } from '../services/class.service';
import { teacherService } from '../services/teacher.service';
import { classSchema } from '../validations/class.validation';
import useAuth from '../hooks/useAuth';
import { Plus, Edit2, Trash2, Search, X, AlertCircle } from 'lucide-react';

const ClassList = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [teacherPermissions, setTeacherPermissions] = useState(null);

  useEffect(() => {
    const fetchTeacherPerms = async () => {
      if (user?.role === 'teacher') {
        const res = await teacherService.getAll({ userId: user._id, limit: 1 }).catch(() => null);
        const match = res?.teachers?.[0];
        setTeacherPermissions(match?.permissions || null);
      }
    };
    fetchTeacherPerms();
  }, [user]);

  const canView = isAdmin || (user?.role === 'teacher' && teacherPermissions?.manageClasses === true);
  const canModify = canView; // Teachers with view classes permissions can modify classes

  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Pagination States
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClasses, setTotalClasses] = useState(0);

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await classService.getAll({
        className: search,
        page,
        limit: 10
      });
      setClasses(res.classes);
      setTotalPages(res.pagination.totalPages);
      setTotalClasses(res.pagination.totalClasses);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await teacherService.getAll({ limit: 100 });
      setTeachers(res.teachers);
    } catch (err) {
      console.error('Failed to load teachers for class assignment:', err);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [search, page]);

  useEffect(() => {
    if (canModify) {
      fetchTeachers();
    }
  }, [canModify]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await classService.delete(id);
        setSuccessMsg('Class deleted successfully');
        fetchClasses();
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to delete class');
      }
    }
  };

  const openAddModal = () => {
    setEditingClass(null);
    formik.resetForm();
    setModalOpen(true);
  };

  const openEditModal = (classObj) => {
    setEditingClass(classObj);
    formik.setValues({
      className: classObj.className,
      section: classObj.section || '',
      classTeacher: classObj.classTeacher?._id || '',
    });
    setModalOpen(false); // reset
    setTimeout(() => setModalOpen(true), 50);
  };

  const formik = useFormik({
    initialValues: {
      className: '',
      section: '',
      classTeacher: '',
    },
    validationSchema: classSchema,
    onSubmit: async (values) => {
      setError('');
      try {
        // Clean values
        const payload = {
          className: values.className,
          section: values.section || undefined,
          classTeacher: values.classTeacher || undefined,
        };

        if (editingClass) {
          await classService.update(editingClass._id, payload);
          setSuccessMsg('Class updated successfully');
        } else {
          await classService.create(payload);
          setSuccessMsg('Class created successfully');
        }

        setModalOpen(false);
        fetchClasses();
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to save class');
      }
    },
  });

  if (!loading && !canView) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800">
        <div className="mx-auto h-12 w-12 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Access Denied</h3>
        <p className="text-slate-400 text-sm">You do not have permission to view class listings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Classes</h1>
          <p className="mt-1 text-sm text-slate-400">Manage academic classrooms and class teachers.</p>
        </div>
        {canModify && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition-all active:scale-95 shadow-md shadow-sky-500/10 min-h-[44px]"
          >
            <Plus className="h-5 w-5" />
            Add Class
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

      {/* Filters and Search */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Search by class name..."
            className="w-full pl-10 glass-input py-2"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="text-sm text-slate-400 font-medium">
          Total Classes: <span className="text-white font-bold">{totalClasses}</span>
        </div>
      </div>

      {/* Main Table view */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-sky-500"></div>
        </div>
      ) : classes.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <p className="text-slate-450">No classes found. Add a class to get started.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/40 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Class Name</th>
                  <th className="px-6 py-4">Section</th>
                  <th className="px-6 py-4">Class Teacher</th>
                  {canModify && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {classes.map((cls) => (
                  <tr key={cls._id} className="hover:bg-slate-900/20 transition-all">
                    <td className="px-6 py-4 font-semibold text-white">{cls.className}</td>
                    <td className="px-6 py-4 text-slate-350">{cls.section || '—'}</td>
                    <td className="px-6 py-4 text-slate-350">
                      {cls.classTeacher ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-white">{cls.classTeacher.name}</span>
                          <span className="text-xs text-slate-500">{cls.classTeacher.email}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Not Assigned</span>
                      )}
                    </td>
                    {canModify && (
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => openEditModal(cls)}
                            className="rounded-lg p-2 text-sky-400 hover:bg-sky-500/10 hover:text-sky-350 transition-colors min-h-[40px] min-w-[40px]"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cls._id)}
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

          {/* Pagination controls */}
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
      )}

      {/* Responsive drawer modal for Add / Edit Class */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="relative w-full max-w-md rounded-t-3xl sm:rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-fade-in max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-lg font-bold text-white">
                {editingClass ? 'Edit Class' : 'Add New Class'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-4">
              {/* Class Name */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-slate-350" htmlFor="className">
                  Class Name *
                </label>
                <input
                  id="className"
                  name="className"
                  type="text"
                  className={`w-full glass-input py-2.5 ${
                    formik.touched.className && formik.errors.className ? 'border-red-505/50' : ''
                  }`}
                  placeholder="e.g. Grade 10"
                  value={formik.values.className}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.className && formik.errors.className && (
                  <p className="text-xs text-red-400 mt-1">{formik.errors.className}</p>
                )}
              </div>

              {/* Section */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-slate-350" htmlFor="section">
                  Section / Division
                </label>
                <input
                  id="section"
                  name="section"
                  type="text"
                  className={`w-full glass-input py-2.5 ${
                    formik.touched.section && formik.errors.section ? 'border-red-505/50' : ''
                  }`}
                  placeholder="e.g. A"
                  value={formik.values.section}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.section && formik.errors.section && (
                  <p className="text-xs text-red-400 mt-1">{formik.errors.section}</p>
                )}
              </div>

              {/* Class Teacher */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-slate-350" htmlFor="classTeacher">
                  Class Teacher
                </label>
                <select
                  id="classTeacher"
                  name="classTeacher"
                  className="w-full glass-input py-2.5"
                  value={formik.values.classTeacher}
                  onChange={formik.handleChange}
                >
                  <option value="" className="bg-slate-900 text-slate-400">Select a Teacher</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id} className="bg-slate-900 text-white">
                      {t.name} ({t.subject || 'No Subject'})
                    </option>
                  ))}
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
                  {editingClass ? 'Update Class' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassList;
