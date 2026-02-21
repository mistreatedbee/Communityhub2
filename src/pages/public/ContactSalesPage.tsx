import React from 'react';
import { MessageCircle, Mail } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const whatsappHref =
  'https://wa.me/27731531188?text=Hi%20Ashley%2C%20I%E2%80%99d%20like%20to%20purchase%20a%20Community%20Hub%20license%E2%80%A6';

export function ContactSalesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 space-y-5">
        <h1 className="text-3xl font-bold text-gray-900">Contact Sales</h1>
        <p className="text-gray-600">
          Ready to launch your organization community hub? Contact Ashley to purchase a license and start onboarding.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
            <Button leftIcon={<MessageCircle className="w-4 h-4" />}>Message on WhatsApp</Button>
          </a>
          <a href="mailto:ashleymashigo013@gmail.com">
            <Button variant="outline" leftIcon={<Mail className="w-4 h-4" />}>
              Email Ashley
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}

