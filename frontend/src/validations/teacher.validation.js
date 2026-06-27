import * as Yup from 'yup';

export const teacherSchema = Yup.object().shape({
  name: Yup.string()
    .required('Teacher Name is required')
    .min(2, 'Name must be at least 2 characters')
    .trim(),
  subject: Yup.string()
    .required('Subject specialization is required')
    .trim(),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required')
    .trim(),
  phone: Yup.string()
    .matches(/^[0-9+-\s]*$/, 'Invalid phone number format')
    .required('Phone number is required')
    .trim(),
  salary: Yup.number()
    .positive('Salary must be a positive number')
    .integer('Salary must be an integer')
    .nullable(),
});
