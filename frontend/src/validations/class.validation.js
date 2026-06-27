import * as Yup from 'yup';

export const classSchema = Yup.object().shape({
  className: Yup.string()
    .required('Class Name is required')
    .min(1, 'Class Name must be at least 1 character')
    .trim(),
  section: Yup.string()
    .max(5, 'Section must not exceed 5 characters')
    .trim(),
  classTeacher: Yup.string()
    .nullable()
    .trim(),
});
