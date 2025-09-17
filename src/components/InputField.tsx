import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

interface InputFieldProps {
  type: 'email' | 'password';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder: string;
  label: string;
}

const InputField: React.FC<InputFieldProps> = ({
  type,
  value,
  onChange,
  error,
  placeholder,
  label
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const Icon = type === 'email' ? Mail : Lock;

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div>
      <label className="block text-sm font-semibold text-amber-800 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 pl-12 text-gray-700 bg-white border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:border-teal-400 ${
            error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
          }`}
        />
        <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-teal-600" />
        
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors duration-200"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
};

export default InputField;