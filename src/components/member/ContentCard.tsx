import React from 'react';

/**
 * Content block for feed items (announcements, events, etc.).
 * Subtle background, generous padding, rounded corners—content-first, not admin card.
 */
export function ContentCard({
  children,
  className = '',
  hoverable = false,
  accentLeft = false,
  onClick
}: {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  accentLeft?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-xl bg-gray-50/80 px-5 py-4 sm:px-6 sm:py-5
        ${accentLeft ? 'border-l-4 pl-5 sm:pl-6' : ''}
        ${accentLeft ? 'border-l-[var(--color-primary)]' : ''}
        ${hoverable || onClick ? 'cursor-pointer transition-all duration-200 hover:bg-gray-100/90' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
