import React from 'react';
import { Button } from '../../components/ui/Button';

export function PricingPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900">Pricing</h1>
        <p className="text-gray-500">One-time license fee for your community hub.</p>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Community Hub License</h2>
          <p className="text-4xl font-bold text-gray-900 mb-4">R 3,000</p>
          <p className="text-sm text-gray-500 mb-6">Once-off license fee</p>
          <ul className="text-sm text-gray-600 space-y-2 mb-8 text-left">
            <li>Max members: 25</li>
            <li>Admin roles included</li>
            <li>Posts, resources, groups, events, programs</li>
            <li>Audit logs and approvals</li>
          </ul>
          <a
            href="https://wa.me/27731531188?text=Hi%2C%20I'm%20interested%20in%20a%20Community%20Hub%20license."
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto w-full"
          >
            <Button className="w-full">Contact Sales</Button>
          </a>
        </div>
      </div>
    </div>
  );
}
