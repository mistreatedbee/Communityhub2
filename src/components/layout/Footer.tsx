import React from 'react';
import { Link } from 'react-router-dom';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
export function Footer() {
  const { organization } = useTheme();
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-lg">
                {organization.name.charAt(0)}
              </div>
              <span className="font-bold text-xl text-gray-900">{organization.name}</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              {organization.description ?? 'Launch and manage modern community hubs.'}
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/communities" className="text-gray-500 hover:text-[var(--color-primary)] text-sm">Communities</Link></li>
              <li><Link to="/pricing" className="text-gray-500 hover:text-[var(--color-primary)] text-sm">Pricing</Link></li>
              <li><Link to="/admin" className="text-gray-500 hover:text-[var(--color-primary)] text-sm">Admin Login</Link></li>
              <li><Link to="/contact-sales" className="text-gray-500 hover:text-[var(--color-primary)] text-sm">Contact Sales</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-gray-500">
                <Mail className="w-5 h-5 text-[var(--color-primary)] shrink-0" />
                <a href="mailto:ashleymashigo013@gmail.com" className="hover:text-[var(--color-primary)]">ashleymashigo013@gmail.com</a>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-500">
                <MessageCircle className="w-5 h-5 text-[var(--color-primary)] shrink-0" />
                <a href="https://wa.me/27731531188" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-primary)]">WhatsApp: 073 153 1188</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">� {new Date().getFullYear()} {organization.name}. All rights reserved.</p>
          <p className="text-sm text-gray-400 flex items-center gap-1">Powered by <span className="font-semibold text-gray-600">Community Hub</span></p>
        </div>
      </div>
    </footer>
  );
}
