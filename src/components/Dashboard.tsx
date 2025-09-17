import React from 'react';
import { Profile } from '../lib/supabase';
import { LogOut, Calendar, Users, BarChart3, Settings } from 'lucide-react';

interface DashboardProps {
  user: Profile;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'administrator':
        return 'bg-purple-100 text-purple-800';
      case 'faculty':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDashboardItems = () => {
    switch (user.role) {
      case 'administrator':
        return [
          { icon: Users, title: 'Manage Users', description: 'Add, edit, or remove faculty and students' },
          { icon: BarChart3, title: 'Reports', description: 'View attendance reports and analytics' },
          { icon: Settings, title: 'System Settings', description: 'Configure system parameters' },
          { icon: Calendar, title: 'Academic Calendar', description: 'Manage semester and holiday dates' }
        ];
      case 'faculty':
        return [
          { icon: Calendar, title: 'Mark Attendance', description: 'Take attendance for your classes' },
          { icon: Users, title: 'View Students', description: 'See enrolled students in your courses' },
          { icon: BarChart3, title: 'Attendance Reports', description: 'Generate and view class reports' }
        ];
      case 'student':
        return [
          { icon: Calendar, title: 'My Attendance', description: 'View your attendance record' },
          { icon: BarChart3, title: 'Attendance Summary', description: 'Check your attendance percentage' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Attendance Management</h1>
              <p className="text-sm text-gray-600">Dr. Babasaheb Ambedkar Marathwada University</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {user.name}!
              </h2>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">{user.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getDashboardItems().map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer group"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-teal-200 transition-colors duration-200">
                      <IconComponent className="w-6 h-6 text-teal-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-teal-600 transition-colors duration-200">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;