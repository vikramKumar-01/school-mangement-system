import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from '../components/NotificationBell';
import { teacherService } from '../services/teacher.service';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  DollarSign, 
  CalendarCheck, 
  User, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  FileText,
  ClipboardList,
  AlertTriangle,
  Shield,
  Award
} from 'lucide-react';

const MainLayout = () => {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [teacherPermissions, setTeacherPermissions] = useState(null);

  useEffect(() => {
    const fetchTeacherPerms = async () => {
      if (user?.role === 'teacher') {
        const res = await teacherService.getAll({ userId: user._id, limit: 1 }).catch(() => null);
        const match = res?.teachers?.[0];
        setTeacherPermissions(match?.permissions || null);
      }
    };
    fetchTeacherPerms();
  }, [user]);

  // If not authenticated, redirect to login
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-blue-650"></div>
      </div>
    );
  }

  // Sidebar navigation items based on user role
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'teacher', 'student', 'parent'] },
    { name: 'Students', path: '/dashboard/students', icon: Users, roles: ['admin', 'teacher'] },
    { name: 'Teachers', path: '/dashboard/teachers', icon: GraduationCap, roles: ['admin'] },
    { name: 'Classes', path: '/dashboard/classes', icon: BookOpen, roles: ['admin', 'teacher'] },
    { name: 'Fees', path: '/dashboard/fees', icon: DollarSign, roles: ['admin', 'student'] },
    { name: 'Student Attendance', path: '/dashboard/attendance', icon: CalendarCheck, roles: ['admin', 'teacher', 'student', 'parent'] },
    { name: 'My Attendance', path: '/dashboard/my-attendance', icon: CalendarCheck, roles: ['teacher'] },
    { name: 'Academic Progress', path: '/dashboard/academic-progress', icon: Award, roles: ['admin', 'teacher', 'student', 'parent'] },
    { name: 'Messages', path: '/dashboard/messages', icon: MessageSquare, roles: ['admin'] },
    { name: 'Admissions', path: '/dashboard/admissions', icon: ClipboardList, roles: ['admin'] },
    { name: 'Permissions', path: '/dashboard/permissions', icon: Shield, roles: ['admin'] },
    { name: 'Teacher Attendance', path: '/dashboard/admin-attendance', icon: CalendarCheck, roles: ['admin'] },
    { name: 'Holidays', path: '/dashboard/holidays', icon: BookOpen, roles: ['admin'] },
    { name: 'School Settings', path: '/dashboard/settings', icon: FileText, roles: ['admin'] },
    { name: 'Profile', path: '/dashboard/profile', icon: User, roles: ['admin', 'teacher', 'student', 'parent'] },
  ];

  // Filter menu items by user role and permissions
  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles.includes(user.role)) return false;
    if (item.name === 'Classes' && user.role === 'teacher') {
      return teacherPermissions?.manageClasses === true;
    }
    if (item.name === 'Academic Progress' && user.role === 'teacher') {
      return teacherPermissions?.academicProgress !== false;
    }
    return true;
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* 1. Mobile Drawer Sidebar (with absolute overlay) */}
      <div className={`fixed inset-0 z-50 flex lg:hidden transition-opacity duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" 
          onClick={() => setMobileOpen(false)}
        ></div>
        
        {/* Drawer panel */}
        <div className={`relative flex w-full max-w-xs flex-1 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800/80">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent font-heading">Apex Academy</span>
            <button 
              type="button" 
              className="rounded-lg p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-blue-600/10 text-blue-600 dark:text-sky-400 border-l-2 border-blue-600 dark:border-sky-400' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-655 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer"
            >
              <LogOut className="h-5 w-5 text-red-500" />
              Log Out
            </button>
          </div>
        </div>
      </div>

      {/* 2. Desktop Sidebar */}
      <aside 
        className={`hidden lg:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 shrink-0 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800/80">
          {!sidebarCollapsed && (
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent font-heading">
              Apex Academy
            </span>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="rounded-lg p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 ml-auto cursor-pointer"
          >
            {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group relative ${
                  isActive 
                    ? 'bg-blue-600/10 text-blue-600 dark:text-sky-400 border-l-2 border-blue-600 dark:border-sky-400 font-semibold' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!sidebarCollapsed && <span>{item.name}</span>}
                {sidebarCollapsed && (
                  <div className="absolute left-20 scale-0 group-hover:scale-100 bg-slate-850 dark:bg-slate-800 text-white text-xs px-2 py-1.5 rounded-md shadow-lg transition-all z-55 pointer-events-none whitespace-nowrap">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!sidebarCollapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* 3. Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Navbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/60 px-6 backdrop-blur-md transition-colors duration-300">
          {/* Left panel */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="rounded-lg p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden sm:block">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Welcome back,</span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-none mt-0.5">{user.fullName}</h2>
            </div>
          </div>

          {/* Right panel */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="rounded-xl p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-655 dark:text-slate-300 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Notification Bell (role-aware, live data) */}
            <NotificationBell userRole={user.role} />

            {/* Profile Menu Dropdown Button */}
            <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-4">
              <Link to="/dashboard/profile" className="flex items-center gap-2.5 group">
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-650 group-hover:border-blue-500 transition-all">
                  {user.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt={user.fullName} 
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-bold text-slate-650 dark:text-slate-300 text-sm">
                      {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                    </div>
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-all leading-tight">{user.fullName}</p>
                  <p className="text-[10px] text-slate-500 capitalize leading-none mt-0.5">{user.role}</p>
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Password Change Warning Banner */}
        {user?.mustChangePassword && (
          <div className="flex items-center gap-3 bg-amber-500/10 border-b border-amber-500/30 px-6 py-3 shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
            <p className="text-sm text-amber-300 flex-1">
              <span className="font-bold">Security Notice:</span> You are using a system-generated password. Please change it immediately to secure your account.
            </p>
            <Link
              to="/dashboard/profile"
              className="shrink-0 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-bold px-3 py-1.5 transition-colors"
            >
              Change Password
            </Link>
          </div>
        )}

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
