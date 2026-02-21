import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  Users,
  FileText,
  Calendar,
  ListTodo,
  Shield,
  HelpCircle,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { useTheme } from '../../contexts/ThemeContext';

const whatsappHref =
  'https://wa.me/27731531188?text=Hi%2C%20I%27m%20interested%20in%20a%20Community%20Hub%20license.';

export function PricingPage() {
  const { organization } = useTheme();

  const features = [
    { icon: Users, text: 'Up to 450 members' },
    { icon: Shield, text: 'Admin roles (Owner, Admin, Moderator)' },
    { icon: FileText, text: 'Posts & resources' },
    { icon: Calendar, text: 'Events & programs' },
    { icon: ListTodo, text: 'Groups & discussions' },
    { icon: CheckCircle, text: 'Audit logs & approvals' },
  ];

  const faqs = [
    {
      q: 'What happens if I need more than 450 members?',
      a: 'Contact our sales team – we offer custom enterprise plans with higher member limits and additional features.',
    },
    {
      q: 'Is this a one‑time payment or recurring?',
      a: 'The R 3,000 is a one‑time license fee. There are no monthly subscription fees.',
    },
    {
      q: 'Can I use my own domain?',
      a: 'Yes, each community hub can be configured with a custom domain (instructions provided after setup).',
    },
    {
      q: 'How do I get started after purchasing?',
      a: 'You’ll receive a license key via email. Enter it on the license page and follow the setup wizard.',
    },
  ];

  return (
    <>
      {/* Animated background – consistent with other pages */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100/50 to-gray-50" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, gray 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute top-0 -left-4 w-96 h-96 bg-[var(--color-primary)]/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -right-4 w-96 h-96 bg-[var(--color-primary)]/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative min-h-screen flex flex-col py-12 sm:px-6 lg:px-8">
        {/* Header with brand logo */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8 animate-fade-in-down">
          <Link
            to="/"
            className="inline-flex items-center gap-2 mb-6 group transition-transform hover:scale-105"
          >
            <img
              src={organization.logo || '/logo.png'}
              alt={organization.name}
              className="h-12 w-auto object-contain"
            />
            <span className="font-bold text-3xl text-gray-900">{organization.name}</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-gray-600 mt-3 max-w-2xl mx-auto">
            One‑time license fee for your own branded community hub.
          </p>
        </div>

        {/* Main pricing card */}
        <div className="max-w-5xl mx-auto w-full px-4">
          <Card className="shadow-2xl border-0 ring-1 ring-gray-200/80 backdrop-blur-sm bg-white/95 overflow-hidden">
            <CardContent className="p-8 md:p-10">
              <div className="grid md:grid-cols-2 gap-10 items-start">
                {/* Left column – price and basic info */}
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-medium">
                    <Sparkles className="w-4 h-4" />
                    Community Hub License
                  </div>
                  <div>
                    <p className="text-5xl font-bold text-gray-900">R 3,000</p>
                    <p className="text-sm text-gray-500 mt-1">once‑off, per community</p>
                  </div>
                  <ul className="space-y-3">
                    {features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-600">
                        <feature.icon className="w-5 h-5 text-[var(--color-primary)] shrink-0 mt-0.5" />
                        <span className="text-sm">{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right column – CTA and purchase info */}
                <div className="space-y-6">
                  <div className="bg-gray-50/80 rounded-xl p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Ready to launch your hub?
                    </h3>
                    <p className="text-sm text-gray-600 mb-5">
                      Purchase a license via WhatsApp, or enter your key if you already have one.
                    </p>
                    <div className="flex flex-col gap-3">
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full"
                      >
                        <Button
                          size="lg"
                          className="w-full gap-2"
                          leftIcon={<MessageCircle className="w-4 h-4" />}
                        >
                          Contact Sales to Purchase
                        </Button>
                      </a>
                      <Link to="/enter-license" className="w-full">
                        <Button size="lg" variant="outline" className="w-full gap-2">
                          Enter License Key
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500 space-y-2">
                    <p className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Instant license delivery after payment
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      No hidden fees – what you see is what you pay
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What's included – feature grid */}
          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to run your community</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-12">
              All features are included in the base license – no tiered upsells.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Users, title: 'Member management', desc: 'Invite, approve, and manage members with granular roles.' },
                { icon: Shield, title: 'Role‑based access', desc: 'Owners, admins, moderators – each with tailored permissions.' },
                { icon: FileText, title: 'Content publishing', desc: 'Posts, resources, and announcements for your community.' },
                { icon: Calendar, title: 'Events & programs', desc: 'Schedule events, programs, and track attendance.' },
                { icon: ListTodo, title: 'Groups & discussions', desc: 'Create subgroups and foster focused conversations.' },
                { icon: CheckCircle, title: 'Audit logs & approvals', desc: 'Keep track of changes and moderate content.' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/80 hover:border-[var(--color-primary)]/30 hover:shadow-lg transition-all duration-300"
                >
                  <item.icon className="w-8 h-8 text-[var(--color-primary)] mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ section */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Frequently asked questions
            </h2>
            <div className="max-w-3xl mx-auto divide-y divide-gray-200">
              {faqs.map((faq, idx) => (
                <div key={idx} className="py-6">
                  <h3 className="text-lg font-medium text-gray-900 flex items-start gap-2">
                    <HelpCircle className="w-5 h-5 text-[var(--color-primary)] shrink-0 mt-0.5" />
                    {faq.q}
                  </h3>
                  <p className="mt-2 text-gray-600 text-sm pl-7">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Final CTA */}
          <div className="mt-16 text-center bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Still have questions?
            </h2>
            <p className="text-gray-300 mb-6 max-w-xl mx-auto">
              Our team is ready to help you choose the right solution for your community.
            </p>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                variant="primary"
                className="bg-white text-gray-900 hover:bg-gray-100 gap-2"
                leftIcon={<MessageCircle className="w-4 h-4" />}
              >
                Chat with us on WhatsApp
              </Button>
            </a>
          </div>
        </div>

        {/* Footer (optional, but matches other pages) */}
        <footer className="mt-16 text-center text-xs text-gray-500">
          <div className="flex justify-center gap-6 mb-3">
            <Link to="/privacy" className="hover:text-gray-700 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-gray-700 transition-colors">
              Terms of Service
            </Link>
            <Link to="/contact" className="hover:text-gray-700 transition-colors">
              Contact
            </Link>
          </div>
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} {organization.name}. All rights reserved.
          </p>
        </footer>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out;
        }
      `}</style>
    </>
  );
}
