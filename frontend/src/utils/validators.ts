/**
 * Validates an email address format.
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates that a password meets minimum requirements.
 * E.g., at least 6 characters.
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

/**
 * Validates catch form logic: Quantity must be greater than 0 and size must be positive.
 */
export const isValidCatchRecord = (quantity: number, sizeCm: number): boolean => {
  return quantity > 0 && sizeCm > 0;
};
