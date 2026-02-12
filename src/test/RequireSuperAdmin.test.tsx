import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { RequireSuperAdmin } from '../components/auth/RequireSuperAdmin';

const mockUseAuth = vi.fn();

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}));

describe('RequireSuperAdmin', () => {
  it('renders children when user is super admin', () => {
    mockUseAuth.mockReturnValue({
      loading: false,
      platformRole: 'super_admin'
    });

    render(
      <MemoryRouter>
        <RequireSuperAdmin>
          <div>Super Admin Content</div>
        </RequireSuperAdmin>
      </MemoryRouter>
    );

    expect(screen.getByText('Super Admin Content')).toBeInTheDocument();
  });
});
