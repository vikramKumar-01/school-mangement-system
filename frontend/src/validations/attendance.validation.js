import * as Yup from 'yup';

export const attendanceSchema = Yup.object().shape({
  student: Yup.string()
    .required('Student selection is required')
    .trim(),
  date: Yup.date()
    .required('Attendance date is required'),
  status: Yup.string()
    .oneOf(['Present', 'Absent', 'Holiday'], 'Invalid status')
    .required('Attendance status is required'),
});
