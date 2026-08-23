import { z } from 'zod';

// Nepal phone format: 10 digits starting with 97, 98, or 96 (e.g. 9841234567)
const nepalPhoneRegex = /^(?:\+?977[- ]?)?(?:9[678]\d{8})$/;

export const phoneAuthSchema = z.object({
  phoneNumber: z
    .string()
    .trim()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(nepalPhoneRegex, 'Please enter a valid Nepali mobile number (e.g. 98XXXXXXXX)'),
});

export const otpVerifySchema = z.object({
  phoneNumber: z.string().trim().regex(nepalPhoneRegex),
  code: z
    .string()
    .trim()
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d+$/, 'Verification code must contain digits only'),
});

export const userProfileUpdateSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(60),
  email: z.string().trim().email('Please enter a valid email address').optional().or(z.literal('')),
});

export type PhoneAuthInput = z.infer<typeof phoneAuthSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
export type UserProfileUpdateInput = z.infer<typeof userProfileUpdateSchema>;
