import React from 'react';

/**
 * Wraps tenant member and public community page content with consistent
 * max-width, horizontal padding, and vertical spacing.
 * Design system: max-w-6xl, px-4 sm:px-6 lg:px-8, py-8 sm:py-10.
 */
export function MemberPageContainer({
  children,
  className = '',
  narrow = false
}: {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
}) {
  return (
    <div
      className={`mx-auto w-full px-4 py-8 sm:px-6 sm:py-10 lg:px-8 ${narrow ? 'max-w-4xl' : 'max-w-6xl'} ${className}`}
    >
      {children}
    </div>
  );
}
