import React from 'react';
import { Loader2 } from 'lucide-react';
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  light?: boolean;
}
export function Spinner({
  size = 'md',
  className = '',
  light = false
}: SpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };
  return (
    <Loader2
      className={`
        animate-spin 
        ${sizes[size]} 
        ${light ? 'text-white' : 'text-[var(--color-primary)]'} 
        ${className}
      `} />);


}