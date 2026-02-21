import React, { useEffect, useState, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
interface DropdownItem {
  label: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  danger?: boolean;
  href?: string;
}
interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
}
export function Dropdown({ trigger, items, align = 'left' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node))
      {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen &&
      <div
        className={`
            absolute z-50 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none
            ${align === 'right' ? 'right-0' : 'left-0'}
            animate-in fade-in zoom-in-95 duration-100
          `}>

          <div className="py-1" role="menu">
            {items.map((item, index) => {
              const classes = `
                w-full text-left px-4 py-2 text-sm flex items-center gap-2
                ${item.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50'}
              `;
              if (item.href) {
                return (
                  <Link
                    key={index}
                    to={item.href}
                    onClick={() => {
                      item.onClick?.();
                      setIsOpen(false);
                    }}
                    className={classes}
                    role="menuitem"
                  >
                    {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                    {item.label}
                  </Link>
                );
              }
              return (
                <button
                  key={index}
                  onClick={() => {
                    item.onClick?.();
                    setIsOpen(false);
                  }}
                  className={classes}
                  role="menuitem"
                >
                  {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      }
    </div>);

}
