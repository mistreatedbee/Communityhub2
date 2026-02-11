import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../components/ui/Toast';
import { supabase } from '../../lib/supabase';
import { setLicenseToken } from '../../utils/licenseToken';

type VerifyResult = {
  valid: boolean;
  token?: string;
  plan_name?: string;
  error?: string;
  status?: string;
};

export function EnterLicensePage() {
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const { organization } = useTheme();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const key = licenseKey.trim();
    if (!key) {
      addToast('Please enter your license key.', 'error');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('verify_license', { license_key: key }).returns<VerifyResult>();

      if (error) {
        addToast(error.message ?? 'Verification failed.', 'error');
        setLoading(false);
        return;
      }

      const result = data as VerifyResult | null;
      if (!result?.valid || !result.token) {
        addToast(result?.error ?? 'Invalid or expired license key.', 'error');
        setLoading(false);
        return;
      }

      setLicenseToken(result.token, key);
      addToast(result.plan_name ? `License verified: ${result.plan_name}. Continue to sign up.` : 'License verified. Continue to sign up.', 'success');
      navigate('/signup', { replace: true });
    } catch (err) {
      console.error('Verify license error', err);
      addToast('Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-xl shadow-lg">
            {organization.name.charAt(0)}
          </div>
          <span className="font-bold text-2xl text-gray-900">{organization.name}</span>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Enter your license key</h2>
        <p className="mt-2 text-sm text-gray-600">
          You need a valid license to create a community. Enter the key you received below.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-xl border-0 ring-1 ring-gray-200">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="License key"
                type="text"
                placeholder="XXXX-XXXX-XXXX-XXXX"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                autoComplete="off"
                leftIcon={<KeyRound className="w-5 h-5" />}
              />
              <Button type="submit" className="w-full" size="lg" isLoading={loading}>
                Verify and continue
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-500">
              Already have an account? <Link to="/login" className="font-medium text-[var(--color-primary)]">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
