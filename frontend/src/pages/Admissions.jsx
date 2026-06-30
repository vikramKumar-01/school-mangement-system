import React, { useEffect, useState } from 'react';
import { admissionService } from '../services/admission.service';
import { 
  ClipboardList, Search, Eye, Filter, CheckCircle, XCircle, 
  User, Mail, Phone, Calendar, AlertCircle, RefreshCw, MapPin, 
  ShieldAlert, BookOpen, Layers, Users, RefreshCcw
} from 'lucide-react';

const STATUS_COLORS = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  reviewed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  contacted: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

const Admissions = () => {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalApplications, setTotalApplications] = useState(0);
  const [selectedApp, setSelectedApp] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await admissionService.getAll({
        page,
        limit: 10,
        status: statusFilter,
        search,
      });
      setAdmissions(data.applications);
      setTotalPages(data.pagination.totalPages);
      setTotalApplications(data.pagination.totalApplications);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch admission applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, [page, statusFilter, search]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      setStatusUpdating(true);
      const updated = await admissionService.updateStatus(id, newStatus);
      // Update in local state
      setAdmissions(prev => prev.map(app => app._id === id ? { ...app, status: newStatus } : app));
      if (selectedApp?._id === id) {
        setSelectedApp(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <ClipboardList className="h-8 w-8 text-sky-400" /> Admission Applications
          </h1>
          <p className="mt-1 text-sm text-slate-400">View and manage online student registrations and inquiries.</p>
        </div>
        <button
          onClick={fetchAdmissions}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300 hover:text-white px-4 py-2.5 text-xs font-semibold transition-all"
        >
          <RefreshCcw className="h-3.5 w-3.5" /> Reload List
        </button>
      </div>

      {/* Filters Card */}
      <div className="glass-panel rounded-3xl p-5 flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by student or father's name..."
            className="w-full glass-input pl-10 py-2.5 text-xs"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        {/* Status Filter */}
        <div className="relative w-full md:w-64 flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500 shrink-0" />
          <select
            className="w-full glass-input py-2.5 text-xs appearance-none"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="" className="bg-slate-900">All Statuses</option>
            <option value="pending" className="bg-slate-900">Pending</option>
            <option value="reviewed" className="bg-slate-900">Reviewed</option>
            <option value="contacted" className="bg-slate-900">Contacted</option>
            <option value="approved" className="bg-slate-900">Approved</option>
            <option value="rejected" className="bg-slate-900">Rejected</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* List Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800/80">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-800 border-t-sky-500" />
          </div>
        ) : admissions.length === 0 ? (
          <div className="text-center py-20 text-slate-500 space-y-2">
            <ClipboardList className="h-12 w-12 text-slate-700 mx-auto" />
            <p className="text-sm">No applications found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-850 bg-slate-900/30 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4">Parent Details</th>
                  <th className="px-6 py-4">Date Applied</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-300">
                {admissions.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full overflow-hidden bg-slate-850 border border-slate-800 flex items-center justify-center shrink-0">
                          {app.studentPhoto ? (
                            <img src={app.studentPhoto} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <User className="h-4 w-4 text-slate-550" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{`${app.firstName} ${app.lastName}`}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-mono">{app.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-sky-400">Class {app.classApplied}</span>
                    </td>
                    <td className="px-6 py-4 space-y-0.5">
                      <p className="font-medium text-slate-200">{app.fatherFullName}</p>
                      <p className="font-mono text-slate-500 text-[10px]">{app.fatherPhone}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-450">
                      {formatDate(app.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${STATUS_COLORS[app.status]}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          app.status === 'pending' ? 'bg-amber-400' :
                          app.status === 'approved' ? 'bg-emerald-400' :
                          app.status === 'rejected' ? 'bg-rose-400' : 'bg-blue-400'
                        }`} />
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-bold transition-all text-[11px]"
                      >
                        <Eye className="h-3.5 w-3.5" /> View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-850 px-6 py-4 bg-slate-900/10">
            <span className="text-[11px] text-slate-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="rounded-lg bg-slate-800 hover:bg-slate-750 px-3 py-1.5 text-xs text-slate-350 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="rounded-lg bg-slate-800 hover:bg-slate-750 px-3 py-1.5 text-xs text-slate-350 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal View application details */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/40">
              <div className="flex items-center gap-2.5">
                <ClipboardList className="h-5 w-5 text-sky-400" />
                <h3 className="text-lg font-bold text-white">Application Reference ID: <span className="font-mono text-sky-400">{selectedApp._id.slice(-6).toUpperCase()}</span></h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="rounded-lg p-1.5 text-slate-450 hover:bg-slate-800 hover:text-white"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-sm">
              <div className="grid gap-6 md:grid-cols-3">
                {/* Left side: Photo & Summary */}
                <div className="md:col-span-1 space-y-4 text-center">
                  <div className="mx-auto h-36 w-36 rounded-2xl overflow-hidden bg-slate-850 border-2 border-slate-800 shadow-lg flex items-center justify-center">
                    {selectedApp.studentPhoto ? (
                      <img src={selectedApp.studentPhoto} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-12 w-12 text-slate-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white leading-tight">{`${selectedApp.firstName} ${selectedApp.middleName || ''} ${selectedApp.lastName}`}</h4>
                    <p className="text-sky-400 font-bold mt-1 text-xs uppercase bg-sky-500/10 px-3 py-1 rounded-full inline-block">Class {selectedApp.classApplied}</p>
                  </div>
                  
                  {/* Status update box */}
                  <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-2xl text-left space-y-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Modify Status</span>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                      {['reviewed', 'contacted', 'approved', 'rejected'].map(st => (
                        <button
                          key={st}
                          disabled={statusUpdating}
                          onClick={() => handleStatusUpdate(selectedApp._id, st)}
                          className={`px-2.5 py-1.5 rounded-lg capitalize border transition-all active:scale-[0.98] ${
                            selectedApp.status === st 
                              ? 'bg-blue-600 border-blue-500 text-white shadow-md' 
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Side: Details tabs or grid */}
                <div className="md:col-span-2 space-y-6">
                  {/* Tab 1: Student Details */}
                  <div className="space-y-4">
                    <h5 className="font-bold text-white text-xs uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                      <User className="h-4 w-4" /> Student Details
                    </h5>
                    <div className="grid gap-3 sm:grid-cols-2 bg-slate-950/30 p-4 border border-slate-850 rounded-2xl">
                      <div>
                        <span className="text-slate-550 text-xs">Date of Birth</span>
                        <p className="font-semibold text-slate-200">{formatDate(selectedApp.dateOfBirth)}</p>
                      </div>
                      <div>
                        <span className="text-slate-550 text-xs">Gender</span>
                        <p className="font-semibold text-slate-200 capitalize">{selectedApp.gender}</p>
                      </div>
                      <div>
                        <span className="text-slate-550 text-xs">Blood Group</span>
                        <p className="font-semibold text-slate-200">{selectedApp.bloodGroup || '—'}</p>
                      </div>
                      <div>
                        <span className="text-slate-550 text-xs">Category</span>
                        <p className="font-semibold text-slate-200">{selectedApp.category}</p>
                      </div>
                      <div>
                        <span className="text-slate-550 text-xs">Religion</span>
                        <p className="font-semibold text-slate-200">{selectedApp.religion}</p>
                      </div>
                      <div>
                        <span className="text-slate-550 text-xs">Nationality</span>
                        <p className="font-semibold text-slate-200">{selectedApp.nationality}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-550 text-xs">Aadhaar Number</span>
                        <p className="font-mono font-semibold text-slate-200">{selectedApp.aadhaarNumber || '—'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Tab 2: Parent Details */}
                  <div className="space-y-4">
                    <h5 className="font-bold text-white text-xs uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                      <Users className="h-4 w-4" /> Parent Details
                    </h5>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Father */}
                      <div className="bg-slate-950/30 p-4 border border-slate-850 rounded-2xl space-y-2">
                        <p className="text-xs font-bold text-sky-400 uppercase tracking-wide">Father info</p>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Full Name</span>
                          <p className="font-semibold text-slate-200">{selectedApp.fatherFullName}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Phone / Mobile</span>
                          <p className="font-semibold text-slate-200 font-mono">{selectedApp.fatherPhone}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Email Address</span>
                          <p className="text-slate-200 break-all">{selectedApp.fatherEmail || '—'}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Occupation &amp; Qualification</span>
                          <p className="text-xs text-slate-300 font-semibold">{`${selectedApp.fatherOccupation} (${selectedApp.fatherQualification})`}</p>
                        </div>
                      </div>

                      {/* Mother */}
                      <div className="bg-slate-950/30 p-4 border border-slate-850 rounded-2xl space-y-2">
                        <p className="text-xs font-bold text-rose-455 uppercase tracking-wide">Mother info</p>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Full Name</span>
                          <p className="font-semibold text-slate-200">{selectedApp.motherFullName}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Phone / Mobile</span>
                          <p className="font-semibold text-slate-200 font-mono">{selectedApp.motherPhone}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Email Address</span>
                          <p className="text-slate-200 break-all">{selectedApp.motherEmail || '—'}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Occupation &amp; Qualification</span>
                          <p className="text-xs text-slate-300 font-semibold">{`${selectedApp.motherOccupation} (${selectedApp.motherQualification})`}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tab 3: Address & Emergency Contact */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Address */}
                    <div className="space-y-3">
                      <h5 className="font-bold text-white text-xs uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" /> Address
                      </h5>
                      <div className="bg-slate-950/30 p-4 border border-slate-850 rounded-2xl space-y-1.5">
                        <p className="font-semibold text-slate-200 leading-relaxed">{selectedApp.currentAddress}</p>
                        <p className="text-xs text-slate-400 font-semibold">{`${selectedApp.city}, ${selectedApp.state} - ${selectedApp.pinCode}`}</p>
                        <p className="text-[10px] text-slate-550 uppercase tracking-widest">{selectedApp.country}</p>
                      </div>
                    </div>

                    {/* Emergency */}
                    <div className="space-y-3">
                      <h5 className="font-bold text-white text-xs uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                        <Phone className="h-4 w-4" /> Emergency Contact
                      </h5>
                      <div className="bg-slate-950/30 p-4 border border-slate-850 rounded-2xl space-y-2">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Contact Name</span>
                          <p className="font-semibold text-slate-250">{selectedApp.emergencyName}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Relationship</span>
                          <p className="text-xs text-slate-300 capitalize">{selectedApp.emergencyRelationship}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Mobile Number</span>
                          <p className="font-semibold text-slate-200 font-mono">{selectedApp.emergencyPhone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admissions;
