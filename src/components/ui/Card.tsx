import React from 'react';
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}
export function Card({
  children,
  className = '',
  onClick,
  hoverable = false
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden
        ${hoverable || onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200' : ''}
        ${className}
      `}>

      {children}
    </div>);

}
export function CardHeader({
  children,
  className = ''



}: {children: React.ReactNode;className?: string;}) {
  return (
    <div className={`px-6 py-4 border-b border-gray-50 ${className}`}>
      {children}
    </div>);

}
export function CardContent({
  children,
  className = ''



}: {children: React.ReactNode;className?: string;}) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}
export function CardFooter({
  children,
  className = ''



}: {children: React.ReactNode;className?: string;}) {
  return (
    <div
      className={`px-6 py-4 bg-gray-50 border-t border-gray-100 ${className}`}>

      {children}
    </div>);

}