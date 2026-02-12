import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { RequireTenantRole } from '../components/auth/RequireTenantRole';

const mockUseAuth = vi.fn();
const mockUseTenant = vi.fn();

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}));

vi.mock('../contexts/TenantContext', () => ({
  useTenant: () => mockUseTenant()
}));

describe('RequireTenantRole', () => {
  it('allows access for active member role', () => {
    mockUseAuth.mockReturnValue({ loading: false, platformRole: 'user' });
    mockUseTenant.mockReturnValue({
      membership: { role: 'member', status: 'active' },
      loading: false
    });

    render(
      <MemoryRouter>
        <RequireTenantRole roles={['member']}>
          <div>Member Content</div>
        </RequireTenantRole>
      </MemoryRouter>
    );

    expect(screen.getByText('Member Content')).toBeInTheDocument();
  });

  it('blocks access for inactive membership', () => {
    mockUseAuth.mockReturnValue({ loading: false, platformRole: 'user' });
    mockUseTenant.mockReturnValue({
      membership: { role: 'member', status: 'pending' },
      loading: false
    });

    render(
      <MemoryRouter>
        <RequireTenantRole roles={['member']}>
          <div>Member Content</div>
        </RequireTenantRole>
      </MemoryRouter>
    );

    expect(screen.queryByText('Member Content')).not.toBeInTheDocument();
  });
});
