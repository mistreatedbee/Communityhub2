import React from 'react';
interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}
export function Avatar({ src, alt, size = 'md', className = '' }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-lg'
  };
  const initials = alt.
  split(' ').
  map((n) => n[0]).
  slice(0, 2).
  join('').
  toUpperCase();
  return (
    <div
      className={`relative inline-block rounded-full overflow-hidden bg-gray-100 ${sizes[size]} ${className}`}>

      {src ?
      <img src={src} alt={alt} className="w-full h-full object-cover" /> :

      <div className="w-full h-full flex items-center justify-center bg-[var(--color-primary)] text-white font-medium">
          {initials}
        </div>
      }
    </div>);

}