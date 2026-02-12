import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTheme } from '../../contexts/ThemeContext';
import { NavItem } from '../../types';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { organization } = useTheme();
  const location = useLocation();

  // Detect scroll for glass effect enhancement
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: NavItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Communities', href: '/communities' },
    { label: 'Pricing', href: '/pricing' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  // Close mobile menu on navigation
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`
        sticky top-0 z-50 w-full transition-all duration-300
        ${
          scrolled
            ? 'bg-white/90 backdrop-blur-lg shadow-sm border-b border-gray-200/50'
            : 'bg-white/80 backdrop-blur-md border-b border-gray-100'
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo + brand name */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group transition-transform hover:scale-[0.98] active:scale-95"
          >
            {/* 🔹 Use logo.png from public as fallback, otherwise organization.logo */}
            <img
              src={organization.logo || '/logo.png'}
              alt={organization.name}
              className="h-8 w-auto md:h-9 object-contain transition-all duration-200 group-hover:opacity-90"
            />
            <span className="font-bold text-xl md:text-2xl text-gray-900 tracking-tight">
              {organization.name}
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`
                  relative text-sm font-medium transition-colors duration-200
                  after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-0
                  after:bg-[var(--color-primary)] after:transition-all after:duration-300
                  hover:after:w-full
                  ${
                    isActive(item.href)
                      ? 'text-[var(--color-primary)] after:w-full'
                      : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/admin">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-100/80"
              >
                Admin Login
              </Button>
            </Link>
            <Link to="/admin">
              <Button
                size="sm"
                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-sm hover:shadow-md transition-all"
              >
                Create Community Hub
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden relative w-10 h-10 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-100/80 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu – slide-down with fade animation */}
      <div
        className={`
          md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-lg
          border-b border-gray-200 shadow-lg overflow-hidden transition-all duration-300
          ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 border-none'}
        `}
      >
        <div className="px-4 py-5 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`
                flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium
                transition-all duration-200
                ${
                  isActive(item.href)
                    ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                    : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900'
                }
              `}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
              <ChevronRight size={18} className={isActive(item.href) ? 'opacity-100' : 'opacity-50'} />
            </Link>
          ))}
          <div className="mt-6 pt-6 border-t border-gray-200/80 flex flex-col gap-3">
            <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-2">
                Admin Login
              </Button>
            </Link>
            <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
              <Button className="w-full justify-start gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white">
                Create Community Hub
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
