import React, { SelectHTMLAttributes, ReactNode } from 'react';

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  name: string;
  value: string | number | readonly string[] | undefined;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
  className?: string;
  error?: boolean;
}

const FormSelect: React.FC<FormSelectProps> = ({
  name,
  value,
  onChange,
  children,
  className = '',
  error = false,
  ...rest
}) => {
  return (
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full p-3 border ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-md focus:ring-2 focus:border-transparent transition-all appearance-none bg-white ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
};

export default FormSelect;
