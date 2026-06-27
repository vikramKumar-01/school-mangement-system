import * as Yup from 'yup';

export const feeSchema = Yup.object().shape({
  student: Yup.string()
    .required('Student selection is required')
    .trim(),
  amount: Yup.number()
    .required('Fee amount is required')
    .positive('Amount must be positive')
    .integer('Amount must be an integer'),
  status: Yup.string()
    .oneOf(['Paid', 'Pending'], 'Invalid status')
    .required('Payment status is required'),
  paymentDate: Yup.date()
    .nullable()
    .when('status', {
      is: 'Paid',
      then: (schema) => schema.required('Payment date is required when status is Paid'),
      otherwise: (schema) => schema.nullable()
    }),
});
