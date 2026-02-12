import { describe, expect, it } from 'vitest';
import { getPasswordValidationError, isValidEmail } from '../utils/validation';

describe('validation utilities', () => {
  it('validates email format', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
  });

  it('enforces password strength rules', () => {
    expect(getPasswordValidationError('abc')).toBeTruthy();
    expect(getPasswordValidationError('Password1')).toBeNull();
  });
});
