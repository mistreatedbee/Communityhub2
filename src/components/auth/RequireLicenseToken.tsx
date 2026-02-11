import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getLicenseToken } from '../../utils/licenseToken';
import { supabase } from '../../lib/supabase';
import { Spinner } from '../ui/Spinner';

type ValidateResult = { valid: boolean; plan_name?: string };

export function RequireLicenseToken({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
  const token = getLicenseToken();

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      return;
    }
    let mounted = true;
    supabase
      .rpc('validate_onboarding_token', { p_token: token })
      .returns<ValidateResult>()
      .then(({ data }) => {
        if (!mounted) return;
        setStatus(data?.valid ? 'valid' : 'invalid');
      })
      .catch(() => {
        if (mounted) setStatus('invalid');
      });
    return () => {
      mounted = false;
    };
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (status === 'invalid') {
    return <Navigate to="/enter-license" replace />;
  }

  return <>{children}</>;
}
