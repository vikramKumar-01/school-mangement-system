import React, { useState, useEffect } from 'react';
import { CalendarCheck, AlertCircle, Clock } from 'lucide-react';
import { teacherAttendanceService } from '../services/teacherAttendance.service';
import useAuth from '../hooks/useAuth';

const TeacherMyAttendance = () => {
    const { user } = useAuth();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const res = await teacherAttendanceService.getHistory({ page, limit: 10 });
            // The getHistory API returns { docs, totalPages, etc... } if paginated, 
            // or just an array. Let's handle both.
            if (res.history) {
                setRecords(res.history);
                setTotalPages(res.pagination?.totalPages || 1);
            } else if (Array.isArray(res)) {
                setRecords(res);
                setTotalPages(1);
            } else {
                setRecords([]);
                setTotalPages(1);
            }
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to fetch attendance history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [page]);

    return (
        <div className="p-6 max-w-7xl mx-auto animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                    <CalendarCheck className="h-8 w-8 text-sky-500" />
                    My Attendance History
                </h1>
                <p className="mt-2 text-slate-500 dark:text-slate-400">View your daily check-in and check-out logs.</p>
            </div>

            {error && (
                <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-500">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-sky-500"></div>
                </div>
            ) : records.length === 0 ? (
                <div className="glass-panel rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <Clock className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Records Found</h3>
                    <p className="text-slate-600 dark:text-slate-400">You haven't checked in yet.</p>
                </div>
            ) : (
                <div className="glass-panel rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-100 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                                    <th className="p-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Date</th>
                                    <th className="p-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="p-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Check-In</th>
                                    <th className="p-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Check-Out</th>
                                    <th className="p-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest text-center">Working Hours</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                                {records.map((r) => {
                                    let statusColor = 'bg-slate-500/10 text-slate-500 border-slate-500/20 dark:text-slate-400';
                                    if (r.status === 'Present') statusColor = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400';
                                    if (r.status === 'Late') statusColor = 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400';
                                    if (r.status === 'Half Day') statusColor = 'bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400';
                                    if (r.status === 'Absent') statusColor = 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400';

                                    return (
                                        <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                                            <td className="p-4 text-slate-700 dark:text-slate-300 font-mono text-xs">
                                                {new Date(r.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${statusColor}`}>
                                                    {r.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                {r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' }) : '--:--'}
                                            </td>
                                            <td className="p-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                {r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' }) : '--:--'}
                                            </td>
                                            <td className="p-4 text-center font-bold text-slate-900 dark:text-white">
                                                {r.workingHours || '-'}
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
                        className="rounded-lg border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-30 transition-all cursor-pointer"
                    >
                        Previous
                    </button>
                    <span className="text-xs text-slate-500 dark:text-slate-450">
                        Page <span className="text-slate-900 dark:text-white font-semibold">{page}</span> of <span className="text-slate-900 dark:text-white font-semibold">{totalPages}</span>
                    </span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                        className="rounded-lg border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-30 transition-all cursor-pointer"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default TeacherMyAttendance;
