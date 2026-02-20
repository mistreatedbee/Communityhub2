import React, { useEffect, useState } from 'react';
import { normalizeImageUrl } from '../../utils/image';

type SafeImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
};

export function SafeImage({ src, fallbackSrc, onError, ...props }: SafeImageProps) {
  const normalizedSrc = normalizeImageUrl(typeof src === 'string' ? src : undefined);
  const normalizedFallback = normalizeImageUrl(fallbackSrc);
  const [currentSrc, setCurrentSrc] = useState(normalizedSrc || normalizedFallback);

  useEffect(() => {
    setCurrentSrc(normalizedSrc || normalizedFallback);
  }, [normalizedSrc, normalizedFallback]);

  if (!currentSrc) return null;

  return (
    <img
      {...props}
      src={currentSrc}
      onError={(event) => {
        if (normalizedFallback && currentSrc !== normalizedFallback) {
          setCurrentSrc(normalizedFallback);
        }
        onError?.(event);
      }}
    />
  );
}
