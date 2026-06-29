import * as Yup from 'yup';

export const studentSchema = Yup.object().shape({
  name: Yup.string()
    .required('Student Name is required')
    .min(2, 'Name must be at least 2 characters')
    .trim(),
  class: Yup.string()
    .required('Class Name is required')
    .trim(),
  rollNumber: Yup.number()
    .required('Roll Number is required')
    .positive('Roll number must be a positive number')
    .integer('Roll number must be an integer'),
  gender: Yup.string()
    .required('Gender is required')
    .oneOf(['Male', 'Female'], 'Gender must be Male or Female'),
  fatherName: Yup.string()
    .trim(),
  phone: Yup.string()
    .matches(/^[0-9+-\s]*$/, 'Invalid phone number format')
    .trim(),
  address: Yup.string()
    .trim(),
  admissionDate: Yup.date()
    .nullable(),
});
