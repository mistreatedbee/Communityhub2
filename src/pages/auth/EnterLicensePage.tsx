import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, MessageCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/apiClient';
import { setLicenseToken } from '../../utils/licenseToken';

type VerifyResult = {
  valid: boolean;
  plan?: { name: string };
};

const whatsappHref =
  'https://wa.me/27731531188?text=Hi%20Ashley%2C%20I%E2%80%99d%20like%20to%20purchase%20a%20Community%20Hub%20license%E2%80%A6';

export function EnterLicensePage() {
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { organization } = useTheme();
  const { user, loading: authLoading, platformRole } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    if (authLoading || !user) return;
    if (platformRole === 'SUPER_ADMIN') {
      navigate('/super-admin', { replace: true });
    }
  }, [authLoading, user, platformRole, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const key = licenseKey.trim();
    if (!key) {
      addToast('Please enter your license key.', 'error');
      return;
    }
    setError(null);

    setLoading(true);
    try {
      const result = await apiClient<VerifyResult>('/api/licenses/verify', {
        method: 'POST',
        body: JSON.stringify({ licenseKey: key })
      });

      if (!result?.valid) {
        const msg = 'License invalid, expired, or already claimed.';
        setError(msg);
        addToast(msg, 'error');
        return;
      }

      setLicenseToken(key, key);
      addToast(result.plan?.name ? `License verified: ${result.plan.name}. Continue to sign up.` : 'License verified. Continue to sign up.', 'success');
      navigate('/signup', { replace: true });
    } catch (err) {
      console.error('Verify license error', err);
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="absolute top-4 left-4 sm:left-6">
        <button type="button" onClick={goBack} className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8 px-4">
        <Link to="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-xl shadow-lg">
            {organization.name.charAt(0)}
          </div>
          <span className="font-bold text-2xl text-gray-900">{organization.name}</span>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Enter your license key</h2>
        <p className="mt-2 text-sm text-gray-600">
          A license is required to create and manage your own community hub.
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Existing admin? <Link to="/login" className="font-medium text-[var(--color-primary)]">Log in</Link>
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="shadow-lg border border-gray-200 rounded-xl bg-white">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
              <Input
                label="License key"
                type="text"
                placeholder="CH-XXXXX-XXXXX-XXXXX-XXXXX"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                autoComplete="off"
                leftIcon={<KeyRound className="w-5 h-5" />}
              />
              <Button type="submit" className="w-full" size="lg" isLoading={loading}>
                Verify and continue
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-gray-500 space-y-2">
              <p>Need a new license?</p>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex">
                <Button variant="outline" leftIcon={<MessageCircle className="w-4 h-4" />}>Contact Sales</Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
