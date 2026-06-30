import React, { useEffect, useState } from 'react';
import { teacherService } from '../services/teacher.service';
import { settingsService } from '../services/settings.service';
import { Shield, Check, AlertCircle, RefreshCw, ToggleLeft, ToggleRight, CheckSquare, Square, Settings, UserCheck } from 'lucide-react';

const TeacherPermissions = () => {
  const [teachers, setTeachers] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [tRes, sRes] = await Promise.all([
        teacherService.getAll({ limit: 100 }).catch(() => ({ teachers: [] })),
        settingsService.getSettings().catch(() => null)
      ]);

      setTeachers(tRes?.teachers || []);
      setSettings(sRes || null);
    } catch (err) {
      setError('Failed to load permission parameters.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleAdmission = async () => {
    if (!settings) return;
    try {
      setSettingsSaving(true);
      setError('');
      setSuccess('');
      const updated = await settingsService.updateSettings({
        isAdmissionOpen: !settings.isAdmissionOpen
      });
      setSettings(updated);
      setSuccess(`Admissions intake is now ${!settings.isAdmissionOpen ? 'OPEN' : 'CLOSED'}!`);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update admissions status');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleTogglePermission = async (teacherId, fieldName, currentValue) => {
    try {
      setSavingId(teacherId);
      setError('');
      setSuccess('');

      const teacher = teachers.find(t => t._id === teacherId);
      if (!teacher) return;

      const currentPerms = teacher.permissions || {
        markAttendance: true,
        editStudent: false,
        createAssignment: true,
        logMarks: true,
        postNotice: true
      };

      const updatedPerms = {
        ...currentPerms,
        [fieldName]: !currentValue
      };

      await teacherService.update(teacherId, {
        permissions: updatedPerms
      });

      // Update local state lists
      setTeachers(prev => prev.map(t => {
        if (t._id === teacherId) {
          return {
            ...t,
            permissions: updatedPerms
          };
        }
        return t;
      }));

      setSuccess(`Updated permissions config for ${teacher.name}!`);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to modify teacher configurations');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Shield className="h-8 w-8 text-sky-400" /> Administrative Access & Permissions
        </h1>
        <p className="mt-1 text-sm text-slate-400">Configure global intake statuses and restrict features per teacher.</p>
      </div>

      {/* Message indicators */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 animate-shake">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400">
          <Check className="h-5 w-5 shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {/* Admissions Toggle Card */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden border border-slate-850">
        <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-blue-500/5 blur-3xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-400" /> Admissions Registration Toggle
            </h3>
            <p className="text-xs text-slate-450 leading-relaxed max-w-xl">
              Turn admissions intake status Open or Closed. When closed, public access to the registration pages will display an admissions closed alert screen, blocking new submissions.
            </p>
          </div>

          <button
            onClick={handleToggleAdmission}
            disabled={settingsSaving || !settings}
            className={`flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-bold text-white transition-all active:scale-[0.98] ${
              settings?.isAdmissionOpen 
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/15' 
                : 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/15'
            } disabled:opacity-50 min-h-[46px] cursor-pointer`}
          >
            {settingsSaving ? (
              <RefreshCw className="h-4.5 w-4.5 animate-spin" />
            ) : settings?.isAdmissionOpen ? (
              <ToggleRight className="h-5.5 w-5.5" />
            ) : (
              <ToggleLeft className="h-5.5 w-5.5" />
            )}
            Admissions Intake: <span className="font-extrabold uppercase">{settings?.isAdmissionOpen ? 'Open (True)' : 'Closed (False)'}</span>
          </button>
        </div>
      </div>

      {/* Teachers Permission Matrix Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-850">
        <div className="p-5 border-b border-slate-850 bg-slate-900/10">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-sky-400" /> Teacher Authorization Matrix
          </h3>
          <p className="text-xs text-slate-450 mt-1">Configure action permissions for each registered teacher below. Changes persist instantly.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-sky-500"></div>
          </div>
        ) : teachers.length === 0 ? (
          <div className="p-12 text-center text-slate-450">No teachers found in the register.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/40 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Teacher Profile</th>
                  <th className="px-6 py-4 text-center">Mark Attendance</th>
                  <th className="px-6 py-4 text-center">Add Students</th>
                  <th className="px-6 py-4 text-center">Edit Students</th>
                  <th className="px-6 py-4 text-center">Classes Page</th>
                  <th className="px-6 py-4 text-center">Academic Progress</th>
                  <th className="px-6 py-4 text-center">Create Assignment</th>
                  <th className="px-6 py-4 text-center">Log Exam Marks</th>
                  <th className="px-6 py-4 text-center">Post Notices</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-sm">
                {teachers.map(teacher => {
                  const perms = teacher.permissions || {
                    markAttendance: true,
                    addStudent: false,
                    editStudent: false,
                    manageClasses: false,
                    academicProgress: true,
                    createAssignment: true,
                    logMarks: true,
                    postNotice: true
                  };

                  const isSaving = savingId === teacher._id;

                  return (
                    <tr key={teacher._id} className="hover:bg-slate-850 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-white leading-tight">{teacher.name}</p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{teacher.subject || 'N/A'}</p>
                      </td>

                      {/* Attendance Toggle */}
                      <td className="px-6 py-4 text-center">
                        <button
                          disabled={isSaving}
                          onClick={() => handleTogglePermission(teacher._id, 'markAttendance', perms.markAttendance)}
                          className={`inline-flex items-center justify-center p-1.5 rounded-lg transition-colors cursor-pointer ${
                            perms.markAttendance 
                              ? 'text-emerald-450 hover:bg-emerald-500/10' 
                              : 'text-slate-500 hover:bg-slate-800'
                          }`}
                        >
                          {perms.markAttendance ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                        </button>
                      </td>

                      {/* Add Students Toggle */}
                      <td className="px-6 py-4 text-center">
                        <button
                          disabled={isSaving}
                          onClick={() => handleTogglePermission(teacher._id, 'addStudent', perms.addStudent)}
                          className={`inline-flex items-center justify-center p-1.5 rounded-lg transition-colors cursor-pointer ${
                            perms.addStudent 
                              ? 'text-emerald-450 hover:bg-emerald-500/10' 
                              : 'text-slate-500 hover:bg-slate-800'
                          }`}
                        >
                          {perms.addStudent ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                        </button>
                      </td>

                      {/* Edit Students Toggle */}
                      <td className="px-6 py-4 text-center">
                        <button
                          disabled={isSaving}
                          onClick={() => handleTogglePermission(teacher._id, 'editStudent', perms.editStudent)}
                          className={`inline-flex items-center justify-center p-1.5 rounded-lg transition-colors cursor-pointer ${
                            perms.editStudent 
                              ? 'text-emerald-450 hover:bg-emerald-500/10' 
                              : 'text-slate-500 hover:bg-slate-800'
                          }`}
                        >
                          {perms.editStudent ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                        </button>
                      </td>

                      {/* Manage Classes Toggle */}
                      <td className="px-6 py-4 text-center">
                        <button
                          disabled={isSaving}
                          onClick={() => handleTogglePermission(teacher._id, 'manageClasses', perms.manageClasses)}
                          className={`inline-flex items-center justify-center p-1.5 rounded-lg transition-colors cursor-pointer ${
                            perms.manageClasses 
                              ? 'text-emerald-450 hover:bg-emerald-500/10' 
                              : 'text-slate-500 hover:bg-slate-800'
                          }`}
                        >
                          {perms.manageClasses ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                        </button>
                      </td>

                      {/* Academic Progress Toggle */}
                      <td className="px-6 py-4 text-center">
                        <button
                          disabled={isSaving}
                          onClick={() => handleTogglePermission(teacher._id, 'academicProgress', perms.academicProgress)}
                          className={`inline-flex items-center justify-center p-1.5 rounded-lg transition-colors cursor-pointer ${
                            perms.academicProgress 
                              ? 'text-emerald-450 hover:bg-emerald-500/10' 
                              : 'text-slate-500 hover:bg-slate-800'
                          }`}
                        >
                          {perms.academicProgress ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                        </button>
                      </td>

                      {/* Assignment Toggle */}
                      <td className="px-6 py-4 text-center">
                        <button
                          disabled={isSaving}
                          onClick={() => handleTogglePermission(teacher._id, 'createAssignment', perms.createAssignment)}
                          className={`inline-flex items-center justify-center p-1.5 rounded-lg transition-colors cursor-pointer ${
                            perms.createAssignment 
                              ? 'text-emerald-450 hover:bg-emerald-500/10' 
                              : 'text-slate-500 hover:bg-slate-800'
                          }`}
                        >
                          {perms.createAssignment ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                        </button>
                      </td>

                      {/* Log Marks Toggle */}
                      <td className="px-6 py-4 text-center">
                        <button
                          disabled={isSaving}
                          onClick={() => handleTogglePermission(teacher._id, 'logMarks', perms.logMarks)}
                          className={`inline-flex items-center justify-center p-1.5 rounded-lg transition-colors cursor-pointer ${
                            perms.logMarks 
                              ? 'text-emerald-450 hover:bg-emerald-500/10' 
                              : 'text-slate-500 hover:bg-slate-800'
                          }`}
                        >
                          {perms.logMarks ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                        </button>
                      </td>

                      {/* Post Notice Toggle */}
                      <td className="px-6 py-4 text-center">
                        <button
                          disabled={isSaving}
                          onClick={() => handleTogglePermission(teacher._id, 'postNotice', perms.postNotice)}
                          className={`inline-flex items-center justify-center p-1.5 rounded-lg transition-colors cursor-pointer ${
                            perms.postNotice 
                              ? 'text-emerald-450 hover:bg-emerald-500/10' 
                              : 'text-slate-500 hover:bg-slate-800'
                          }`}
                        >
                          {perms.postNotice ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherPermissions;
