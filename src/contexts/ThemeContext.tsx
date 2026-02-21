import React, { useEffect, useState, createContext, useContext } from 'react';
import { Organization } from '../types';
import { DEFAULT_BRAND_LOGO, normalizeImageUrl } from '../utils/image';
interface ThemeContextType {
  organization: Organization;
  updateTheme: (org: Partial<Organization>) => void;
}
const defaultOrg: Organization = {
  id: 'org-1',
  name: 'Community Hub',
  primaryColor: '#3B82F6',
  secondaryColor: '#10B981',
  description: 'A place for communities to grow and thrive together.',
  contactEmail: 'contact@communityhub.com',
  logo: DEFAULT_BRAND_LOGO
};
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
export function ThemeProvider({ children }: {children: React.ReactNode;}) {
  const [organization, setOrganization] = useState<Organization>(defaultOrg);
  useEffect(() => {
    // Apply theme colors to CSS variables
    const root = document.documentElement;
    root.style.setProperty('--color-primary', organization.primaryColor);
    root.style.setProperty('--color-secondary', organization.secondaryColor);
    // Calculate darker shades for hover states (simple darkening logic)
    // In a real app, we might use a color manipulation library
    root.style.setProperty(
      '--color-primary-hover',
      adjustColor(organization.primaryColor, -20)
    );
  }, [organization]);
  const updateTheme = (updates: Partial<Organization>) => {
    const sanitized = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    ) as Partial<Organization>;
    if (sanitized.logo !== undefined) {
      sanitized.logo = normalizeImageUrl(sanitized.logo) || DEFAULT_BRAND_LOGO;
    }
    setOrganization((prev) => ({
      ...prev,
      ...sanitized
    }));
  };
  return (
    <ThemeContext.Provider
      value={{
        organization,
        updateTheme
      }}>

      {children}
    </ThemeContext.Provider>);

}
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
// Simple color adjuster helper
function adjustColor(color: string, amount: number) {
  return (
    '#' +
    color.
    replace(/^#/, '').
    replace(/../g, (color) =>
    (
    '0' +
    Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).
    substr(-2)
    ));

}
