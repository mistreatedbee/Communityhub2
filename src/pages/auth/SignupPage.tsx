import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Lock, User } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../components/ui/Toast';
import { supabase } from '../../lib/supabase';
import { getPasswordValidationError, isValidEmail } from '../../utils/validation';
import { RequireLicenseToken } from '../../components/auth/RequireLicenseToken';

export function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { organization } = useTheme();
  const navigate = useNavigate();
  const { addToast } = useToast();

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
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { full_name: fullName.trim() },
          emailRedirectTo: `${window.location.origin}/setup-community`
        }
      });

      if (error) {
        addToast(error.message ?? 'Unable to create account.', 'error');
        setLoading(false);
        return;
      }

      if (!data.user) {
        addToast('Unable to create account.', 'error');
        setLoading(false);
        return;
      }

      if (data.session) {
        addToast('Account created. Set up your community.', 'success');
        navigate('/setup-community', { replace: true });
      } else {
        addToast('Account created. Check your email to confirm, then sign in to set up your community.', 'success');
        navigate('/login', { replace: true, state: { from: '/setup-community' } });
      }
    } catch (err) {
      console.error('Signup error', err);
      addToast('Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequireLicenseToken>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-xl">
              {organization.name.charAt(0)}
            </div>
            <span className="font-bold text-2xl text-gray-900">{organization.name}</span>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign up to set up your community. You’ve already verified your license.
          </p>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="shadow-xl border-0 ring-1 ring-gray-200">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
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
                Already have an account? <Link to="/login" className="font-medium text-[var(--color-primary)]">Sign in</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </RequireLicenseToken>
  );
}
