import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, KeyRound, ShieldCheck, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const whatsappHref =
  'https://wa.me/27731531188?text=Hi%20Ashley%2C%20I%E2%80%99d%20like%20to%20purchase%20a%20Community%20Hub%20license%E2%80%A6';

export function AdminEntryPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-4">
            <ShieldCheck className="w-4 h-4" />
            Admin onboarding
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Community Admin Access</h1>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            This area is for organizations creating and managing their own Community Hub.
          </p>
          <p className="text-sm text-gray-500 mt-3">
            New? Enter your license key. Already have an account? Log in.
          </p>
        </div>

        <Card className="border-0 ring-1 ring-gray-200 shadow-xl">
          <CardContent className="p-8 grid md:grid-cols-3 gap-4">
            <Link to="/enter-license">
              <Button className="w-full h-14" rightIcon={<ArrowRight className="w-4 h-4" />} leftIcon={<KeyRound className="w-4 h-4" />}>
                Enter License Key
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="w-full h-14">
                Log in
              </Button>
            </Link>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" className="w-full h-14" leftIcon={<MessageCircle className="w-4 h-4" />}>
                Contact Sales
              </Button>
            </a>
          </CardContent>
        </Card>

        <div className="mt-6 bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-2">What is a license?</h2>
          <p className="text-sm text-gray-600">
            A license lets your organization create and manage its own tenant hub. Existing clients should enter
            their key first, then create/administer their community.
          </p>
        </div>
      </div>
    </div>
  );
}

