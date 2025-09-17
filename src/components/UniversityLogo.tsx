import React from 'react';
import { GraduationCap } from 'lucide-react';

const UniversityLogo: React.FC = () => {
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="relative">
        {/* Logo placeholder with university colors */}
        <div className="w-20 h-20 bg-gradient-to-br from-teal-600 to-teal-700 rounded-full flex items-center justify-center shadow-lg">
          <GraduationCap className="w-10 h-10 text-white" />
        </div>
        {/* Decorative ring */}
        <div className="absolute inset-0 rounded-full border-4 border-amber-700 opacity-20"></div>
      </div>
    </div>
  );
};

export default UniversityLogo;