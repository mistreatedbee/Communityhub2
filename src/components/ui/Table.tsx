import React from 'react';
interface TableProps {
  children: React.ReactNode;
  className?: string;
}
export function Table({ children, className = '' }: TableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">{children}</table>
    </div>);

}
export function TableHead({ children }: {children: React.ReactNode;}) {
  return <thead className="bg-gray-50">{children}</thead>;
}
export function TableBody({ children }: {children: React.ReactNode;}) {
  return <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>;
}
export function TableRow({
  children,
  onClick,
  className = ''




}: {children: React.ReactNode;onClick?: () => void;className?: string;}) {
  return (
    <tr
      onClick={onClick}
      className={`
        ${onClick ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}
        ${className}
      `}>

      {children}
    </tr>);

}
export function TableHeader({
  children,
  className = ''



}: {children: React.ReactNode;className?: string;}) {
  return (
    <th
      scope="col"
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>

      {children}
    </th>);

}
export function TableCell({
  children,
  className = ''



}: {children: React.ReactNode;className?: string;}) {
  return (
    <td
      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${className}`}>

      {children}
    </td>);

}