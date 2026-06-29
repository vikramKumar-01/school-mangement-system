import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Save, MapPin, Clock, School, AlertCircle } from 'lucide-react';
import { settingsService } from '../services/settings.service';

const SchoolSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');

    const formik = useFormik({
        initialValues: {
            schoolName: '',
            latitude: '',
            longitude: '',
            allowedRadius: '',
            workingHours: '',
            lateTime: '',
            defaultCheckInTime: '',
            defaultCheckOutTime: ''
        },
        validationSchema: Yup.object({
            schoolName: Yup.string().required('School Name is required'),
            latitude: Yup.number().required('Latitude is required').min(-90).max(90),
            longitude: Yup.number().required('Longitude is required').min(-180).max(180),
            allowedRadius: Yup.number().required('Allowed Radius is required').min(10),
            workingHours: Yup.number().required('Working Hours is required').min(1).max(24),
            lateTime: Yup.string().required('Late Time is required'),
            defaultCheckInTime: Yup.string().required('Default Check-In Time is required'),
            defaultCheckOutTime: Yup.string().required('Default Check-Out Time is required')
        }),
        onSubmit: async (values) => {
            try {
                setSaving(true);
                setError('');
                setSuccessMessage('');
                await settingsService.updateSettings(values);
                setSuccessMessage('School settings updated successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to update settings');
            } finally {
                setSaving(false);
            }
        }
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await settingsService.getSettings();
                formik.setValues({
                    schoolName: data.schoolName || '',
                    latitude: data.latitude || '',
                    longitude: data.longitude || '',
                    allowedRadius: data.allowedRadius || '',
                    workingHours: data.workingHours || '',
                    lateTime: data.lateTime || '',
                    defaultCheckInTime: data.defaultCheckInTime || '',
                    defaultCheckOutTime: data.defaultCheckOutTime || ''
                });
            } catch (err) {
                setError('Failed to fetch settings');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    formik.setFieldValue('latitude', position.coords.latitude);
                    formik.setFieldValue('longitude', position.coords.longitude);
                },
                (err) => {
                    setError('Failed to get current location. Ensure location access is allowed.');
                }
            );
        } else {
            setError('Geolocation is not supported by this browser.');
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                    <School className="h-8 w-8 text-sky-500" />
                    School Settings
                </h1>
                <p className="mt-2 text-slate-500 dark:text-slate-400">Configure global settings for location and attendance timings.</p>
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

            <div className="glass-panel rounded-2xl p-6 sm:p-8">
                <form onSubmit={formik.handleSubmit} className="space-y-8">
                    
                    {/* General Settings */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 mb-5">General Information</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">School Name</label>
                                <input
                                    name="schoolName"
                                    type="text"
                                    className="w-full glass-input"
                                    value={formik.values.schoolName}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                {formik.touched.schoolName && formik.errors.schoolName && (
                                    <p className="text-xs text-red-500 mt-1">{formik.errors.schoolName}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Geolocation Settings */}
                    <div>
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-5">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-sky-500" /> Geolocation Setup
                            </h3>
                            <button
                                type="button"
                                onClick={getCurrentLocation}
                                className="text-sm font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                            >
                                <MapPin className="h-4 w-4" /> Get Current Location
                            </button>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Latitude</label>
                                <input
                                    name="latitude"
                                    type="number"
                                    step="any"
                                    className="w-full glass-input font-mono"
                                    value={formik.values.latitude}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                {formik.touched.latitude && formik.errors.latitude && (
                                    <p className="text-xs text-red-500 mt-1">{formik.errors.latitude}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Longitude</label>
                                <input
                                    name="longitude"
                                    type="number"
                                    step="any"
                                    className="w-full glass-input font-mono"
                                    value={formik.values.longitude}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                {formik.touched.longitude && formik.errors.longitude && (
                                    <p className="text-xs text-red-500 mt-1">{formik.errors.longitude}</p>
                                )}
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Allowed Radius (meters)</label>
                                <input
                                    name="allowedRadius"
                                    type="number"
                                    className="w-full sm:w-1/2 glass-input"
                                    value={formik.values.allowedRadius}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                <p className="text-xs text-slate-500 mt-1">Teachers must be within this radius to mark attendance.</p>
                                {formik.touched.allowedRadius && formik.errors.allowedRadius && (
                                    <p className="text-xs text-red-500 mt-1">{formik.errors.allowedRadius}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Timing Settings */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-5">
                            <Clock className="h-5 w-5 text-sky-500" /> Timings & Work Hours
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Working Hours</label>
                                <input
                                    name="workingHours"
                                    type="number"
                                    className="w-full glass-input"
                                    value={formik.values.workingHours}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                {formik.touched.workingHours && formik.errors.workingHours && (
                                    <p className="text-xs text-red-500 mt-1">{formik.errors.workingHours}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Late Time (e.g. 09:15 AM)</label>
                                <input
                                    name="lateTime"
                                    type="text"
                                    placeholder="HH:MM AM/PM"
                                    className="w-full glass-input"
                                    value={formik.values.lateTime}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                {formik.touched.lateTime && formik.errors.lateTime && (
                                    <p className="text-xs text-red-500 mt-1">{formik.errors.lateTime}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Default Check-In</label>
                                <input
                                    name="defaultCheckInTime"
                                    type="text"
                                    placeholder="HH:MM AM/PM"
                                    className="w-full glass-input"
                                    value={formik.values.defaultCheckInTime}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                {formik.touched.defaultCheckInTime && formik.errors.defaultCheckInTime && (
                                    <p className="text-xs text-red-500 mt-1">{formik.errors.defaultCheckInTime}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Default Check-Out</label>
                                <input
                                    name="defaultCheckOutTime"
                                    type="text"
                                    placeholder="HH:MM AM/PM"
                                    className="w-full glass-input"
                                    value={formik.values.defaultCheckOutTime}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                {formik.touched.defaultCheckOutTime && formik.errors.defaultCheckOutTime && (
                                    <p className="text-xs text-red-500 mt-1">{formik.errors.defaultCheckOutTime}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-sky-500/20"
                        >
                            <Save className="h-5 w-5" />
                            {saving ? 'Saving Changes...' : 'Save Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SchoolSettings;
