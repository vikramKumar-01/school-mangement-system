import React, { useEffect, useState } from 'react';
import { contactService } from '../services/contact.service';
import { Mail, AlertCircle, RefreshCw, MessageSquare, Clock, CheckCheck, Eye } from 'lucide-react';

const STATUS_COLORS = {
  new: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  read: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  replied: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
};

const STATUS_ICONS = {
  new: MessageSquare,
  read: Eye,
  replied: CheckCheck,
};

const ContactMessages = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedMsg, setSelectedMsg] = useState(null);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await contactService.getAll({
        page,
        limit: 10,
        ...(filterStatus ? { status: filterStatus } : {}),
      });
      setContacts(data.contacts);
      setTotalPages(data.pagination.totalPages);
      setTotalContacts(data.pagination.totalContacts);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load contact messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [page, filterStatus]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      await contactService.updateStatus(id, newStatus);
      setContacts((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: newStatus } : c))
      );
      if (selectedMsg?._id === id) {
        setSelectedMsg((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const openMessage = (msg) => {
    setSelectedMsg(msg);
    // Auto-mark as read when opened
    if (msg.status === 'new') {
      handleStatusChange(msg._id, 'read');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Contact Messages
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Inquiries submitted via the "Get in Touch" form on the landing page.
          </p>
        </div>
        <button
          onClick={fetchContacts}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 p-4 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Filter & count bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
        <div className="flex items-center gap-2 flex-wrap">
          {['', 'new', 'read', 'replied'].map((s) => (
            <button
              key={s}
              onClick={() => { setFilterStatus(s); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Total: <span className="text-slate-800 dark:text-white font-bold">{totalContacts}</span>
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Messages List */}
        <div className="lg:col-span-5 space-y-3">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-blue-500" />
            </div>
          ) : contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
              <Mail className="h-10 w-10 text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-slate-500 dark:text-slate-400">No messages found.</p>
            </div>
          ) : (
            contacts.map((msg) => {
              const StatusIcon = STATUS_ICONS[msg.status];
              const isSelected = selectedMsg?._id === msg._id;
              return (
                <button
                  key={msg._id}
                  onClick={() => openMessage(msg)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 space-y-2 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {msg.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {msg.email}
                      </p>
                    </div>
                    <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_COLORS[msg.status]}`}>
                      <StatusIcon className="h-3 w-3" />
                      {msg.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                    {msg.subject}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Clock className="h-3 w-3 shrink-0" />
                    {formatDate(msg.createdAt)}
                  </p>
                </button>
              );
            })
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="rounded-lg border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                Previous
              </button>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Page <span className="font-bold text-slate-800 dark:text-white">{page}</span> of{' '}
                <span className="font-bold text-slate-800 dark:text-white">{totalPages}</span>
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="rounded-lg border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Message Detail Panel */}
        <div className="lg:col-span-7">
          {selectedMsg ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 sticky top-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedMsg.subject}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {formatDate(selectedMsg.createdAt)}
                  </p>
                </div>
                <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${STATUS_COLORS[selectedMsg.status]}`}>
                  {selectedMsg.status}
                </span>
              </div>

              {/* Sender info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">From</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{selectedMsg.name}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Email</p>
                  <a
                    href={`mailto:${selectedMsg.email}`}
                    className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {selectedMsg.email}
                  </a>
                </div>
              </div>

              {/* Message body */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Message</p>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedMsg.message}
                </div>
              </div>

              {/* Status Actions */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Update Status
                </p>
                <div className="flex gap-2 flex-wrap">
                  {['new', 'read', 'replied'].map((s) => (
                    <button
                      key={s}
                      disabled={selectedMsg.status === s || updatingId === selectedMsg._id}
                      onClick={() => handleStatusChange(selectedMsg._id, s)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:pointer-events-none ${
                        selectedMsg.status === s
                          ? STATUS_COLORS[s] + ' cursor-default'
                          : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {updatingId === selectedMsg._id ? '...' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}

                  {/* Reply via email */}
                  <a
                    href={`mailto:${selectedMsg.email}?subject=Re: ${encodeURIComponent(selectedMsg.subject)}`}
                    className="ml-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition-all inline-flex items-center gap-1.5"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Reply via Email
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-16 text-center h-full min-h-64">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                <MessageSquare className="h-7 w-7" />
              </div>
              <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
                Select a message to view its full details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactMessages;
