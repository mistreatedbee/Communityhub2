import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../components/ui/Toast';
import { supabase } from '../../lib/supabase';
import { getSafeErrorMessage } from '../../utils/errors';

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { organization } = useTheme();
  const rolePriority: Record<string, number> = {
    owner: 4,
    admin: 3,
    supervisor: 2,
    employee: 1,
    member: 0
  };
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const redirectPath = (location.state as { from?: string } | null)?.from ?? '/communities';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);
    if (error) {
      addToast(getSafeErrorMessage(error, 'Unable to sign in. Please check your credentials.'), 'error');
      return;
    }

    addToast('Successfully logged in!', 'success');
    if (redirectPath !== '/communities') {
      navigate(redirectPath);
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      navigate('/communities');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('platform_role')
      .eq('user_id', userId)
      .maybeSingle<{ platform_role: 'user' | 'super_admin' }>();

    if (profile?.platform_role === 'super_admin') {
      navigate('/super-admin');
      return;
    }

    const { data: memberships } = await supabase
      .from('organization_memberships')
      .select('organization_id, role, status')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (memberships && memberships.length > 0) {
      const primary = memberships.sort(
        (a, b) => (rolePriority[b.role] ?? 0) - (rolePriority[a.role] ?? 0)
      )[0];
      const { data: org } = await supabase
        .from('organizations')
        .select('slug')
        .eq('id', primary.organization_id)
        .maybeSingle<{ slug: string }>();
      if (org?.slug) {
        const adminRoles = ['owner', 'admin', 'supervisor'];
        navigate(
          adminRoles.includes(primary.role)
            ? `/c/${org.slug}/admin`
            : `/c/${org.slug}/app`
        );
        return;
      }
    }

    navigate('/communities');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
            {organization.name.charAt(0)}
          </div>
          <span className="font-bold text-2xl text-gray-900">{organization.name}</span>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back</h2>
        <p className="mt-2 text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]">
            Create a tenant
          </Link>
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-xl border-0 ring-1 ring-gray-200">
          <CardContent className="p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                leftIcon={<Mail className="w-5 h-5" />}
              />

              <div>
                <Input
                  label="Password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  leftIcon={<Lock className="w-5 h-5" />}
                />

                <div className="flex justify-end mt-1">
                  <Link to="/forgot-password" className="text-xs font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" isLoading={isLoading} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
