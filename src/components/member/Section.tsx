import React from 'react';
import { Link } from 'react-router-dom';

export function Section({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`mb-12 sm:mb-14 ${className}`}>
      {children}
    </section>
  );
}

export function SectionTitle({
  title,
  viewAllHref,
  viewAllLabel = 'View all'
}: {
  title: string;
  viewAllHref?: string;
  viewAllLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
      <h2 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
        {title}
      </h2>
      {viewAllHref && (
        <Link
          to={viewAllHref}
          className="text-sm font-medium transition-colors duration-200 hover:opacity-90"
          style={{ color: 'var(--color-primary)' }}
        >
          {viewAllLabel}
        </Link>
      )}
    </div>
  );
}
