import React, { useState, useEffect } from 'react';
import { MapPin, CheckCircle, Clock, AlertTriangle, Coffee } from 'lucide-react';
import { teacherAttendanceService } from '../services/teacherAttendance.service';

const TeacherGeolocationAttendance = () => {
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [todayRecord, setTodayRecord] = useState(null);
    const [error, setError] = useState('');
    const [location, setLocation] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchTodayAttendance = async () => {
        try {
            setLoading(true);
            const data = await teacherAttendanceService.getToday();
            setTodayRecord(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTodayAttendance();
    }, []);

    const getLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
            } else {
                navigator.geolocation.getCurrentPosition(
                    position => resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    }),
                    err => reject(new Error('Location access denied. Please allow location access to mark attendance.'))
                );
            }
        });
    };

    const handleCheckIn = async () => {
        try {
            setActionLoading(true);
            setError('');
            const coords = await getLocation();
            await teacherAttendanceService.checkIn(coords);
            await fetchTodayAttendance();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to check in');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCheckOut = async () => {
        try {
            setActionLoading(true);
            setError('');
            await teacherAttendanceService.checkOut();
            await fetchTodayAttendance();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to check out');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex justify-center items-center h-48">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-sky-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-sky-500/10 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                {/* Time & Status info */}
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center justify-center md:justify-start gap-2 mb-1">
                        <Clock className="h-5 w-5 text-sky-500" />
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </h2>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                        {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    
                    <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
                        <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl px-4 py-2 border border-slate-100 dark:border-slate-800/60">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Check-In</p>
                            <p className="text-sm font-black text-emerald-500">
                                {todayRecord?.checkInTime ? new Date(todayRecord.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                            </p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl px-4 py-2 border border-slate-100 dark:border-slate-800/60">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Check-Out</p>
                            <p className="text-sm font-black text-amber-500">
                                {todayRecord?.checkOutTime ? new Date(todayRecord.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                            </p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl px-4 py-2 border border-slate-100 dark:border-slate-800/60">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                            <p className="text-sm font-black text-sky-500">
                                {todayRecord?.status || 'Pending'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-center gap-3 md:items-end">
                    {error && (
                        <div className="text-xs font-bold text-red-500 flex items-center gap-1 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 max-w-xs text-center">
                            <AlertTriangle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {!todayRecord ? (
                        <button
                            onClick={handleCheckIn}
                            disabled={actionLoading}
                            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            <MapPin className="h-5 w-5" />
                            {actionLoading ? 'Verifying Location...' : 'Check-In Now'}
                        </button>
                    ) : !todayRecord.checkOutTime ? (
                        <button
                            onClick={handleCheckOut}
                            disabled={actionLoading}
                            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            <Coffee className="h-5 w-5" />
                            {actionLoading ? 'Processing...' : 'Check-Out'}
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-6 py-3 rounded-2xl font-black border border-slate-200 dark:border-slate-700">
                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                            Attendance Completed
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherGeolocationAttendance;
