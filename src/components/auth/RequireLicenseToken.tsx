import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getLicenseKey } from '../../utils/licenseToken';
import { apiClient } from '../../lib/apiClient';
import { Spinner } from '../ui/Spinner';

type ValidateResult = { valid: boolean };

export function RequireLicenseToken({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
  const licenseKey = getLicenseKey();

  useEffect(() => {
    if (!licenseKey) {
      setStatus('invalid');
      return;
    }
    let mounted = true;
    apiClient<ValidateResult>('/api/licenses/verify', {
      method: 'POST',
      body: JSON.stringify({ licenseKey })
    })
      .then((data) => {
        if (!mounted) return;
        setStatus(data.valid ? 'valid' : 'invalid');
      })
      .catch(() => {
        if (mounted) setStatus('invalid');
      });
    return () => {
      mounted = false;
    };
  }, [licenseKey]);

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
