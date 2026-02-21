import React from 'react';
import { Link } from 'react-router-dom';
import { SafeImage } from '../ui/SafeImage';
import { Button } from '../ui/Button';

export function CommunityHero({
  communityName,
  logoUrl,
  headline,
  subheadline,
  description,
  ctaLabel,
  ctaHref,
  ctaExternal = false,
  primaryColor = 'var(--color-primary)',
  backgroundImageUrl,
  overlayColor = 'rgba(15,23,42,0.4)'
}: {
  communityName: string;
  logoUrl?: string | null;
  headline?: string;
  subheadline?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  ctaExternal?: boolean;
  primaryColor?: string;
  backgroundImageUrl?: string | null;
  overlayColor?: string;
}) {
  const title = headline || `Welcome to ${communityName}`;
  const subtitle = subheadline || description || 'Discover everything happening in your community.';

  return (
    <section
      className="relative rounded-2xl overflow-hidden mb-10 sm:mb-12 bg-gray-900 min-h-[200px] sm:min-h-[240px] flex items-end sm:items-center"
      style={{
        backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: backgroundImageUrl ? overlayColor : undefined }}
      />
      <div className="relative z-10 w-full px-6 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12">
        <div className="max-w-2xl">
          {logoUrl && (
            <SafeImage
              src={logoUrl}
              alt={communityName}
              fallbackSrc="/logo.png"
              className="h-10 w-auto mb-4 sm:h-12 opacity-95"
            />
          )}
          {!logoUrl && (
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-4"
              style={{ backgroundColor: primaryColor }}
            >
              {communityName.charAt(0)}
            </div>
          )}
          <h1 className="text-3xl font-bold text-white tracking-tight sm:text-4xl md:text-5xl">
            {title}
          </h1>
          <p className="mt-2 sm:mt-3 text-base text-white/90 sm:text-lg max-w-xl">
            {subtitle}
          </p>
          {ctaLabel && (ctaHref || ctaExternal) && (
            <div className="mt-5 sm:mt-6">
              {ctaExternal && ctaHref ? (
                <a href={ctaHref} target="_blank" rel="noreferrer">
                  <Button
                    style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
                    className="text-white hover:opacity-90 transition-opacity"
                  >
                    {ctaLabel}
                  </Button>
                </a>
              ) : ctaHref ? (
                <Link to={ctaHref}>
                  <Button
                    style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
                    className="text-white hover:opacity-90 transition-opacity"
                  >
                    {ctaLabel}
                  </Button>
                </Link>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
