import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  Bell, MessageSquare, DollarSign, CalendarCheck,
  CheckCheck, X, ExternalLink, Users, RefreshCw,
} from 'lucide-react';
import api from '../api/axios';

const NotificationBell = ({ userRole }) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const bellRef = useRef(null);

  const getReadIds = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem(`readNotifications_${userRole}`) || '[]');
    } catch {
      return [];
    }
  }, [userRole]);

  // ── Position the fixed dropdown below the bell button ────────────────────
  const calcPos = useCallback(() => {
    if (!bellRef.current) return;
    const rect = bellRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
  }, []);

  // ── Fetch notifications ──────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!userRole) return;
    setLoading(true);
    try {
      const items = [];

      if (userRole === 'admin') {
        try {
          const res = await api.get('/contact', { params: { status: 'new', limit: 5 } });
          const { contacts, pagination } = res.data.data;
          if (pagination.totalContacts > 0) {
            items.push({
              id: 'contact-new',
              Icon: MessageSquare,
              iconBg: 'bg-blue-100 dark:bg-blue-950/60',
              iconColor: 'text-blue-600 dark:text-blue-400',
              title: `${pagination.totalContacts} New Contact ${pagination.totalContacts === 1 ? 'Inquiry' : 'Inquiries'}`,
              body: contacts[0] ? `From ${contacts[0].name}: "${contacts[0].subject}"` : 'You have unread contact messages.',
              link: '/dashboard/messages',
              linkLabel: 'View Messages',
              unread: true,
            });
          }
        } catch (_) {}

        try {
          const res = await api.get('/students', { params: { limit: 1 } });
          const total = res.data.data?.pagination?.totalStudents;
          if (total !== undefined) {
            items.push({
              id: 'students-total',
              Icon: Users,
              iconBg: 'bg-emerald-100 dark:bg-emerald-950/60',
              iconColor: 'text-emerald-600 dark:text-emerald-400',
              title: `${total} Student${total !== 1 ? 's' : ''} Enrolled`,
              body: 'Total active students currently in the system.',
              link: '/dashboard/students',
              linkLabel: 'Manage Students',
              unread: false,
            });
          }
        } catch (_) {}
      }

      if (userRole === 'admin' || userRole === 'teacher') {
        items.push({
          id: 'attendance-reminder',
          Icon: CalendarCheck,
          iconBg: 'bg-amber-100 dark:bg-amber-950/60',
          iconColor: 'text-amber-600 dark:text-amber-400',
          title: 'Daily Attendance Reminder',
          body: "Don't forget to mark student attendance for today's classes.",
          link: '/dashboard/attendance',
          linkLabel: 'Mark Attendance',
          unread: true,
        });
      }

      if (userRole === 'student') {
        try {
          const res = await api.get('/fees', { params: { limit: 10 } });
          const pending = (res.data.data?.fees || []).filter(
            (f) => f.status === 'pending' || f.status === 'overdue'
          );
          if (pending.length > 0) {
            items.push({
              id: 'fee-pending',
              Icon: DollarSign,
              iconBg: 'bg-red-100 dark:bg-red-950/60',
              iconColor: 'text-red-600 dark:text-red-400',
              title: `${pending.length} Fee Payment${pending.length > 1 ? 's' : ''} Due`,
              body: 'You have outstanding fee payments. Please clear them on time.',
              link: '/dashboard/fees',
              linkLabel: 'View Fees',
              unread: true,
            });
          }
        } catch (_) {}
        items.push({
          id: 'attendance-check',
          Icon: CalendarCheck,
          iconBg: 'bg-blue-100 dark:bg-blue-950/60',
          iconColor: 'text-blue-600 dark:text-blue-400',
          title: 'Your Attendance Record',
          body: 'Check your latest attendance history and absence logs.',
          link: '/dashboard/attendance',
          linkLabel: 'View Attendance',
          unread: false,
        });
      }

      if (userRole === 'parent') {
        items.push({
          id: 'parent-attendance',
          Icon: CalendarCheck,
          iconBg: 'bg-indigo-100 dark:bg-indigo-950/60',
          iconColor: 'text-indigo-600 dark:text-indigo-400',
          title: "Child's Attendance",
          body: "Monitor your child's daily attendance and check for any absences.",
          link: '/dashboard/attendance',
          linkLabel: 'View Attendance',
          unread: true,
        });
      }

      const readIds = getReadIds();
      const updatedItems = items.map(item => ({
        ...item,
        unread: item.unread && !readIds.includes(item.id)
      }));

      setNotifications(updatedItems);
      setUnreadCount(updatedItems.filter((n) => n.unread).length);
    } catch (err) {
      console.error('Notification fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [userRole]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // Auto-refresh every 60s
  useEffect(() => {
    const id = setInterval(fetchNotifications, 60000);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  // Reposition on scroll / resize while open
  useEffect(() => {
    if (!open) return;
    calcPos();
    window.addEventListener('scroll', calcPos, true);
    window.addEventListener('resize', calcPos);
    return () => {
      window.removeEventListener('scroll', calcPos, true);
      window.removeEventListener('resize', calcPos);
    };
  }, [open, calcPos]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      const dropdown = document.getElementById('notif-dropdown');
      if (
        bellRef.current && !bellRef.current.contains(e.target) &&
        dropdown && !dropdown.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => { calcPos(); setOpen((o) => !o); };
  const markAllRead = () => {
    const ids = notifications.map(n => n.id);
    const existing = getReadIds();
    localStorage.setItem(`readNotifications_${userRole}`, JSON.stringify([...new Set([...existing, ...ids])]));
    
    setNotifications((p) => p.map((n) => ({ ...n, unread: false })));
    setUnreadCount(0);
  };

  const markAsRead = (id) => {
    const existing = getReadIds();
    if (!existing.includes(id)) {
      localStorage.setItem(`readNotifications_${userRole}`, JSON.stringify([...existing, id]));
      setNotifications((p) => p.map((n) => n.id === id ? { ...n, unread: false } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setOpen(false);
  };

  // ── Dropdown via portal so it escapes parent overflow ────────────────────
  const dropdown = open ? (
    <div
      id="notif-dropdown"
      style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999 }}
      className="w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl shadow-black/10 dark:shadow-black/60 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-bold text-slate-800 dark:text-white">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 text-[10px] font-bold">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={fetchNotifications}
            title="Refresh"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              title="Mark all read"
              className="rounded-lg p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
            >
              <CheckCheck className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={() => setOpen(false)}
            title="Close"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-blue-500" />
            <p className="text-xs text-slate-400 dark:text-slate-500">Loading…</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10 px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
              <Bell className="h-5 w-5 text-slate-300 dark:text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">All caught up!</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">No new notifications right now.</p>
            </div>
          </div>
        ) : (
          notifications.map((notif) => {
            const { Icon } = notif;
            return (
              <div
                key={notif.id}
                className={`flex gap-3 px-4 py-3.5 transition-colors ${
                  notif.unread
                    ? 'bg-blue-50/70 dark:bg-blue-950/15 hover:bg-blue-50 dark:hover:bg-blue-950/25'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className={`shrink-0 flex h-9 w-9 items-center justify-center rounded-xl ${notif.iconBg}`}>
                  <Icon className={`h-4 w-4 ${notif.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1.5">
                    <p className={`text-xs font-semibold leading-snug ${
                      notif.unread ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'
                    }`}>
                      {notif.title}
                    </p>
                    {notif.unread && (
                      <span className="shrink-0 h-2 w-2 rounded-full bg-blue-500 mt-1" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5 line-clamp-2">
                    {notif.body}
                  </p>
                  {notif.link && (
                    <Link
                      to={notif.link}
                      onClick={() => markAsRead(notif.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-1.5"
                    >
                      {notif.linkLabel}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
        <span className="text-[10px] text-slate-400 dark:text-slate-500">Auto-refreshes every 60s</span>
        <button
          onClick={fetchNotifications}
          className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          Refresh now
        </button>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={bellRef}
        id="notification-bell-btn"
        onClick={handleOpen}
        aria-label="Open notifications"
        title="Notifications"
        className={`relative rounded-xl p-2 transition-all cursor-pointer ${
          open
            ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-black ring-2 ring-white dark:ring-slate-900 leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        <Bell className="h-5 w-5" />
      </button>

      {createPortal(dropdown, document.body)}
    </>
  );
};

export default NotificationBell;
