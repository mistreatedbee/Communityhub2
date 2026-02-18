import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../components/ui/Toast';

export function ForgotPasswordPage() {
  const { organization } = useTheme();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const error = new Error('Password reset is not enabled yet. Contact support.');
    setIsLoading(false);
    if (error) {
      addToast(error.message, 'error');
      return;
    }
    setIsSuccess(true);
  };
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="absolute top-4 left-4 sm:left-6">
        <button type="button" onClick={goBack} className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Link to="/" className="flex justify-center items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-xl">
            {organization.name.charAt(0)}
          </div>
          <span className="font-bold text-2xl text-gray-900">
            {organization.name}
          </span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {isSuccess ?
          <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Check your email
              </h3>
              <p className="mt-2 text-sm text-gray-500 mb-6">
                We have sent a password reset link to <strong>{email}</strong>.
              </p>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div> :

          <form className="space-y-6" onSubmit={handleSubmit}>
              <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              leftIcon={<Mail className="w-5 h-5 text-gray-400" />} />


              <Button
              type="submit"
              className="w-full flex justify-center py-2 px-4"
              isLoading={isLoading}>

                Send Reset Link
              </Button>

              <div className="flex items-center justify-center">
                <Link
                to="/login"
                className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900">

                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Link>
              </div>
            </form>
          }
        </div>
      </div>
    </div>);

}
