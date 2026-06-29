import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Calendar, Plus, Trash2, Edit2, AlertCircle, X, Search } from 'lucide-react';
import { holidayService } from '../services/holiday.service';

const HolidayManagement = () => {
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingHoliday, setEditingHoliday] = useState(null);
    const [search, setSearch] = useState('');

    const fetchHolidays = async () => {
        try {
            setLoading(true);
            const data = await holidayService.getAll();
            setHolidays(data);
        } catch (err) {
            setError('Failed to fetch holidays');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHolidays();
    }, []);

    const formik = useFormik({
        initialValues: {
            name: '',
            date: '',
            type: '',
            description: ''
        },
        validationSchema: Yup.object({
            name: Yup.string().required('Holiday name is required'),
            date: Yup.date().required('Date is required'),
            type: Yup.string().required('Holiday type is required')
        }),
        onSubmit: async (values, { resetForm }) => {
            try {
                setError('');
                if (editingHoliday) {
                    await holidayService.update(editingHoliday._id, values);
                    setSuccessMessage('Holiday updated successfully');
                } else {
                    await holidayService.create(values);
                    setSuccessMessage('Holiday created successfully');
                }
                setModalOpen(false);
                resetForm();
                fetchHolidays();
                setTimeout(() => setSuccessMessage(''), 3000);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to save holiday');
            }
        }
    });

    const openAddModal = () => {
        setEditingHoliday(null);
        formik.resetForm();
        setModalOpen(true);
    };

    const openEditModal = (holiday) => {
        setEditingHoliday(holiday);
        formik.setValues({
            name: holiday.name,
            date: new Date(holiday.date).toISOString().split('T')[0],
            type: holiday.type,
            description: holiday.description || ''
        });
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this holiday?")) {
            try {
                await holidayService.delete(id);
                setSuccessMessage('Holiday deleted successfully');
                fetchHolidays();
                setTimeout(() => setSuccessMessage(''), 3000);
            } catch (err) {
                setError('Failed to delete holiday');
            }
        }
    };

    const filteredHolidays = holidays.filter(h => 
        h.name.toLowerCase().includes(search.toLowerCase()) || 
        h.type.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                        <Calendar className="h-8 w-8 text-sky-500" />
                        Holiday Management
                    </h1>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">Manage school holidays and automatically disable attendance on these dates.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-sky-500/20 transition-all active:scale-95"
                >
                    <Plus className="h-5 w-5" />
                    Add Holiday
                </button>
            </div>

            {error && (
                <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-500">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {successMessage && (
                <div className="mb-6 flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-500">
                    <AlertCircle className="h-5 w-5 shrink-0" stroke="currentColor" />
                    <p>{successMessage}</p>
                </div>
            )}

            <div className="glass-panel rounded-2xl p-4 mb-6">
                <div className="relative max-w-md">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-5 w-5 text-slate-500" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search holidays..."
                        className="w-full pl-10 glass-input py-2"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-sky-500"></div>
                </div>
            ) : filteredHolidays.length === 0 ? (
                <div className="glass-panel rounded-2xl p-12 text-center">
                    <p className="text-slate-400">No holidays found.</p>
                </div>
            ) : (
                <div className="glass-panel rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/50 border-b border-slate-800">
                                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Holiday Name</th>
                                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Type</th>
                                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Description</th>
                                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 text-sm">
                                {filteredHolidays.map((holiday) => (
                                    <tr key={holiday._id} className="hover:bg-slate-900/20 transition-colors">
                                        <td className="p-4 font-bold text-white">{holiday.name}</td>
                                        <td className="p-4 text-slate-300 font-mono">
                                            {new Date(holiday.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                                                {holiday.type}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-400">{holiday.description || '—'}</td>
                                        <td className="p-4 text-right">
                                            <div className="inline-flex gap-2">
                                                <button
                                                    onClick={() => openEditModal(holiday)}
                                                    className="p-2 rounded-lg text-sky-400 hover:bg-sky-500/10 transition-colors"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(holiday._id)}
                                                    className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {modalOpen && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
                    <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl animate-fade-in">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-white">
                                {editingHoliday ? 'Edit Holiday' : 'Add Holiday'}
                            </h2>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={formik.handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Holiday Name</label>
                                <input
                                    name="name"
                                    type="text"
                                    className="w-full glass-input py-2.5"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                {formik.touched.name && formik.errors.name && (
                                    <p className="text-xs text-red-500 mt-1">{formik.errors.name}</p>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Date</label>
                                <input
                                    name="date"
                                    type="date"
                                    className="w-full glass-input py-2.5"
                                    value={formik.values.date}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                {formik.touched.date && formik.errors.date && (
                                    <p className="text-xs text-red-500 mt-1">{formik.errors.date}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Type</label>
                                <select
                                    name="type"
                                    className="w-full glass-input py-2.5"
                                    value={formik.values.type}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                >
                                    <option value="" className="bg-slate-900">Select Type</option>
                                    <option value="National Holiday" className="bg-slate-900">National Holiday</option>
                                    <option value="Festival" className="bg-slate-900">Festival</option>
                                    <option value="School Holiday" className="bg-slate-900">School Holiday</option>
                                    <option value="Emergency Holiday" className="bg-slate-900">Emergency Holiday</option>
                                </select>
                                {formik.touched.type && formik.errors.type && (
                                    <p className="text-xs text-red-500 mt-1">{formik.errors.type}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Description (Optional)</label>
                                <textarea
                                    name="description"
                                    rows="3"
                                    className="w-full glass-input py-2.5"
                                    value={formik.values.description}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={formik.isSubmitting}
                                className="w-full py-3 mt-4 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-sky-500/20"
                            >
                                {formik.isSubmitting ? 'Saving...' : 'Save Holiday'}
                            </button>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default HolidayManagement;
