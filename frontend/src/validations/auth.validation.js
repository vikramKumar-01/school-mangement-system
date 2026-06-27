import * as Yup from 'yup';

export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required')
    .trim(),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export const registerSchema = Yup.object().shape({
  fullName: Yup.string()
    .required('Full Name is required')
    .min(2, 'Name must be at least 2 characters')
    .trim(),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required')
    .trim(),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  role: Yup.string()
    .oneOf(['admin', 'teacher', 'student', 'parent'], 'Invalid role selected')
    .required('Role is required'),
});
