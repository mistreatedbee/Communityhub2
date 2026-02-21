const LICENSE_TOKEN_KEY = 'communityhub:license_token';
const LICENSE_KEY_KEY = 'communityhub:license_key';

export function getLicenseToken(): string | null {
  try {
    return window.localStorage.getItem(LICENSE_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setLicenseToken(token: string, licenseKey: string): void {
  try {
    window.localStorage.setItem(LICENSE_TOKEN_KEY, token);
    window.localStorage.setItem(LICENSE_KEY_KEY, licenseKey);
  } catch {
    // no-op
  }
}

export function getLicenseKey(): string | null {
  try {
    return window.localStorage.getItem(LICENSE_KEY_KEY);
  } catch {
    return null;
  }
}

export function clearLicenseSession(): void {
  try {
    window.localStorage.removeItem(LICENSE_TOKEN_KEY);
    window.localStorage.removeItem(LICENSE_KEY_KEY);
  } catch {
    // no-op
  }
}

export function hasLicenseSession(): boolean {
  return !!getLicenseToken();
}
