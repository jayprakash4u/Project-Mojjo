import { z } from 'zod';

const nepalPhoneRegex = /^(?:\+?977[- ]?)?(?:9[678]\d{8})$/;

export const deliveryAddressSchema = z.object({
  recipientName: z.string().trim().min(2, 'Recipient name is required'),
  phoneNumber: z
    .string()
    .trim()
    .regex(nepalPhoneRegex, 'Valid Nepali phone number is required'),
  streetAddress: z.string().trim().min(3, 'Street address is required'),
  area: z.string().trim().min(2, 'Area/Neighborhood is required (e.g. Jhamsikhel, Baneshwor)'),
  city: z.string().trim().min(2, 'City is required (e.g. Kathmandu, Lalitpur)'),
  landmark: z.string().trim().optional(),
  deliveryInstructions: z.string().trim().max(200).optional(),
});

export const checkoutFormSchema = z.object({
  deliveryAddress: deliveryAddressSchema,
  paymentMethod: z.enum(['eSewa', 'Khalti', 'COD', 'Fonepay']),
  notes: z.string().max(300).optional(),
  redeemCoins: z.boolean().default(false),
});

export type DeliveryAddressInput = z.infer<typeof deliveryAddressSchema>;
export type CheckoutFormInput = z.infer<typeof checkoutFormSchema>;
