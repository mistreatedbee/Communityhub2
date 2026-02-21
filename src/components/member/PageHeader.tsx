import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel = 'Back',
  className = ''
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  className?: string;
}) {
  return (
    <header className={`mb-8 sm:mb-10 ${className}`}>
      {backHref && (
        <Link
          to={backHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-[var(--color-primary)] transition-colors duration-200 mb-3"
        >
          <ChevronLeft className="w-4 h-4" />
          {backLabel}
        </Link>
      )}
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-lg text-gray-600 max-w-2xl">
          {subtitle}
        </p>
      )}
    </header>
  );
}
