import React, { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'amber' | 'indigo' | 'rose';
}

const FormSection: React.FC<FormSectionProps> = ({ 
  title, 
  icon, 
  children, 
  color = 'blue' 
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-100',
    green: 'bg-green-50 border-green-100',
    purple: 'bg-purple-50 border-purple-100',
    amber: 'bg-amber-50 border-amber-100',
    indigo: 'bg-indigo-50 border-indigo-100',
    rose: 'bg-rose-50 border-rose-100',
  };

  const iconColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    amber: 'text-amber-600',
    indigo: 'text-indigo-600',
    rose: 'text-rose-600',
  };

  return (
    <div className={`mb-6 p-4 rounded-lg border ${colorClasses[color]}`}>
      <h2 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
        {icon && <span className={`mr-2 ${iconColorClasses[color]}`}>{icon}</span>}
        {title}
      </h2>
      {children}
    </div>
  );
};

export default FormSection;
