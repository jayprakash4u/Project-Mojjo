/** Shared field validators, so auth, profile and checkout agree on the rules. */

/** Nepali mobile numbers: 10 digits starting 97 or 98. */
const PHONE_PATTERN = /^9[78]\d{8}$/;

export function validatePhone(value: string): string | undefined {
  const digits = value.replace(/[\s-]/g, "");
  if (!digits) return "Enter your mobile number.";
  if (!PHONE_PATTERN.test(digits)) return "Enter a 10-digit number starting 97 or 98.";
  return undefined;
}

export function validateName(value: string): string | undefined {
  if (!value.trim()) return "Enter your name.";
  if (value.trim().length < 2) return "That name looks too short.";
  return undefined;
}
