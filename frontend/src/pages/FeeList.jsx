import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { feeService } from '../services/fee.service';
import { studentService } from '../services/student.service';
import { feeSchema } from '../validations/fee.validation';
import useAuth from '../hooks/useAuth';
import { Plus, Edit2, Trash2, Check, X, AlertCircle, Calendar, User, DollarSign, Filter } from 'lucide-react';

const FeeList = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filtering & Pagination
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFees, setTotalFees] = useState(0);

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState(null);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const res = await feeService.getAll({
        status: statusFilter || undefined,
        page,
        limit: 10
      });
      setFees(res.fees);
      setTotalPages(res.pagination.totalPages);
      setTotalFees(res.pagination.totalFees);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load fee records');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsList = async () => {
    try {
      const res = await studentService.getAll({ limit: 100 });
      setStudents(res.students);
    } catch (err) {
      console.error('Failed to load student dropdown:', err);
    }
  };

  useEffect(() => {
    fetchFees();
  }, [statusFilter, page]);

  useEffect(() => {
    if (isAdmin) {
      fetchStudentsList();
    }
  }, [isAdmin]);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this fee record permanently?')) {
      try {
        await feeService.delete(id);
        setSuccessMsg('Fee record deleted successfully');
        fetchFees();
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to delete fee record');
      }
    }
  };

  const quickMarkAsPaid = async (feeRecord) => {
    try {
      await feeService.update(feeRecord._id, {
        amount: feeRecord.amount,
        status: 'Paid',
        paymentDate: new Date().toISOString().split('T')[0]
      });
      setSuccessMsg('Record updated to PAID');
      fetchFees();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update record');
    }
  };

  const openAddModal = () => {
    setEditingFee(null);
    formik.resetForm();
    setModalOpen(true);
  };

  const openEditModal = (feeObj) => {
    setEditingFee(feeObj);
    formik.setValues({
      student: feeObj.student?._id || '',
      amount: feeObj.amount || '',
      status: feeObj.status || 'Pending',
      paymentDate: feeObj.paymentDate ? feeObj.paymentDate.split('T')[0] : '',
    });
    setModalOpen(false);
    setTimeout(() => setModalOpen(true), 50);
  };

  const formik = useFormik({
    initialValues: {
      student: '',
      amount: '',
      status: 'Pending',
      paymentDate: '',
    },
    validationSchema: feeSchema,
    onSubmit: async (values) => {
      setError('');
      try {
        const payload = {
          student: values.student,
          amount: Number(values.amount),
          status: values.status,
          paymentDate: values.status === 'Paid' ? (values.paymentDate || new Date().toISOString().split('T')[0]) : undefined
        };

        if (editingFee) {
          await feeService.update(editingFee._id, payload);
          setSuccessMsg('Fee record updated');
        } else {
          await feeService.create(payload);
          setSuccessMsg('Fee record created');
        }

        setModalOpen(false);
        fetchFees();
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to save fee record');
      }
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Fees</h1>
          <p className="mt-1 text-sm text-slate-400">View payment schedules and transaction records.</p>
        </div>
        {isAdmin && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition-all active:scale-95 shadow-md shadow-sky-500/10 min-h-[44px]"
          >
            <Plus className="h-5 w-5" />
            Add Invoice
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

      {/* Filters and totals */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 flex-1 max-w-xs">
          <div className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Filter className="h-5 w-5 text-slate-500" />
            </div>
            <select
              className="w-full pl-10 glass-input py-2 text-sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="" className="bg-slate-900 text-slate-400">All Payment Statuses</option>
              <option value="Paid" className="bg-slate-900 text-white">Paid Invoices</option>
              <option value="Pending" className="bg-slate-900 text-white">Pending Invoices</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-slate-400 font-medium">
          Total Invoices: <span className="text-white font-bold">{totalFees}</span>
        </div>
      </div>

      {/* Table & Cards */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-sky-500"></div>
        </div>
      ) : fees.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <p className="text-slate-450">No fee records found.</p>
        </div>
      ) : (
        <>
          {/* Mobile Card view (< 768px) */}
          <div className="grid gap-4 sm:grid-cols-2 md:hidden">
            {fees.map((f) => (
              <div key={f._id} className="glass-card p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {f.student?.name || <span className="text-slate-550 italic">Unknown Student</span>}
                    </h3>
                    <p className="text-xs text-slate-450 mt-0.5">Roll: {f.student?.rollNumber || '—'}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                    f.status === 'Paid' 
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {f.status}
                  </span>
                </div>

                <div className="flex items-baseline justify-between border-t border-slate-850 pt-3">
                  <span className="text-xs text-slate-450">Amount:</span>
                  <span className="text-lg font-bold text-white">${f.amount}</span>
                </div>

                {f.paymentDate && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-xl">
                    <Calendar className="h-4 w-4 text-slate-500 shrink-0" />
                    <span>Paid on: {new Date(f.paymentDate).toLocaleDateString()}</span>
                  </div>
                )}

                {isAdmin && (
                  <div className="flex gap-2 border-t border-slate-850 pt-3">
                    {f.status === 'Pending' && (
                      <button
                        onClick={() => quickMarkAsPaid(f)}
                        className="flex-1 inline-flex items-center justify-center gap-1 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white text-xs font-bold py-2 rounded-lg transition-all min-h-[36px]"
                      >
                        <Check className="h-4 w-4" />
                        Pay
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(f)}
                      className="flex-1 inline-flex items-center justify-center gap-1 border border-slate-800 hover:bg-slate-800 text-sky-400 text-xs font-bold py-2 rounded-lg transition-all min-h-[36px]"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(f._id)}
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
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Payment Date</th>
                    {isAdmin && <th className="px-6 py-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {fees.map((f) => (
                    <tr key={f._id} className="hover:bg-slate-900/20 transition-all">
                      <td className="px-6 py-4 font-semibold text-white">
                        {f.student?.name || <span className="text-slate-550 italic">Unknown Student</span>}
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-mono text-xs capitalize">
                        {f.student?.class || '—'}
                      </td>
                      <td className="px-6 py-4 text-slate-350">{f.student?.rollNumber || '—'}</td>
                      <td className="px-6 py-4 font-extrabold text-white">${f.amount}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          f.status === 'Paid' 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {f.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-450">
                        {f.paymentDate ? new Date(f.paymentDate).toLocaleDateString() : '—'}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex gap-1.5">
                            {f.status === 'Pending' && (
                              <button
                                onClick={() => quickMarkAsPaid(f)}
                                className="rounded-lg p-2 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-350 transition-colors min-h-[40px] min-w-[40px]"
                                title="Mark as Paid"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => openEditModal(f)}
                              className="rounded-lg p-2 text-sky-400 hover:bg-sky-500/10 hover:text-sky-350 transition-colors min-h-[40px] min-w-[40px]"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(f._id)}
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

      {/* Invoice Form Drawer Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="relative w-full max-w-md rounded-t-3xl sm:rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-lg font-bold text-white">
                {editingFee ? 'Modify Invoice Details' : 'Create New Invoice'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-4">
              {/* Student Dropdown */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-slate-350" htmlFor="student">
                  Select Student *
                </label>
                <select
                  id="student"
                  name="student"
                  disabled={!!editingFee}
                  className={`w-full glass-input py-2.5 disabled:opacity-50 ${
                    formik.touched.student && formik.errors.student ? 'border-red-500/50' : ''
                  }`}
                  value={formik.values.student}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="" className="bg-slate-900 text-slate-400">Choose student</option>
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

              {/* Amount */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-slate-350" htmlFor="amount">
                  Fee Amount *
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <DollarSign className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    className={`w-full pl-10 glass-input py-2.5 ${
                      formik.touched.amount && formik.errors.amount ? 'border-red-500/50' : ''
                    }`}
                    placeholder="e.g. 1500"
                    value={formik.values.amount}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
                {formik.touched.amount && formik.errors.amount && (
                  <p className="text-xs text-red-400 mt-1">{formik.errors.amount}</p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-slate-350" htmlFor="status">
                  Payment Status *
                </label>
                <select
                  id="status"
                  name="status"
                  className="w-full glass-input py-2.5"
                  value={formik.values.status}
                  onChange={(e) => {
                    formik.handleChange(e);
                    // Clear date if pending
                    if (e.target.value === 'Pending') {
                      formik.setFieldValue('paymentDate', '');
                    } else {
                      formik.setFieldValue('paymentDate', new Date().toISOString().split('T')[0]);
                    }
                  }}
                >
                  <option value="Pending" className="bg-slate-900 text-white">Pending</option>
                  <option value="Paid" className="bg-slate-900 text-white">Paid</option>
                </select>
              </div>

              {/* Payment Date */}
              {formik.values.status === 'Paid' && (
                <div className="space-y-1 text-left animate-fade-in">
                  <label className="text-xs font-semibold text-slate-350" htmlFor="paymentDate">
                    Payment Date *
                  </label>
                  <input
                    id="paymentDate"
                    name="paymentDate"
                    type="date"
                    className={`w-full glass-input py-2.5 ${
                      formik.touched.paymentDate && formik.errors.paymentDate ? 'border-red-505/50' : ''
                    }`}
                    value={formik.values.paymentDate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.paymentDate && formik.errors.paymentDate && (
                    <p className="text-xs text-red-400 mt-1">{formik.errors.paymentDate}</p>
                  )}
                </div>
              )}

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
                  {editingFee ? 'Save Changes' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeList;
