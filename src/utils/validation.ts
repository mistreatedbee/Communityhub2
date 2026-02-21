const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export function isValidEmail(email: string) {
  return EMAIL_REGEX.test(email.trim());
}

export function getPasswordValidationError(password: string) {
  const trimmed = password.trim();
  if (trimmed.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`;
  }
  if (trimmed.length > PASSWORD_MAX_LENGTH) {
    return `Password must be at most ${PASSWORD_MAX_LENGTH} characters long.`;
  }
  if (!/[A-Z]/.test(trimmed)) {
    return 'Password must include at least one uppercase letter.';
  }
  if (!/[a-z]/.test(trimmed)) {
    return 'Password must include at least one lowercase letter.';
  }
  if (!/[0-9]/.test(trimmed)) {
    return 'Password must include at least one number.';
  }
  return null;
}

export function getRequiredFieldError(value: string, label: string) {
  if (!value.trim()) {
    return `${label} is required.`;
  }
  return null;
}

export function getMaxLengthError(value: string, label: string, maxLength: number) {
  if (value.trim().length > maxLength) {
    return `${label} must be ${maxLength} characters or fewer.`;
  }
  return null;
}
