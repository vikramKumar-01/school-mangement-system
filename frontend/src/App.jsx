import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import RoleProtectedRoute from './components/RoleProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ClassList from './pages/ClassList';
import StudentList from './pages/StudentList';
import TeacherList from './pages/TeacherList';
import FeeList from './pages/FeeList';
import AttendanceList from './pages/AttendanceList';
import Profile from './pages/Profile';
import ContactMessages from './pages/ContactMessages';
import SchoolSettings from './pages/SchoolSettings';
import HolidayManagement from './pages/HolidayManagement';
import AdminTeacherAttendance from './pages/AdminTeacherAttendance';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<Landing />} />

          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Core Protected App Routes */}
          <Route path="/dashboard" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            
            <Route 
              path="students" 
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'teacher']}>
                  <StudentList />
                </RoleProtectedRoute>
              } 
            />
            
            <Route 
              path="teachers" 
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <TeacherList />
                </RoleProtectedRoute>
              } 
            />
            
            <Route 
              path="classes" 
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'teacher']}>
                  <ClassList />
                </RoleProtectedRoute>
              } 
            />
            
            <Route 
              path="fees" 
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'student']}>
                  <FeeList />
                </RoleProtectedRoute>
              } 
            />
            
            <Route 
              path="attendance" 
              element={
                <RoleProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'parent']}>
                  <AttendanceList />
                </RoleProtectedRoute>
              } 
            />

            <Route path="profile" element={<Profile />} />

            <Route
              path="messages"
              element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <ContactMessages />
                </RoleProtectedRoute>
              }
            />

          {/* Admin Settings & Holidays */}
          <Route path="settings" element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <SchoolSettings />
            </RoleProtectedRoute>
          } />
          <Route path="holidays" element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <HolidayManagement />
            </RoleProtectedRoute>
          } />
          <Route path="admin-attendance" element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <AdminTeacherAttendance />
            </RoleProtectedRoute>
          } />

          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
  );
}

export default App;
