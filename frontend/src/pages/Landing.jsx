import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
  Menu, X, Check, Users, GraduationCap, BookOpen, DollarSign, 
  CalendarCheck, Clock, Mail, Phone, MapPin, Award, Shield, 
  ArrowRight, Heart, Star, Sparkles, Building, Play, Lock, UserCheck,
  Sun, Moon
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { contactService } from '../services/contact.service';

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState('');

  // Monitor scroll height to trigger solid white sticky header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Framer Motion variant options
  const fadeInUp = {
    initial: { opacity: 0, y: 25 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-100px' },
    transition: { duration: 0.6, ease: 'easeOut' }
  };

  const staggerContainer = {
    initial: {},
    whileInView: {
      transition: {
        staggerChildren: 0.1
      }
    },
    viewport: { once: true, margin: '-100px' }
  };

  // Formik + Yup setup for Landing Contact Form
  const contactForm = useFormik({
    initialValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required').trim(),
      email: Yup.string().email('Invalid email address').required('Email is required').trim(),
      subject: Yup.string().required('Subject is required').trim(),
      message: Yup.string().min(10, 'Message must be at least 10 characters').required('Message is required').trim(),
    }),
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      setContactError('');
      setContactSuccess(false);
      try {
        await contactService.submit(values);
        setContactSuccess(true);
        resetForm();
        setTimeout(() => setContactSuccess(false), 6000);
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          'Failed to send message. Please try again.';
        setContactError(msg);
      } finally {
        setSubmitting(false);
      }
    }
  });

  const features = [
    { title: 'Smart Attendance', desc: 'Real-time attendance logs with Instant notification alerts sent to parents.', icon: CalendarCheck },
    { title: 'Student Management', desc: 'Holistic database profiling for enrollment, bio-data, and performance metrics.', icon: Users },
    { title: 'Teacher Management', desc: 'Schedule classes, view lesson plan logs, and configure payroll.', icon: GraduationCap },
    { title: 'Online Fee Payment', desc: 'Invoices logged and cleared via safe digital payment processing.', icon: DollarSign },
    { title: 'Parent Portal', desc: 'Direct dashboard for parents to view student performance and reports.', icon: UserCheck },
    { title: 'Exam Management', desc: 'Grade book recording, schedule creation, and card report generations.', icon: Award },
    { title: 'Digital Notice Board', desc: 'Publish announcements and circulars instantly across student interfaces.', icon: Sparkles },
    { title: 'CCTV Security', desc: 'Strict campus monitoring protocols ensuring a completely safe space.', icon: Shield }
  ];

  const stats = [
    { value: '5000+', label: 'Students Enrolled' },
    { value: '250+', label: 'Expert Teachers' },
    { value: '98%', label: 'Board Results Pass Rate' },
    { value: '30+', label: 'Years of Excellence' }
  ];

  const facilities = [
    { title: 'Smart Classes', desc: 'Interactive multimedia whiteboards fostering immersive learning environments.' },
    { title: 'Computer Lab', desc: 'Equipped with modern high-speed systems and advanced developer SDK packages.' },
    { title: 'Modern Library', desc: 'Extensive repository of reference journals, digital books, and novels.' },
    { title: 'Science Lab', desc: 'Fully stocked equipment modules for chemical and biological experiments.' },
    { title: 'Sports Playground', desc: 'Comprehensive sports courts for basketball, football, and athletic exercises.' },
    { title: 'Medical Facility', desc: 'On-site nursing care, medical aids, and periodic physical diagnostics.' }
  ];

  const steps = [
    { id: 1, title: 'Student Registration', desc: 'Fill out details online in the portal.' },
    { id: 2, title: 'Admission Approval', desc: 'Staff review files and approve admissions.' },
    { id: 3, title: 'Member Login', desc: 'Students, parents, and teachers log in.' },
    { id: 4, title: 'Learning Dashboard', desc: 'Access schedules, classes, fees, and grades.' }
  ];

  const testimonials = [
    {
      name: 'Dr. Sarah Connor',
      role: 'Parent of Grade 9 Student',
      text: 'Apex Academy\'s online portal is incredibly convenient. I can review my daughter\'s attendance logs and grade reports instantly in real-time.',
      initials: 'SC',
      color: 'from-pink-500 to-rose-500'
    },
    {
      name: 'Prof. Richard Feynman',
      role: 'Head of Science Department',
      text: 'The digital dashboard organizes all my lesson schedules, grading pipelines, and attendance checklists. It lets me spend more time teaching.',
      initials: 'RF',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      name: 'Alexander Pierce',
      role: 'Alumni (Class of 2024)',
      text: 'The resources at Apex, from the computer labs to the mentorship, helped me build a solid foundation. The digital class notices kept us all aligned.',
      initials: 'AP',
      color: 'from-emerald-500 to-teal-500'
    }
  ];

  const gallery = [
    { title: 'School Building', image: '/school_campus.png', gradient: 'from-blue-600 to-indigo-700' },
    { title: 'Smart Classroom', image: '/smart_classroom.png', gradient: 'from-emerald-600 to-teal-700' },
    { title: 'Computer Lab', image: '/smart_classroom.png', gradient: 'from-violet-600 to-purple-700' },
    { title: 'Library', image: '/school_library.png', gradient: 'from-amber-600 to-orange-700' },
    { title: 'Science Lab', image: '/science_lab.png', gradient: 'from-rose-600 to-pink-700' },
    { title: 'Sports Playground', image: '/sports_ground.png', gradient: 'from-sky-600 to-blue-700' }
  ];

  const logins = [
    { role: 'Student', desc: 'Access classes, view report cards, and check attendance history.', icon: Users, path: '/login' },
    { role: 'Teacher', desc: 'Mark student attendance, manage grading cards, and schedules.', icon: GraduationCap, path: '/login' },
    { role: 'Parent', desc: 'Monitor student grades, clear invoices, and view notices.', icon: Heart, path: '/login' },
    { role: 'Administrator', desc: 'Global configure classrooms, staff profiles, and system settings.', icon: Shield, path: '/login' }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 selection:bg-blue-600/10 selection:text-blue-600 font-sans transition-colors duration-300">
      
      {/* ==================================================
          STUCKY TRANSPARENT HEADER
          ================================================== */}
      <header className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 py-3 shadow-sm' 
          : 'bg-transparent py-5'
      }`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">Apex Academy</span>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#home" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</a>
            <a href="#about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About</a>
            <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a>
            <a href="#gallery" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Gallery</a>
            <a href="#testimonials" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Testimonials</a>
            <a href="#contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</a>
          </nav>

          {/* Action buttons */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="rounded-xl p-2.5 border border-slate-200 dark:border-slate-800 text-slate-655 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            <Link 
              to="/apply" 
              className="px-4 py-2.5 rounded-xl border border-blue-600 dark:border-blue-500 text-sm font-bold text-blue-650 dark:text-sky-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all active:scale-95 shrink-0"
            >
              Apply Admission
            </Link>

            {isAuthenticated ? (
              <>
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  Hello, <span className="text-slate-900 dark:text-white font-bold">{user?.fullName}</span>
                </span>
                <Link 
                  to="/dashboard" 
                  className="px-4 py-2.5 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-500/10 hover:bg-blue-700 transition-all active:scale-95"
                >
                  Go to Dashboard
                </Link>
                <button 
                  onClick={logout}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all active:scale-95 cursor-pointer"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
                >
                  Member Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger menu & theme toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <button 
              onClick={toggleTheme}
              className="rounded-xl p-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button 
              type="button" 
              className="rounded-xl p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer (AnimatePresence) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Drawer Panel */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="relative flex w-full max-w-xs flex-1 flex-col bg-white dark:bg-slate-900 border-l border-slate-105 dark:border-slate-800 p-6 shadow-2xl ml-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="text-lg font-bold text-slate-900 dark:text-white">Navigation</span>
                <button 
                  type="button" 
                  className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <nav className="flex-1 space-y-2 py-6 text-base font-semibold text-slate-600 dark:text-slate-300">
                <a href="#home" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-all">Home</a>
                <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-all">About</a>
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-all">Features</a>
                <a href="#gallery" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-all">Gallery</a>
                <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-all">Testimonials</a>
                <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-all">Contact</a>
                <Link to="/apply" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl bg-blue-600/10 text-blue-600 dark:text-sky-400 font-bold transition-all border-l-2 border-blue-650 dark:border-sky-400">Apply Admission</Link>
              </nav>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-3">
                {isAuthenticated ? (
                  <>
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center">Logged in as <span className="font-bold text-slate-900 dark:text-white">{user?.fullName}</span></p>
                    <Link 
                      to="/dashboard" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex w-full items-center justify-center rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-all min-h-[44px]"
                    >
                      Go to Dashboard
                    </Link>
                    <button 
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 py-3 text-sm font-bold text-red-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all min-h-[44px] cursor-pointer"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex w-full items-center justify-center rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-all min-h-[44px]"
                    >
                      Member Login
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================================================
          HERO SECTION
          ================================================== */}
      <section id="home" className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-32 bg-slate-50/50 dark:bg-slate-900/10">
        {/* Animated Background Shapes */}
        <motion.div 
          animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-10 h-16 w-16 rounded-full bg-blue-455/10 blur-xl"
        />
        <motion.div 
          animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-1/4 right-1/4 h-24 w-24 rounded-full bg-indigo-455/10 blur-2xl"
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Side: Copywriting */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 text-left space-y-6"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
                <Sparkles className="h-4.5 w-4.5" />
                Modern School ERP Solution
              </span>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl leading-[1.1] font-heading">
                Nurturing Future Leaders in a <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Smart Classroom</span>
              </h1>
              <p className="text-base text-slate-650 dark:text-slate-300 sm:text-lg max-w-lg leading-relaxed">
                Connect students, parents, and teachers. Manage enrollments, logs, online fee collections, schedules, and grading report cards in one SaaS dashboard.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-2">
                {isAuthenticated ? (
                  <Link 
                    to="/dashboard" 
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-blue-500/15 hover:shadow-blue-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0 min-h-[44px]"
                  >
                    Go to Dashboard
                    <ArrowRight className="h-4.5 w-4.5" />
                  </Link>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-blue-500/15 hover:shadow-blue-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0 min-h-[44px]"
                    >
                      Member Login
                      <ArrowRight className="h-4.5 w-4.5" />
                    </Link>
                  </>
                )}
              </div>
            </motion.div>

            {/* Right Side: Graphic Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-6 relative flex justify-center"
            >
              <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 shadow-2xl">
                <img 
                  src="/hero_classroom.png" 
                  alt="Students in a smart classroom at Apex Academy" 
                  className="h-full w-full rounded-2xl object-cover aspect-[4/3] hover:scale-[1.02] transition-transform duration-700"
                  loading="eager"
                  onError={(e) => { e.target.onerror = null; e.target.style.display='none'; e.target.parentElement.classList.add('bg-gradient-to-br','from-blue-100','to-indigo-200','dark:from-blue-900','dark:to-indigo-900'); }}
                />
              </div>

              {/* Float Widget 1: Happy Students */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -left-6 bottom-10 hidden sm:flex items-center gap-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 shadow-xl"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                  <Award className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Academic Rating</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">A+ Top Category</p>
                </div>
              </motion.div>

              {/* Float Widget 2: Logged Attendance */}
              <motion.div 
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -right-6 top-10 hidden sm:flex items-center gap-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 shadow-xl"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
                  <CalendarCheck className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Live Attendance</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">98.5% Today</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================================================
          ABOUT SECTION
          ================================================== */}
      <section id="about" className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* About Image */}
            <motion.div 
              {...fadeInUp}
              className="lg:col-span-5 relative"
            >
              <div className="relative overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-900 aspect-[4/5] shadow-xl">
                <img 
                  src="/school_campus.png" 
                  alt="Apex Academy School Campus Building" 
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={(e) => { e.target.onerror = null; e.target.style.display='none'; e.target.parentElement.classList.add('bg-gradient-to-br','from-blue-100','to-indigo-200','dark:from-blue-900','dark:to-indigo-900'); }}
                />
              </div>
            </motion.div>

            {/* About text copywriting */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 text-left space-y-6"
            >
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Know Our Institute</span>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl font-heading">Empowering Generations of Excellence</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-355 leading-relaxed">
                Founded with a vision to nurture future innovators and scientists, Apex Academy has been at the forefront of quality primary and secondary education for over three decades. We incorporate smart digital systems and a robust, modern syllabus to equip students with creative thinking and problem-solving skills.
              </p>

              {/* Mission & Vision Grid */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
                    Our Mission
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    To deliver a curriculum combining advanced sciences, arts, and character ethics, fostering responsible global citizens.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
                    Our Vision
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    To set standards in academic instruction by building an environment of integrated, student-centered discovery.
                  </p>
                </div>
              </div>

              {/* Core Values values */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Our Core Values</h4>
                <div className="flex flex-wrap gap-2.5">
                  {['Academic Rigor', 'Ethical Character', 'Inclusive Culture', 'Creative Innovation', 'Physical Fitness'].map((val) => (
                    <span key={val} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-55 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 px-3.5 py-1.5 rounded-full transition-colors">
                      <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      {val}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================================================
          WHY CHOOSE US (FEATURES)
          ================================================== */}
      <section id="features" className="py-16 sm:py-24 bg-slate-50/50 dark:bg-slate-900/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-12">
          {/* Section Titles */}
          <motion.div {...fadeInUp} className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Advanced Features</span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl font-heading">Comprehensive Management Modules</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Everything necessary for school administrators, teachers, parents, and students in one digital application.</p>
          </motion.div>

          {/* Cards Grid */}
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: '-100px' }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div 
                  key={idx}
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm text-left space-y-4 hover:shadow-md transition-all duration-300 group"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <Icon className="h-5.5 w-5.5" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{feat.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ==================================================
          STATISTICS
          ================================================== */}
      <section className="py-16 bg-blue-600 text-white relative overflow-hidden">
        {/* Background light waves */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700"></div>
        
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 grid-cols-2 lg:grid-cols-4 text-center">
            {stats.map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="space-y-1.5"
              >
                <h3 className="text-4xl font-extrabold sm:text-5xl font-heading tracking-tight">{stat.value}</h3>
                <p className="text-xs font-medium text-blue-100 uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================
          FACILITIES SECTION
          ================================================== */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-12">
          {/* Section Titles */}
          <motion.div {...fadeInUp} className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Our Facilities</span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl font-heading">Modern Infrastructure & Amenities</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">We provide world-class amenities to ensure a comfortable and highly productive growth environment.</p>
          </motion.div>

          {/* Facilities Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {facilities.map((fac, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="bg-slate-55 dark:bg-slate-900/40 border border-slate-205 dark:border-slate-800 rounded-2xl p-6 text-left hover:bg-white dark:hover:bg-slate-900 hover:shadow-xl hover:border-white dark:hover:border-slate-700 transition-all duration-300"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 mb-4">
                  <Check className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{fac.title}</h3>
                <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed mt-1.5">{fac.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================
          HOW IT WORKS (TIMELINE)
          ================================================== */}
      <section className="py-16 sm:py-24 bg-slate-50/50 dark:bg-slate-900/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-16">
          {/* Section titles */}
          <motion.div {...fadeInUp} className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Onboarding Guide</span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl font-heading">How the Digital System Works</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Simple steps to set up credentials, join modules, and access dashboards.</p>
          </motion.div>

          {/* Timeline Process Steps */}
          <div className="relative">
            {/* Connecting line for desktop */}
            <div className="absolute top-1/2 left-4 right-4 hidden lg:block h-0.5 bg-blue-105 dark:bg-slate-800 -translate-y-8 z-0"></div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
              {steps.map((st, idx) => (
                <motion.div 
                  key={st.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.15 }}
                  className="space-y-4 text-center group"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-blue-600 dark:text-blue-455 text-lg font-bold shadow-sm group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300">
                    {st.id}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{st.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">{st.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          GALLERY
          ================================================== */}
      <section id="gallery" className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-12">
          {/* Section titles */}
          <motion.div {...fadeInUp} className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Campus Gallery</span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl font-heading">Life at Apex Academy</h2>
            <p className="text-sm text-slate-550 dark:text-slate-400">Take a virtual tour of our classrooms, facilities, laboratories, and sports grounds.</p>
          </motion.div>

          {/* Gallery grid with hover animations */}
          <div className="grid gap-6 grid-cols-2 lg:grid-cols-3">
            {gallery.map((item, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900 aspect-[4/3] shadow-sm hover:shadow-xl transition-all duration-350 cursor-pointer"
              >
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  loading="lazy"
                  onError={(e) => { e.target.onerror = null; e.target.style.display='none'; e.target.parentElement.classList.add(`bg-gradient-to-br`, item.gradient); }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 flex items-end p-5 transition-opacity duration-300">
                  <span className="text-sm font-bold text-white tracking-wide">{item.title}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================
          TESTIMONIALS
          ================================================== */}
      <section id="testimonials" className="py-16 sm:py-24 bg-slate-50/50 dark:bg-slate-900/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-12">
          {/* Section titles */}
          <motion.div {...fadeInUp} className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Testimonials</span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl font-heading">What Our Community Says</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Read verified reviews from students, parents, and faculty teachers.</p>
          </motion.div>

          {/* Testimonial cards */}
          <div className="grid gap-8 lg:grid-cols-3 text-left">
            {testimonials.map((test, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4.5 w-4.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                    "{test.text}"
                  </p>
                </div>

                <div className="flex items-center gap-3.5 border-t border-slate-100 dark:border-slate-800 pt-4 mt-6">
                  <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${test.color} shrink-0 flex items-center justify-center text-white text-xs font-bold`}>
                    {test.initials}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{test.name}</h4>
                    <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mt-0.5">{test.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================
          MEMBER LOGIN PORTAL SECTION
          ================================================== */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-12">
          {/* Section Title */}
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Direct Access</span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl font-heading">Choose Your Role to Log In</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Access specific student, teacher, or administrative portals directly.</p>
          </div>

          {/* Roles Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 text-left">
            {logins.map((roleCard, idx) => {
              const Icon = roleCard.icon;
              return (
                <div key={idx} className="bg-slate-55 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:bg-white dark:hover:bg-slate-900 hover:shadow-xl hover:border-white dark:hover:border-slate-700 transition-all duration-300 group">
                  <div className="space-y-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
                      <Icon className="h-5.5 w-5.5" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{roleCard.role} Login</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{roleCard.desc}</p>
                    </div>
                  </div>
                  
                  <Link
                    to={roleCard.path}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors mt-6 group-hover:translate-x-1 duration-200"
                  >
                    Enter Portal
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================================================
          CALL TO ACTION (CTA)
          ================================================== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 px-6 py-12 sm:px-12 sm:py-16 text-center text-white relative overflow-hidden shadow-2xl"
        >
          <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-white/5 blur-xl"></div>
          <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-white/5 blur-xl"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-extrabold sm:text-4xl tracking-tight font-heading">
              Join Our Smart School Today
            </h2>
            <p className="text-sm sm:text-base text-blue-100 max-w-lg mx-auto leading-relaxed">
              Start registration for the new academic semester, or log in to view schedules and report card histories.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="rounded-xl bg-white text-blue-600 font-bold px-6 py-3 text-sm hover:bg-slate-100 transition-all shadow-md active:scale-95 min-h-[44px]"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/apply"
                    className="rounded-xl bg-white text-blue-600 font-bold px-6 py-3 text-sm hover:bg-slate-100 transition-all shadow-md active:scale-95 min-h-[44px]"
                  >
                    Apply Online Now
                  </Link>
                  <Link
                    to="/login"
                    className="rounded-xl border border-white/30 bg-white/10 text-white font-bold px-6 py-3 text-sm hover:bg-white/20 transition-all active:scale-95 min-h-[44px]"
                  >
                    Member Log In
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ==================================================
          CONTACT SECTION
          ================================================== */}
      <section id="contact" className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section titles */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Contact Us</span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl font-heading">Get in Touch</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Have questions about admissions or school portals? Send us a message.</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-12">
            {/* Contact Details */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Academy Address</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                      Darbhanga, Bihar — 846001, India
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Phone Numbers</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Office: <a href="tel:+15550199" className="hover:underline text-slate-600 dark:text-slate-300">+1 (555) 019-9823</a><br/>
                      Support: <a href="tel:+15550198" className="hover:underline text-slate-600 dark:text-slate-300">+1 (555) 019-9800</a>
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Email Contact</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Administration: <a href="mailto:info@apex.edu" className="hover:underline text-slate-600 dark:text-slate-300">info@apex.edu</a><br/>
                      Technical Support: <a href="mailto:portal@apex.edu" className="hover:underline text-slate-600 dark:text-slate-300">portal@apex.edu</a>
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Office Working Hours</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Monday — Friday: 8:00 AM to 4:00 PM<br/>
                      Saturday: 9:00 AM to 1:00 PM (Sunday Closed)
                    </p>
                  </div>
                </div>
              </div>

              {/* Interactive Map — OpenStreetMap (no API key required) */}
              <div className="relative h-52 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm group">
                <iframe
                  title="Apex Academy Location — Darbhanga, Bihar"
                  width="100%"
                  height="100%"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=85.8618%2C26.1242%2C85.9218%2C26.1842&layer=mapnik&marker=26.1542%2C85.8918"
                  className="w-full h-full border-0"
                  style={{ filter: 'hue-rotate(200deg) saturate(0.7) brightness(0.95)' }}
                />
                {/* "Open in Maps" overlay button */}
                <a
                  href="https://www.openstreetmap.org/?mlat=26.1542&mlon=85.8918#map=14/26.1542/85.8918"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 px-2.5 py-1.5 rounded-lg shadow-md hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors opacity-0 group-hover:opacity-100 duration-200"
                >
                  <MapPin className="h-3 w-3 text-blue-500" />
                  Open in Maps
                </a>
              </div>

            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7">
              <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8">
                {contactSuccess && (
                  <div className="mb-6 flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-600 dark:text-emerald-400">
                    <Check className="h-5 w-5 shrink-0" />
                    <p className="font-medium">Message sent successfully! Our office will contact you soon.</p>
                  </div>
                )}

                {contactError && (
                  <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 p-4 text-sm text-red-600 dark:text-red-400">
                    <X className="h-5 w-5 shrink-0" />
                    <p className="font-medium">{contactError}</p>
                  </div>
                )}

                <form onSubmit={contactForm.handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="name">
                      Your Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm"
                      placeholder="Full name"
                      value={contactForm.values.name}
                      onChange={contactForm.handleChange}
                      onBlur={contactForm.handleBlur}
                    />
                    {contactForm.touched.name && contactForm.errors.name && (
                      <p className="text-xs text-red-500 mt-1">{contactForm.errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="email">
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm"
                      placeholder="Email Address"
                      value={contactForm.values.email}
                      onChange={contactForm.handleChange}
                      onBlur={contactForm.handleBlur}
                    />
                    {contactForm.touched.email && contactForm.errors.email && (
                      <p className="text-xs text-red-500 mt-1">{contactForm.errors.email}</p>
                    )}
                  </div>

                  {/* Subject */}
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="subject">
                      Subject
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm"
                      placeholder="e.g. Admission Inquiry"
                      value={contactForm.values.subject}
                      onChange={contactForm.handleChange}
                      onBlur={contactForm.handleBlur}
                    />
                    {contactForm.touched.subject && contactForm.errors.subject && (
                      <p className="text-xs text-red-500 mt-1">{contactForm.errors.subject}</p>
                    )}
                  </div>

                  {/* Message */}
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="message">
                      Detailed Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows="4"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm resize-none"
                      placeholder="Please write down your questions or details..."
                      value={contactForm.values.message}
                      onChange={contactForm.handleChange}
                      onBlur={contactForm.handleBlur}
                    ></textarea>
                    {contactForm.touched.message && contactForm.errors.message && (
                      <p className="text-xs text-red-500 mt-1">{contactForm.errors.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={contactForm.isSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition-all active:scale-[0.98] min-h-[44px] cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
                  >
                    {contactForm.isSubmitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Sending...
                      </>
                    ) : (
                      'Submit Inquiry Message'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          FOOTER SECTION
          ================================================== */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 pt-16 pb-8 border-t border-slate-800 dark:border-slate-900 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-12 text-left">
            {/* School Logo & Brand info */}
            <div className="lg:col-span-4 space-y-4">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md">
                  <GraduationCap className="h-4.5 w-4.5" />
                </div>
                <span className="text-lg font-bold text-white tracking-tight font-heading">Apex Academy</span>
              </Link>
              <p className="text-xs leading-relaxed text-slate-400 max-w-xs">
                A primary and secondary educational institution providing smart classes, scientific labs, and a digitised notice ERP workspace.
              </p>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Quick Links</h4>
              <nav className="flex flex-col gap-2.5 text-xs text-slate-400">
                <a href="#home" className="hover:text-blue-400 transition-colors">Home</a>
                <a href="#about" className="hover:text-blue-400 transition-colors">About</a>
                <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
                <a href="#gallery" className="hover:text-blue-400 transition-colors">Gallery</a>
              </nav>
            </div>

            {/* Useful Links */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Academic Portals</h4>
              <nav className="flex flex-col gap-2.5 text-xs text-slate-400">
                <Link to="/login" className="hover:text-blue-400 transition-colors">Student Log-In</Link>
                <Link to="/login" className="hover:text-blue-400 transition-colors">Teacher Workspace</Link>
                <Link to="/login" className="hover:text-blue-400 transition-colors">Parent Viewport</Link>
                <Link to="/apply" className="hover:text-blue-400 transition-colors">New Admissions Registration</Link>
              </nav>
            </div>

            {/* Contact details summary */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Contact Info</h4>
              <p className="text-xs leading-relaxed text-slate-405">
                Darbhanga, Bihar — 846001, India<br/>
                Office Phone: +91 9876-543-210<br/>
                Email: info@apex.edu
              </p>
            </div>
          </div>

          {/* Social icons, Terms, Copyright */}
          <div className="border-t border-slate-800 dark:border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p className="text-slate-500">
              &copy; {new Date().getFullYear()} Apex Academy. All rights reserved.
            </p>
            <div className="flex gap-6 text-slate-500">
              <a href="#privacy" className="hover:underline hover:text-slate-400">Privacy Policy</a>
              <a href="#terms" className="hover:underline hover:text-slate-400">Terms & Conditions</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default Landing;
