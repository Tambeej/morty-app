import { z } from 'zod';

const israeliPhoneRegex = /^(\+972|0)(5[0-9]|[2-9][0-9])[0-9]{7}$/;

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required').min(8, 'Password must be at least 8 characters')
});

export const registerSchema = z.object({
  name: z.string().min(1, 'Full name is required').min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  phone: z.string().min(1, 'Phone number is required').regex(israeliPhoneRegex, 'Please enter a valid Israeli phone number (+972 or 05x format)'),
  password: z.string().min(1, 'Password is required').min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Password must contain at least one uppercase letter').regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export const financialSchema = z.object({
  income: z.object({
    monthly: z.number({ invalid_type_error: 'Please enter a valid amount' }).min(0, 'Income cannot be negative').max(10000000, 'Amount seems too large'),
    additional: z.number({ invalid_type_error: 'Please enter a valid amount' }).min(0).max(10000000).optional().default(0)
  }),
  expenses: z.object({
    housing: z.number({ invalid_type_error: 'Please enter a valid amount' }).min(0).optional().default(0),
    loans: z.number({ invalid_type_error: 'Please enter a valid amount' }).min(0).optional().default(0),
    other: z.number({ invalid_type_error: 'Please enter a valid amount' }).min(0).optional().default(0)
  }),
  assets: z.object({
    savings: z.number({ invalid_type_error: 'Please enter a valid amount' }).min(0).optional().default(0),
    investments: z.number({ invalid_type_error: 'Please enter a valid amount' }).min(0).optional().default(0)
  })
});

export function formatCurrency(value) {
  if (value === null || value === undefined || isNaN(value)) return '';
  return new Intl.NumberFormat('he-IL').format(value);
}

export function parseCurrency(value) {
  if (!value) return 0;
  return parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
}

export function validateUploadFile(file) {
  const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
  const maxSize = 5 * 1024 * 1024;
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please upload a PDF, PNG, or JPG file.' };
  }
  if (file.size > maxSize) {
    return { valid: false, error: `File is too large. Maximum size is 5MB (current: ${(file.size / 1024 / 1024).toFixed(1)}MB).` };
  }
  return { valid: true };
}
