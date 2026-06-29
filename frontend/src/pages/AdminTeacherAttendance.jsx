import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ClipboardCheck, Search, Filter, Edit2, Trash2, Download, AlertCircle, X, MapPin } from 'lucide-react';
import { teacherAttendanceService } from '../services/teacherAttendance.service';
import { teacherService } from '../services/teacher.service';

const AdminTeacherAttendance = () => {
    const [records, setRecords] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Filters
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const params = { page, limit: 15 };
            if (selectedTeacher) params.teacherId = selectedTeacher;
            if (selectedStatus) params.status = selectedStatus;
            if (selectedDate) params.date = selectedDate;

            const data = await teacherAttendanceService.getAllAdmin(params);
            setRecords(data.records || []);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch (err) {
            setError('Failed to fetch attendance records');
        } finally {
            setLoading(false);
        }
    };

    const fetchTeachers = async () => {
        try {
            const data = await teacherService.getAll({ limit: 100 });
            setTeachers(data.teachers || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    useEffect(() => {
        fetchRecords();
    }, [page, selectedTeacher, selectedStatus, selectedDate]);

    const formik = useFormik({
        initialValues: {
            teacher: '',
            date: '',
            status: '',
            checkInTime: '',
            checkOutTime: ''
        },
        validationSchema: Yup.object({
            status: Yup.string().required('Status is required'),
            teacher: Yup.string().when('isEditing', {
                is: false,
                then: () => Yup.string().required('Teacher is required')
            }),
            date: Yup.string().when('isEditing', {
                is: false,
                then: () => Yup.string().required('Date is required')
            })
        }),
        onSubmit: async (values) => {
            try {
                if (isEditing) {
                    await teacherAttendanceService.updateAdmin(editingRecord._id, {
                        status: values.status,
                        checkInTime: values.checkInTime,
                        checkOutTime: values.checkOutTime
                    });
                    setSuccessMsg('Attendance record updated');
                } else {
                    await teacherAttendanceService.createAdmin(values);
                    setSuccessMsg('Attendance record created');
                }
                setModalOpen(false);
                fetchRecords();
                setTimeout(() => setSuccessMsg(''), 3000);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to save record');
            }
        }
    });

    const openAddModal = () => {
        setIsEditing(false);
        setEditingRecord(null);
        formik.resetForm();
        formik.setValues({
            teacher: '',
            date: new Date().toISOString().split('T')[0],
            status: 'Present',
            checkInTime: '',
            checkOutTime: ''
        });
        setModalOpen(true);
    };

    const openEditModal = (record) => {
        setIsEditing(true);
        setEditingRecord(record);
        formik.setValues({
            teacher: record.teacher?._id || '',
            date: record.date ? new Date(record.date).toISOString().split('T')[0] : '',
            status: record.status,
            checkInTime: record.checkInTime ? new Date(record.checkInTime).toISOString().slice(0, 16) : '',
            checkOutTime: record.checkOutTime ? new Date(record.checkOutTime).toISOString().slice(0, 16) : ''
        });
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this record?")) {
            try {
                await teacherAttendanceService.deleteAdmin(id);
                setSuccessMsg('Record deleted successfully');
                fetchRecords();
                setTimeout(() => setSuccessMsg(''), 3000);
            } catch (err) {
                setError('Failed to delete record');
            }
        }
    };

    const exportToCSV = () => {
        const headers = ['Date', 'Teacher', 'Status', 'Check-In', 'Check-Out', 'Working Hours', 'Distance (m)'];
        
        const csvContent = [
            headers.join(','),
            ...records.map(r => {
                const date = new Date(r.date).toLocaleDateString();
                const teacher = r.teacher?.name || 'Unknown';
                const status = r.status;
                const checkIn = r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : 'N/A';
                const checkOut = r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString() : 'N/A';
                const hours = r.workingHours || 0;
                const distance = r.distance ? Math.round(r.distance) : 'N/A';
                return `"${date}","${teacher}","${status}","${checkIn}","${checkOut}","${hours}","${distance}"`;
            })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Teacher_Attendance_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                        <ClipboardCheck className="h-8 w-8 text-sky-500" />
                        Teacher Attendance
                    </h1>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">View, manage, and export staff attendance logs.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-sky-500/20 transition-all active:scale-95"
                    >
                        <ClipboardCheck className="h-5 w-5" />
                        Add Attendance
                    </button>
                    <button
                        onClick={exportToCSV}
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                    >
                        <Download className="h-5 w-5" />
                        Export
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-500">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {successMsg && (
                <div className="mb-6 flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-500">
                    <AlertCircle className="h-5 w-5 shrink-0" stroke="currentColor" />
                    <p>{successMsg}</p>
                </div>
            )}

            {/* Filters */}
            <div className="glass-panel rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-4">
                <select 
                    className="glass-input py-2.5 px-4 flex-1"
                    value={selectedTeacher}
                    onChange={(e) => { setSelectedTeacher(e.target.value); setPage(1); }}
                >
                    <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Teachers</option>
                    {teachers.map(t => (
                        <option key={t._id} value={t._id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{t.name}</option>
                    ))}
                </select>

                <select 
                    className="glass-input py-2.5 px-4 sm:w-48"
                    value={selectedStatus}
                    onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
                >
                    <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Statuses</option>
                    <option value="Present" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Present</option>
                    <option value="Late" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Late</option>
                    <option value="Half Day" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Half Day</option>
                    <option value="Absent" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Absent</option>
                </select>

                <input 
                    type="date" 
                    className="glass-input py-2.5 px-4 sm:w-48"
                    value={selectedDate}
                    onChange={(e) => { setSelectedDate(e.target.value); setPage(1); }}
                />
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-sky-500"></div>
                </div>
            ) : records.length === 0 ? (
                <div className="glass-panel rounded-2xl p-12 text-center">
                    <p className="text-slate-600 dark:text-slate-400">No attendance records found.</p>
                </div>
            ) : (
                <div className="glass-panel rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-100 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                                    <th className="p-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Date</th>
                                    <th className="p-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Teacher</th>
                                    <th className="p-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="p-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Times</th>
                                    <th className="p-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest text-center">Hours</th>
                                    <th className="p-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                                {records.map((r) => {
                                    let statusColor = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
                                    if (r.status === 'Present') statusColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                                    if (r.status === 'Late') statusColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                                    if (r.status === 'Half Day') statusColor = 'bg-orange-500/10 text-orange-400 border-orange-500/20';
                                    if (r.status === 'Absent') statusColor = 'bg-red-500/10 text-red-400 border-red-500/20';

                                    return (
                                        <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                                            <td className="p-4 text-slate-700 dark:text-slate-300 font-mono text-xs">
                                                {new Date(r.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </td>
                                            <td className="p-4">
                                                <p className="font-bold text-slate-900 dark:text-white">{r.teacher?.name}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${statusColor}`}>
                                                    {r.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                                                <div><span className="text-emerald-600 dark:text-emerald-400">IN:</span> {r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</div>
                                                <div><span className="text-amber-600 dark:text-amber-400">OUT:</span> {r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</div>
                                            </td>
                                            <td className="p-4 text-center font-bold text-slate-900 dark:text-white">
                                                {r.workingHours || '-'}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="inline-flex gap-2">
                                                    <button onClick={() => openEditModal(r)} className="p-2 rounded-lg text-sky-400 hover:bg-sky-500/10 transition-colors">
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(r._id)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-2 py-4">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(p - 1, 1))}
                        className="rounded-lg border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-900 disabled:opacity-30 transition-all"
                    >
                        Previous
                    </button>
                    <span className="text-xs text-slate-450">
                        Page <span className="text-white font-semibold">{page}</span> of <span className="text-white font-semibold">{totalPages}</span>
                    </span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                        className="rounded-lg border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-900 disabled:opacity-30 transition-all"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Edit Modal */}
            {modalOpen && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
                    <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl animate-fade-in">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white">{isEditing ? 'Edit Attendance' : 'Add Attendance'}</h2>
                            <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={formik.handleSubmit} className="space-y-4">
                            {!isEditing && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">Teacher</label>
                                        <select
                                            name="teacher"
                                            className="w-full glass-input py-2.5 text-slate-800 dark:text-slate-200"
                                            value={formik.values.teacher}
                                            onChange={formik.handleChange}
                                        >
                                            <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Select Teacher</option>
                                            {teachers.map(t => (
                                                <option key={t._id} value={t._id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">Date</label>
                                        <input
                                            name="date"
                                            type="date"
                                            className="w-full glass-input py-2.5 text-slate-800 dark:text-slate-200"
                                            value={formik.values.date}
                                            onChange={formik.handleChange}
                                        />
                                    </div>
                                </>
                            )}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">Status</label>
                                <select
                                    name="status"
                                    className="w-full glass-input py-2.5 text-slate-800 dark:text-slate-200"
                                    value={formik.values.status}
                                    onChange={formik.handleChange}
                                >
                                    <option value="Present" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Present</option>
                                    <option value="Late" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Late</option>
                                    <option value="Half Day" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Half Day</option>
                                    <option value="Absent" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Absent</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">Check-In Time</label>
                                <input
                                    name="checkInTime"
                                    type="datetime-local"
                                    className="w-full glass-input py-2.5 text-slate-800 dark:text-slate-200"
                                    value={formik.values.checkInTime}
                                    onChange={formik.handleChange}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">Check-Out Time</label>
                                <input
                                    name="checkOutTime"
                                    type="datetime-local"
                                    className="w-full glass-input py-2.5 text-slate-800 dark:text-slate-200"
                                    value={formik.values.checkOutTime}
                                    onChange={formik.handleChange}
                                />
                            </div>

                            <button type="submit" disabled={formik.isSubmitting} className="w-full py-3 mt-4 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-sky-500/20">
                                {formik.isSubmitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default AdminTeacherAttendance;
