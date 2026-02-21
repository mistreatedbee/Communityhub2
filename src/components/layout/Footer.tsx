import React from 'react';
import { Link } from 'react-router-dom';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
  Heart,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { SafeImage } from '../../components/ui/SafeImage';

export function Footer() {
  const { organization } = useTheme();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
  ];

  const quickLinks = [
    { label: 'Communities', to: '/communities' },
    { label: 'Pricing', to: '/pricing' },
    { label: 'Admin Login', to: '/login' },
    { label: 'Create Community', to: '/enter-license' },
    { label: 'Contact Sales', to: '/contact-sales' },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-white to-gray-50/80 border-t border-gray-200/60 pt-16 pb-8 overflow-hidden">
      {/* Subtle animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-100/40 via-transparent to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main grid – 12‑column layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 mb-12">
          {/* Brand column */}
          <div className="md:col-span-4 lg:col-span-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 group transition-transform hover:scale-[0.98] active:scale-95 mb-4"
            >
              <SafeImage
                src={organization.logo || '/logo.png'}
                alt={organization.name}
                fallbackSrc="/logo.png"
                className="h-8 w-auto md:h-9 object-contain transition-all duration-200 group-hover:opacity-90"
              />
              <span className="font-bold text-xl md:text-2xl text-gray-900 tracking-tight">
                {organization.name}
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-xs">
              {organization.description ?? 'Launch and manage modern community hubs with enterprise‑grade security and licensing.'}
            </p>
            {/* Social icons */}
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-xl bg-gray-100/80 flex items-center justify-center text-gray-500 hover:text-white hover:bg-[var(--color-primary)] transition-all duration-300 hover:scale-110 hover:shadow-lg"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 md:col-start-6 lg:col-span-2 lg:col-start-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-5">
              Quick Links
            </h3>
            <ul className="space-y-3.5">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-500 hover:text-[var(--color-primary)] text-sm transition-colors duration-200 hover:translate-x-0.5 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3 lg:col-span-3">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-5">
              Get in touch
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-gray-500">
                <div className="shrink-0 w-6 h-6 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-[var(--color-primary)]" />
                </div>
                <a
                  href="mailto:ashleymashigo013@gmail.com"
                  className="hover:text-[var(--color-primary)] transition-colors break-all"
                >
                  ashleymashigo013@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-500">
                <div className="shrink-0 w-6 h-6 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-[var(--color-primary)]" />
                </div>
                <a
                  href="https://wa.me/27731531188"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--color-primary)] transition-colors"
                >
                  WhatsApp: +27 73 153 1188
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200/70 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400 flex items-center gap-1.5">
            © {currentYear} {organization.name}. All rights reserved.
          </p>
          <p className="text-sm text-gray-400 flex items-center gap-1.5">
            Built with <Heart className="w-3.5 h-3.5 text-red-400 fill-current" /> by{' '}
            <span className="font-medium text-gray-600">NextWave Digital</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
