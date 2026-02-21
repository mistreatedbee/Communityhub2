import React, { forwardRef } from 'react';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
  { label, error, helperText, leftIcon, rightIcon, className = '', ...props },
  ref) =>
  {
    return (
      <div className="w-full">
        {label &&
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        }
        <div className="relative">
          {leftIcon &&
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          }
          <input
            ref={ref}
            className={`
              block w-full rounded-lg border-gray-300 shadow-sm 
              focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] 
              disabled:bg-gray-50 disabled:text-gray-500
              placeholder:text-gray-400 transition-colors duration-200
              ${leftIcon ? 'pl-10' : 'pl-3'}
              ${rightIcon ? 'pr-10' : 'pr-3'}
              ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
              ${className}
            `}
            {...props} />

          {rightIcon &&
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
              {rightIcon}
            </div>
          }
        </div>
        {error &&
        <p className="mt-1.5 text-sm text-red-600 animate-in slide-in-from-top-1 fade-in duration-200">
            {error}
          </p>
        }
        {helperText && !error &&
        <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
        }
      </div>);

  }
);
Input.displayName = 'Input';