import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { admissionService } from '../services/admission.service';
import { settingsService } from '../services/settings.service';
import useAuth from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { 
  GraduationCap, User, Users, Home, Phone, 
  CheckCircle, AlertCircle, ArrowLeft, ArrowRight, Upload, Calendar,
  Sun, Moon, Menu, X, AlertTriangle
} from 'lucide-react';

const ApplyAdmission = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Monitor scroll height to trigger solid sticky header
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

  const [isAdmissionOpen, setIsAdmissionOpen] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setSettingsLoading(true);
        const res = await settingsService.getSettings();
        if (res && res.isAdmissionOpen !== undefined) {
          setIsAdmissionOpen(res.isAdmissionOpen);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setSettingsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  // Formik validation and submission
  const formik = useFormik({
    initialValues: {
      // Student Details
      firstName: '',
      middleName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      bloodGroup: '',
      nationality: 'Indian',
      religion: '',
      category: '',
      aadhaarNumber: '',

      // Parent Details
      fatherFullName: '',
      fatherPhone: '',
      fatherEmail: '',
      fatherOccupation: '',
      fatherQualification: '',
      motherFullName: '',
      motherPhone: '',
      motherEmail: '',
      motherOccupation: '',
      motherQualification: '',

      // Address
      currentAddress: '',
      city: '',
      state: '',
      pinCode: '',
      country: 'India',

      // Emergency Contact
      emergencyName: '',
      emergencyRelationship: '',
      emergencyPhone: '',

      // Admission Details
      academicSession: '2026-2027',
      classApplied: '',
      admissionType: 'New Admission'
    },
    validationSchema: Yup.object({
      // Step 1 Validation
      firstName: Yup.string().required('First name is required').trim(),
      lastName: Yup.string().required('Last name is required').trim(),
      dateOfBirth: Yup.date().required('Date of birth is required').max(new Date(), 'Date of birth cannot be in the future'),
      gender: Yup.string().oneOf(['Male', 'Female', 'Other'], 'Select a valid gender').required('Gender is required'),
      nationality: Yup.string().required('Nationality is required').trim(),
      religion: Yup.string().required('Religion is required').trim(),
      category: Yup.string().oneOf(['General', 'OBC', 'SC', 'ST', 'EWS'], 'Select category').required('Category is required'),
      
      // Step 2 Validation
      fatherFullName: Yup.string().required("Father's full name is required").trim(),
      fatherPhone: Yup.string().required("Father's mobile number is required").matches(/^[0-9]{10}$/, 'Must be a 10 digit number'),
      fatherOccupation: Yup.string().required("Father's occupation is required").trim(),
      fatherQualification: Yup.string().required("Father's qualification is required").trim(),
      motherFullName: Yup.string().required("Mother's full name is required").trim(),
      motherPhone: Yup.string().required("Mother's mobile number is required").matches(/^[0-9]{10}$/, 'Must be a 10 digit number'),
      motherOccupation: Yup.string().required("Mother's occupation is required").trim(),
      motherQualification: Yup.string().required("Mother's qualification is required").trim(),

      // Step 3 Validation
      currentAddress: Yup.string().required('Address is required').trim(),
      city: Yup.string().required('City is required').trim(),
      state: Yup.string().required('State is required').trim(),
      pinCode: Yup.string().required('PIN Code is required').matches(/^[0-9]{6}$/, 'Must be a 6 digit PIN code'),
      country: Yup.string().required('Country is required').trim(),

      // Step 4 Validation
      emergencyName: Yup.string().required('Emergency contact name is required').trim(),
      emergencyRelationship: Yup.string().required('Relationship is required').trim(),
      emergencyPhone: Yup.string().required('Emergency phone is required').matches(/^[0-9]{10}$/, 'Must be a 10 digit number'),

      // Step 5 Validation
      academicSession: Yup.string().required('Academic session is required'),
      classApplied: Yup.string().required('Class applied is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setError('');
      setSuccess(false);
      try {
        const formData = new FormData();
        // Append all text values
        Object.keys(values).forEach(key => {
          formData.append(key, values[key]);
        });
        // Append photo if exists
        if (photoFile) {
          formData.append('studentPhoto', photoFile);
        }

        await admissionService.submit(formData);
        setSuccess(true);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to submit application. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }
  });

  const handlePhotoChange = (e) => {
    const file = e.currentTarget.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const nextStep = () => {
    // Validate current step fields before going next
    let fieldsToValidate = [];
    if (step === 1) {
      fieldsToValidate = ['firstName', 'lastName', 'dateOfBirth', 'gender', 'nationality', 'religion', 'category'];
    } else if (step === 2) {
      fieldsToValidate = [
        'fatherFullName', 'fatherPhone', 'fatherOccupation', 'fatherQualification',
        'motherFullName', 'motherPhone', 'motherOccupation', 'motherQualification'
      ];
    } else if (step === 3) {
      fieldsToValidate = ['currentAddress', 'city', 'state', 'pinCode', 'country'];
    } else if (step === 4) {
      fieldsToValidate = ['emergencyName', 'emergencyRelationship', 'emergencyPhone'];
    }

    formik.validateForm().then(errors => {
      const stepErrors = fieldsToValidate.filter(field => errors[field]);
      // Touch validated fields so errors display
      const touchedFields = {};
      fieldsToValidate.forEach(field => {
        touchedFields[field] = true;
      });
      formik.setTouched({ ...formik.touched, ...touchedFields });

      if (stepErrors.length === 0) {
        setStep(prev => prev + 1);
      }
    });
  };

  const prevStep = () => setStep(prev => prev - 1);

  const classesList = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 flex flex-col justify-between selection:bg-blue-600/10 selection:text-blue-600">
      
      {/* ── STICKY NAVIGATION HEADER (IDENTICAL TO LANDING) ── */}
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
            <a href="/#home" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</a>
            <a href="/#about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About</a>
            <a href="/#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a>
            <a href="/#gallery" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Gallery</a>
            <a href="/#testimonials" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Testimonials</a>
            <a href="/#contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</a>
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
              className="px-4 py-2.5 rounded-xl border border-blue-600 dark:border-blue-500 text-sm font-bold text-blue-655 dark:text-sky-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all active:scale-95 shrink-0"
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
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="relative flex w-full max-w-xs flex-1 flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 shadow-2xl ml-auto"
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

              <div className="flex flex-col gap-4 mt-6 text-sm font-semibold">
                <a href="/#home" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 dark:text-slate-300 hover:text-blue-600">Home</a>
                <a href="/#about" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 dark:text-slate-300 hover:text-blue-600">About</a>
                <a href="/#features" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 dark:text-slate-300 hover:text-blue-600">Features</a>
                <a href="/#gallery" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 dark:text-slate-300 hover:text-blue-600">Gallery</a>
                <a href="/#testimonials" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 dark:text-slate-300 hover:text-blue-600">Testimonials</a>
                <a href="/#contact" onClick={() => setMobileMenuOpen(false)} className="text-slate-700 dark:text-slate-300 hover:text-blue-600">Contact</a>
                <Link to="/apply" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl bg-blue-600/10 text-blue-600 dark:text-sky-400 font-bold transition-all border-l-2 border-blue-650 dark:border-sky-400">Apply Admission</Link>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                  {isAuthenticated ? (
                    <>
                      <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex w-full justify-center bg-blue-600 text-white font-bold py-2.5 rounded-xl text-center shadow-lg shadow-blue-500/10">Go to Dashboard</Link>
                      <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="flex w-full justify-center border border-red-200 text-red-600 font-bold py-2.5 rounded-xl text-center">Log Out</button>
                    </>
                  ) : (
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex w-full justify-center border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold py-2.5 rounded-xl text-center">Member Login</Link>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── FORM CONTAINER ── */}
      <div className="flex-1 pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl w-full mx-auto">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden text-slate-800 dark:text-slate-100">
          
          {/* Decorative Blurs */}
          <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-blue-600/5 dark:bg-blue-600/10 blur-3xl pointer-events-none"></div>
          <div className="absolute -right-20 -bottom-20 h-40 w-40 rounded-full bg-indigo-600/5 dark:bg-indigo-600/10 blur-3xl pointer-events-none"></div>

          {settingsLoading ? (
            <div className="relative z-10 text-center py-20 space-y-4 max-w-md mx-auto">
              <div className="mx-auto h-12 w-12 border-4 border-slate-200 dark:border-slate-800 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-sm text-slate-500 dark:text-slate-405 font-semibold">Checking admissions status...</p>
            </div>
          ) : !isAdmissionOpen ? (
            <div className="relative z-10 text-center py-16 space-y-6 max-w-lg mx-auto animate-fade-in">
              <div className="mx-auto h-16 w-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center animate-bounce">
                <AlertTriangle className="h-9 w-9 text-red-500" />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Admissions are Closed!</h2>
              <p className="text-slate-550 dark:text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
                Thank you for your interest in Apex Academy. Online registration intake is currently closed. Please contact the administrative office or check back later.
              </p>
              <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/" className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-2.5 text-sm font-bold text-white transition-all active:scale-[0.98]">
                  Back to Home
                </Link>
                <a href="mailto:info@apex.edu" className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 px-6 py-2.5 text-sm font-bold transition-all active:scale-[0.98]">
                  Email Admissions Office
                </a>
              </div>
            </div>
          ) : success ? (
            <div className="relative z-10 text-center py-12 space-y-6 max-w-md mx-auto animate-fade-in">
              <div className="mx-auto h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-455 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 animate-bounce" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Application Submitted!</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Thank you for applying to Apex Academy. Your admission application has been registered successfully. The school administration office will review details and reach out to you shortly.
              </p>
              <div className="pt-4">
                <Link to="/" className="inline-flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98]">
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <div className="relative z-10 space-y-8">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Admission Application Form</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Fill in the fields below to submit a new admission query.</p>
              </div>

              {error && (
                <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-500 dark:text-red-400 animate-shake">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {/* Steps Progress Indicator */}
              <div className="flex items-center justify-between max-w-md mx-auto mb-10 text-xs font-semibold text-slate-400 dark:text-slate-500">
                {[
                  { num: 1, label: 'Student', icon: User },
                  { num: 2, label: 'Parents', icon: Users },
                  { num: 3, label: 'Address', icon: Home },
                  { num: 4, label: 'Emergency', icon: Phone },
                  { num: 5, label: 'Admission', icon: GraduationCap }
                ].map(s => (
                  <div key={s.num} className="flex flex-col items-center gap-1.5 relative z-10">
                    <div className={`h-8 w-8 rounded-full border flex items-center justify-center transition-all ${
                      step >= s.num 
                        ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/25' 
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-455 dark:text-slate-500'
                    }`}>
                      <s.icon className="h-4 w-4" />
                    </div>
                    <span className={step >= s.num ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}>{s.label}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={formik.handleSubmit} className="space-y-6 text-left">
                
                {/* ── STEP 1: STUDENT DETAILS ── */}
                {step === 1 && (
                  <div className="space-y-6 animate-fade-in">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                      <User className="h-5 w-5 text-blue-500" /> Student Personal details
                    </h3>

                    {/* Photo upload */}
                    <div className="flex items-center gap-6 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                      <div className="relative h-24 w-24 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                        {photoPreview ? (
                          <img src={photoPreview} alt="Student Preview" className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-10 w-10 text-slate-400 dark:text-slate-600" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Student Photo</h4>
                        <p className="text-xs text-slate-500">Upload a passport size photograph of the applicant.</p>
                        <label className="inline-flex items-center gap-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-750 text-xs text-slate-700 dark:text-slate-300 font-semibold px-4 py-2 rounded-xl cursor-pointer transition-colors">
                          <Upload className="h-4 w-4" /> Choose Image File
                          <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                        </label>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      {/* First Name */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="firstName">First Name *</label>
                        <input
                          id="firstName" name="firstName" type="text" className="w-full glass-input"
                          placeholder="John" value={formik.values.firstName} onChange={formik.handleChange} onBlur={formik.handleBlur}
                        />
                        {formik.touched.firstName && formik.errors.firstName && (
                          <p className="text-xs text-red-500 mt-1">{formik.errors.firstName}</p>
                        )}
                      </div>

                      {/* Middle Name */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="middleName">Middle Name</label>
                        <input
                          id="middleName" name="middleName" type="text" className="w-full glass-input"
                          placeholder="Michael" value={formik.values.middleName} onChange={formik.handleChange} onBlur={formik.handleBlur}
                        />
                      </div>

                      {/* Last Name */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="lastName">Last Name *</label>
                        <input
                          id="lastName" name="lastName" type="text" className="w-full glass-input"
                          placeholder="Doe" value={formik.values.lastName} onChange={formik.handleChange} onBlur={formik.handleBlur}
                        />
                        {formik.touched.lastName && formik.errors.lastName && (
                          <p className="text-xs text-red-500 mt-1">{formik.errors.lastName}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* DOB */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="dateOfBirth">Date of Birth *</label>
                        <input
                          id="dateOfBirth" name="dateOfBirth" type="date" className="w-full glass-input"
                          value={formik.values.dateOfBirth} onChange={formik.handleChange} onBlur={formik.handleBlur}
                        />
                        {formik.touched.dateOfBirth && formik.errors.dateOfBirth && (
                          <p className="text-xs text-red-500 mt-1">{formik.errors.dateOfBirth}</p>
                        )}
                      </div>

                      {/* Gender */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Gender *</label>
                        <div className="flex gap-4 pt-1">
                          {['Male', 'Female', 'Other'].map(g => (
                            <label key={g} className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                              <input
                                type="radio" name="gender" value={g} checked={formik.values.gender === g}
                                onChange={formik.handleChange} className="accent-blue-500 h-4 w-4"
                              />
                              {g}
                            </label>
                          ))}
                        </div>
                        {formik.touched.gender && formik.errors.gender && (
                          <p className="text-xs text-red-500 mt-1">{formik.errors.gender}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      {/* Blood Group */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="bloodGroup">Blood Group</label>
                        <input
                          id="bloodGroup" name="bloodGroup" type="text" className="w-full glass-input"
                          placeholder="e.g. O+, A-" value={formik.values.bloodGroup} onChange={formik.handleChange} onBlur={formik.handleBlur}
                        />
                      </div>

                      {/* Nationality */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="nationality">Nationality *</label>
                        <input
                          id="nationality" name="nationality" type="text" className="w-full glass-input"
                          value={formik.values.nationality} onChange={formik.handleChange} onBlur={formik.handleBlur}
                        />
                        {formik.touched.nationality && formik.errors.nationality && (
                          <p className="text-xs text-red-500 mt-1">{formik.errors.nationality}</p>
                        )}
                      </div>

                      {/* Religion */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="religion">Religion *</label>
                        <input
                          id="religion" name="religion" type="text" className="w-full glass-input"
                          placeholder="e.g. Hinduism, Islam" value={formik.values.religion} onChange={formik.handleChange} onBlur={formik.handleBlur}
                        />
                        {formik.touched.religion && formik.errors.religion && (
                          <p className="text-xs text-red-500 mt-1">{formik.errors.religion}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Category */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="category">Category *</label>
                        <select
                          id="category" name="category" className="w-full glass-input text-slate-800 dark:text-white"
                          value={formik.values.category} onChange={formik.handleChange} onBlur={formik.handleBlur}
                        >
                          <option value="" className="bg-slate-900 text-white">Select Category</option>
                          {['General', 'OBC', 'SC', 'ST', 'EWS'].map(cat => (
                            <option key={cat} value={cat} className="bg-slate-900 text-white">{cat}</option>
                          ))}
                        </select>
                        {formik.touched.category && formik.errors.category && (
                          <p className="text-xs text-red-500 mt-1">{formik.errors.category}</p>
                        )}
                      </div>

                      {/* Aadhaar Number */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="aadhaarNumber">Aadhaar Number</label>
                        <input
                          id="aadhaarNumber" name="aadhaarNumber" type="text" className="w-full glass-input"
                          placeholder="12 digit Aadhaar Number" value={formik.values.aadhaarNumber} onChange={formik.handleChange} onBlur={formik.handleBlur}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 2: PARENT DETAILS ── */}
                {step === 2 && (
                  <div className="space-y-8 animate-fade-in">
                    {/* Father Info */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <User className="h-5 w-5 text-indigo-500" /> Father's Details
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="fatherFullName">Full Name *</label>
                          <input
                            id="fatherFullName" name="fatherFullName" type="text" className="w-full glass-input"
                            value={formik.values.fatherFullName} onChange={formik.handleChange} onBlur={formik.handleBlur}
                          />
                          {formik.touched.fatherFullName && formik.errors.fatherFullName && (
                            <p className="text-xs text-red-500 mt-1">{formik.errors.fatherFullName}</p>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="fatherPhone">Mobile Number *</label>
                          <input
                            id="fatherPhone" name="fatherPhone" type="text" className="w-full glass-input"
                            placeholder="10 digit phone number" value={formik.values.fatherPhone} onChange={formik.handleChange} onBlur={formik.handleBlur}
                          />
                          {formik.touched.fatherPhone && formik.errors.fatherPhone && (
                            <p className="text-xs text-red-500 mt-1">{formik.errors.fatherPhone}</p>
                          )}
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="fatherEmail">Email Address</label>
                          <input
                            id="fatherEmail" name="fatherEmail" type="email" className="w-full glass-input"
                            value={formik.values.fatherEmail} onChange={formik.handleChange} onBlur={formik.handleBlur}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="fatherOccupation">Occupation *</label>
                          <input
                            id="fatherOccupation" name="fatherOccupation" type="text" className="w-full glass-input"
                            value={formik.values.fatherOccupation} onChange={formik.handleChange} onBlur={formik.handleBlur}
                          />
                          {formik.touched.fatherOccupation && formik.errors.fatherOccupation && (
                            <p className="text-xs text-red-500 mt-1">{formik.errors.fatherOccupation}</p>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="fatherQualification">Qualification *</label>
                          <input
                            id="fatherQualification" name="fatherQualification" type="text" className="w-full glass-input"
                            value={formik.values.fatherQualification} onChange={formik.handleChange} onBlur={formik.handleBlur}
                          />
                          {formik.touched.fatherQualification && formik.errors.fatherQualification && (
                            <p className="text-xs text-red-500 mt-1">{formik.errors.fatherQualification}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Mother Info */}
                    <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <User className="h-5 w-5 text-rose-500" /> Mother's Details
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="motherFullName">Full Name *</label>
                          <input
                            id="motherFullName" name="motherFullName" type="text" className="w-full glass-input"
                            value={formik.values.motherFullName} onChange={formik.handleChange} onBlur={formik.handleBlur}
                          />
                          {formik.touched.motherFullName && formik.errors.motherFullName && (
                            <p className="text-xs text-red-500 mt-1">{formik.errors.motherFullName}</p>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="motherPhone">Mobile Number *</label>
                          <input
                            id="motherPhone" name="motherPhone" type="text" className="w-full glass-input"
                            placeholder="10 digit phone number" value={formik.values.motherPhone} onChange={formik.handleChange} onBlur={formik.handleBlur}
                          />
                          {formik.touched.motherPhone && formik.errors.motherPhone && (
                            <p className="text-xs text-red-500 mt-1">{formik.errors.motherPhone}</p>
                          )}
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="motherEmail">Email Address</label>
                          <input
                            id="motherEmail" name="motherEmail" type="email" className="w-full glass-input"
                            value={formik.values.motherEmail} onChange={formik.handleChange} onBlur={formik.handleBlur}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="motherOccupation">Occupation *</label>
                          <input
                            id="motherOccupation" name="motherOccupation" type="text" className="w-full glass-input"
                            value={formik.values.motherOccupation} onChange={formik.handleChange} onBlur={formik.handleBlur}
                          />
                          {formik.touched.motherOccupation && formik.errors.motherOccupation && (
                            <p className="text-xs text-red-500 mt-1">{formik.errors.motherOccupation}</p>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="motherQualification">Qualification *</label>
                          <input
                            id="motherQualification" name="motherQualification" type="text" className="w-full glass-input"
                            value={formik.values.motherQualification} onChange={formik.handleChange} onBlur={formik.handleBlur}
                          />
                          {formik.touched.motherQualification && formik.errors.motherQualification && (
                            <p className="text-xs text-red-500 mt-1">{formik.errors.motherQualification}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 3: ADDRESS DETAILS ── */}
                {step === 3 && (
                  <div className="space-y-6 animate-fade-in">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                      <Home className="h-5 w-5 text-indigo-500" /> Address Details
                    </h3>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="currentAddress">Current Address *</label>
                      <textarea
                        id="currentAddress" name="currentAddress" rows="3" className="w-full glass-input resize-none"
                        placeholder="Street address, colony, sector" value={formik.values.currentAddress}
                        onChange={formik.handleChange} onBlur={formik.handleBlur}
                      />
                      {formik.touched.currentAddress && formik.errors.currentAddress && (
                        <p className="text-xs text-red-500 mt-1">{formik.errors.currentAddress}</p>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="city">City *</label>
                        <input
                          id="city" name="city" type="text" className="w-full glass-input"
                          placeholder="Darbhanga" value={formik.values.city} onChange={formik.handleChange} onBlur={formik.handleBlur}
                        />
                        {formik.touched.city && formik.errors.city && (
                          <p className="text-xs text-red-500 mt-1">{formik.errors.city}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="state">State *</label>
                        <input
                          id="state" name="state" type="text" className="w-full glass-input"
                          placeholder="Bihar" value={formik.values.state} onChange={formik.handleChange} onBlur={formik.handleBlur}
                        />
                        {formik.touched.state && formik.errors.state && (
                          <p className="text-xs text-red-500 mt-1">{formik.errors.state}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="pinCode">PIN Code *</label>
                        <input
                          id="pinCode" name="pinCode" type="text" className="w-full glass-input"
                          placeholder="846001" value={formik.values.pinCode} onChange={formik.handleChange} onBlur={formik.handleBlur}
                        />
                        {formik.touched.pinCode && formik.errors.pinCode && (
                          <p className="text-xs text-red-500 mt-1">{formik.errors.pinCode}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="country">Country *</label>
                        <input
                          id="country" name="country" type="text" className="w-full glass-input"
                          value={formik.values.country} onChange={formik.handleChange} onBlur={formik.handleBlur}
                        />
                        {formik.touched.country && formik.errors.country && (
                          <p className="text-xs text-red-500 mt-1">{formik.errors.country}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 4: EMERGENCY CONTACT ── */}
                {step === 4 && (
                  <div className="space-y-6 animate-fade-in">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                      <Phone className="h-5 w-5 text-emerald-500" /> Emergency Contact
                    </h3>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="emergencyName">Contact Person Name *</label>
                        <input
                          id="emergencyName" name="emergencyName" type="text" className="w-full glass-input"
                          placeholder="Emergency Contact Person" value={formik.values.emergencyName} onChange={formik.handleChange} onBlur={formik.handleBlur}
                        />
                        {formik.touched.emergencyName && formik.errors.emergencyName && (
                          <p className="text-xs text-red-500 mt-1">{formik.errors.emergencyName}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="emergencyRelationship">Relationship *</label>
                        <input
                          id="emergencyRelationship" name="emergencyRelationship" type="text" className="w-full glass-input"
                          placeholder="e.g. Uncle, Neighbour" value={formik.values.emergencyRelationship} onChange={formik.handleChange} onBlur={formik.handleBlur}
                        />
                        {formik.touched.emergencyRelationship && formik.errors.emergencyRelationship && (
                          <p className="text-xs text-red-500 mt-1">{formik.errors.emergencyRelationship}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="emergencyPhone">Mobile Number *</label>
                      <input
                        id="emergencyPhone" name="emergencyPhone" type="text" className="w-full glass-input"
                        placeholder="10 digit phone number" value={formik.values.emergencyPhone} onChange={formik.handleChange} onBlur={formik.handleBlur}
                      />
                      {formik.touched.emergencyPhone && formik.errors.emergencyPhone && (
                        <p className="text-xs text-red-500 mt-1">{formik.errors.emergencyPhone}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* ── STEP 5: ADMISSION DETAILS ── */}
                {step === 5 && (
                  <div className="space-y-6 animate-fade-in">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                      <GraduationCap className="h-5 w-5 text-blue-500" /> Admission Details
                    </h3>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Academic Session */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="academicSession">Academic Session *</label>
                        <select
                          id="academicSession" name="academicSession" className="w-full glass-input"
                          value={formik.values.academicSession} onChange={formik.handleChange} onBlur={formik.handleBlur}
                        >
                          <option value="2026-2027" className="bg-slate-950 text-white">2026-2027</option>
                          <option value="2027-2028" className="bg-slate-950 text-white">2027-2028</option>
                        </select>
                        {formik.touched.academicSession && formik.errors.academicSession && (
                          <p className="text-xs text-red-500 mt-1">{formik.errors.academicSession}</p>
                        )}
                      </div>

                      {/* Class */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="classApplied">Class Applying For *</label>
                        <select
                          id="classApplied" name="classApplied" className="w-full glass-input"
                          value={formik.values.classApplied} onChange={formik.handleChange} onBlur={formik.handleBlur}
                        >
                          <option value="">Select Class</option>
                          {classesList.map(c => (
                            <option key={c} value={c} className="bg-slate-950 text-slate-800 dark:text-white">Class {c}</option>
                          ))}
                        </select>
                        {formik.touched.classApplied && formik.errors.classApplied && (
                          <p className="text-xs text-red-500 mt-1">{formik.errors.classApplied}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor="admissionType">Admission Type</label>
                      <input
                        id="admissionType" name="admissionType" type="text" className="w-full glass-input opacity-70 cursor-not-allowed"
                        value={formik.values.admissionType} disabled
                      />
                    </div>
                  </div>
                )}

                {/* Navigation buttons */}
                <div className="flex justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
                  {step > 1 ? (
                    <button
                      type="button" onClick={prevStep}
                      className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
                    >
                      <ArrowLeft className="h-4 w-4" /> Previous
                    </button>
                  ) : (
                    <div />
                  )}

                  {step < 5 ? (
                    <button
                      type="button" onClick={nextStep}
                      className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
                    >
                      Next <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="submit" disabled={formik.isSubmitting}
                      className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {formik.isSubmitting ? 'Submitting Application...' : 'Submit Application Now'}
                    </button>
                  )}
                </div>

              </form>
            </div>
          )}
        </div>
      </div>

      {/* ── FOOTER SECTION ── */}
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
                <Link to="/" className="hover:text-blue-400 transition-colors">Home</Link>
                <Link to="/#about" className="hover:text-blue-400 transition-colors">About</Link>
                <Link to="/#features" className="hover:text-blue-400 transition-colors">Features</Link>
                <Link to="/apply" className="hover:text-blue-400 transition-colors">Apply Online</Link>
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

export default ApplyAdmission;
