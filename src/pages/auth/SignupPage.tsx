import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Mail, Lock, User, Phone } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../components/ui/Toast';
import { getPasswordValidationError, isValidEmail } from '../../utils/validation';
import { registerWithPassword } from '../../lib/apiAuth';
import { getLicenseKey } from '../../utils/licenseToken';
import { apiClient } from '../../lib/apiClient';

export function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [licenseState, setLicenseState] = useState<'loading' | 'valid' | 'invalid'>('loading');
  const { organization } = useTheme();
  const navigate = useNavigate();
  const { addToast } = useToast();

  React.useEffect(() => {
    const run = async () => {
      const licenseKey = getLicenseKey();
      if (!licenseKey) {
        setLicenseState('invalid');
        return;
      }
      try {
        const res = await apiClient<{ valid: boolean }>('/api/licenses/verify', {
          method: 'POST',
          body: JSON.stringify({ licenseKey })
        });
        setLicenseState(res.valid ? 'valid' : 'invalid');
      } catch {
        setLicenseState('invalid');
      }
    };
    void run();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      addToast('Full name is required.', 'error');
      return;
    }
    if (!isValidEmail(email)) {
      addToast('Enter a valid email address.', 'error');
      return;
    }
    const passwordError = getPasswordValidationError(password);
    if (passwordError) {
      addToast(passwordError, 'error');
      return;
    }

    setLoading(true);
    try {
      await registerWithPassword({
        email: email.trim().toLowerCase(),
        password,
        fullName: fullName.trim(),
        phone: phone.trim() || undefined
      });
      addToast('Account created. Set up your community.', 'success');
      navigate('/setup-community', { replace: true });
    } catch (err) {
      console.error('Signup error', err);
      addToast(err instanceof Error ? err.message : 'Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (licenseState === 'loading') {
    return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Verifying license...</div>;
  }

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/enter-license');
  };

  if (licenseState === 'invalid') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="absolute top-4 left-4 sm:left-6">
          <button type="button" onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
        <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center px-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900">Enter license first</h2>
            <p className="text-sm text-gray-600 mt-2">
              Admin signup is available only after license verification.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/enter-license">
                <Button>Enter License Key</Button>
              </Link>
              <Link to="/contact-sales">
                <Button variant="outline">Contact Sales</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-xl">
            {organization.name.charAt(0)}
          </div>
          <span className="font-bold text-2xl text-gray-900">{organization.name}</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Create your admin account</h1>
        <p className="mt-2 text-sm text-gray-600">License verified. Continue to create your account.</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="shadow-lg border border-gray-200 rounded-xl bg-white">
          <CardContent className="p-6 sm:p-8 space-y-5">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                leftIcon={<User className="w-5 h-5" />}
              />
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-5 h-5" />}
              />
              <Input
                label="Phone (optional)"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone className="w-5 h-5" />}
                placeholder="e.g. +27 12 345 6789"
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-5 h-5" />}
              />
              <Button type="submit" className="w-full" size="lg" isLoading={loading} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Create account
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-500">
              Already have an account? <Link to="/login" className="font-medium text-[var(--color-primary)] hover:underline">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
