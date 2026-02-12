import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';

export function TenantAdminRegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="max-w-lg w-full">
        <CardContent className="p-6 space-y-3">
          <h1 className="text-2xl font-bold text-gray-900">Admin Registration</h1>
          <p className="text-sm text-gray-600">Use the license-first flow: verify your license, sign up, then create your tenant.</p>
          <Link className="text-[var(--color-primary)] hover:underline" to="/enter-license">
            Go to license verification
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
