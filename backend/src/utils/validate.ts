/**
 * Simple validation helpers.
 * Returns an error message string if invalid, or null if valid.
 */

export const validateRequired = (
  fields: Record<string, any>,
  requiredFields: string[]
): string | null => {
  const missing = requiredFields.filter(
    (field) =>
      fields[field] === undefined ||
      fields[field] === null ||
      fields[field] === ""
  );

  if (missing.length > 0) {
    return `Missing required fields: ${missing.join(", ")}`;
  }
  return null;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateMobile = (mobile: string): boolean => {
  const mobileRegex = /^[0-9]{10,15}$/;
  return mobileRegex.test(mobile);
};

/**
 * Parse pagination query params with defaults.
 */
export const parsePagination = (query: any) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};
