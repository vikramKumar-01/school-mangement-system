import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
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
  Bell
} from 'lucide-react';

const MainLayout = () => {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-800 border-t-sky-500"></div>
      </div>
    );
  }

  // Sidebar navigation items based on user role
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['admin', 'teacher', 'student', 'parent'] },
    { name: 'Students', path: '/students', icon: Users, roles: ['admin', 'teacher'] },
    { name: 'Teachers', path: '/teachers', icon: GraduationCap, roles: ['admin'] },
    { name: 'Classes', path: '/classes', icon: BookOpen, roles: ['admin'] },
    { name: 'Fees', path: '/fees', icon: DollarSign, roles: ['admin', 'student'] },
    { name: 'Attendance', path: '/attendance', icon: CalendarCheck, roles: ['admin', 'teacher', 'student', 'parent'] },
    { name: 'Profile', path: '/profile', icon: User, roles: ['admin', 'teacher', 'student', 'parent'] },
  ];

  // Filter menu items by user role
  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user.role));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
      
      {/* 1. Mobile Drawer Sidebar (with absolute overlay) */}
      <div className={`fixed inset-0 z-50 flex lg:hidden transition-opacity duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" 
          onClick={() => setMobileOpen(false)}
        ></div>
        
        {/* Drawer panel */}
        <div className={`relative flex w-full max-w-xs flex-1 flex-col bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex h-16 items-center justify-between px-6 border-b border-slate-850">
            <span className="text-xl font-bold bg-gradient-to-r from-sky-400 to-indigo-500 bg-clip-text text-transparent">Apex Academy</span>
            <button 
              type="button" 
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
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
                      ? 'bg-sky-500/10 text-sky-400 border-l-2 border-sky-400' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="h-5 w-5" />
              Log Out
            </button>
          </div>
        </div>
      </div>

      {/* 2. Desktop Sidebar */}
      <aside 
        className={`hidden lg:flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 shrink-0 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800/80">
          {!sidebarCollapsed && (
            <span className="text-xl font-bold bg-gradient-to-r from-sky-400 to-indigo-500 bg-clip-text text-transparent">
              Apex Academy
            </span>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white ml-auto"
          >
            <Menu className="h-5 w-5" />
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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                  isActive 
                    ? 'bg-sky-500/10 text-sky-400 border-l-2 border-sky-400' 
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-100'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!sidebarCollapsed && <span>{item.name}</span>}
                {sidebarCollapsed && (
                  <div className="absolute left-20 scale-0 group-hover:scale-100 bg-slate-800 text-white text-xs px-2 py-1.5 rounded-md shadow-lg transition-all z-55 pointer-events-none whitespace-nowrap">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!sidebarCollapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* 3. Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Navbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/60 px-6 backdrop-blur-md">
          {/* Left panel */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden sm:block">
              <span className="text-sm font-medium text-slate-400">Welcome back,</span>
              <h2 className="text-lg font-bold text-white leading-none mt-0.5">{user.fullName}</h2>
            </div>
          </div>

          {/* Right panel */}
          <div className="flex items-center gap-4">
            {/* Notification Icon */}
            <button className="relative rounded-xl p-2 text-slate-400 hover:bg-slate-800/80 hover:text-white transition-all">
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-sky-500"></span>
              <Bell className="h-5 w-5" />
            </button>

            {/* Profile Menu Dropdown Button */}
            <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
              <Link to="/profile" className="flex items-center gap-2.5 group">
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-slate-700 border border-slate-650 group-hover:border-sky-500 transition-all">
                  {user.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt={user.fullName} 
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-bold text-slate-300 text-sm">
                      {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                    </div>
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-white group-hover:text-sky-400 transition-all leading-tight">{user.fullName}</p>
                  <p className="text-[10px] text-slate-500 capitalize leading-none mt-0.5">{user.role}</p>
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
