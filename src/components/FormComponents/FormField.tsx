import React, { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  className?: string;
  labelClassName?: string;
  children: ReactNode;
  tooltip?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  required = false,
  error,
  className = '',
  labelClassName = '',
  children,
  tooltip
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label 
        htmlFor={name} 
        className={`block text-sm font-medium text-gray-700 mb-2 ${labelClassName}`}
      >
        {label} {required && <span className="text-red-500">*</span>}
        {tooltip && (
          <span className="ml-1 group relative">
            <span className="cursor-help text-gray-400 hover:text-gray-600">ⓘ</span>
            <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition before:absolute before:left-1/2 before:top-full before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-black before:content-[''] group-hover:opacity-100">
              {tooltip}
            </span>
          </span>
        )}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FormField;
