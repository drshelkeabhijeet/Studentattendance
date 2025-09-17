import React from 'react';
import { UserRole } from '../types/auth';
import { ChevronDown, Shield, Users, BookOpen } from 'lucide-react';

interface RoleSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
  error?: string;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ value, onChange, error }) => {
  const roles = [
    { value: 'administrator' as UserRole, label: 'Administrator', icon: Shield },
    { value: 'faculty' as UserRole, label: 'Faculty Member', icon: Users },
    { value: 'student' as UserRole, label: 'Student', icon: BookOpen }
  ];

  const selectedRole = roles.find(role => role.value === value);
  const SelectedIcon = selectedRole?.icon || Shield;

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-amber-800 mb-2">
        Login As
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as UserRole)}
          className={`w-full px-4 py-3 pl-12 pr-12 text-gray-700 bg-white border-2 rounded-lg transition-all duration-200 appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-teal-400 ${
            error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
          }`}
        >
          {roles.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
        <SelectedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-teal-600" />
        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
};

export default RoleSelector;