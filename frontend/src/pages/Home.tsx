import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, FileText, Calendar, Users, Clock, CheckCircle } from 'lucide-react';
import logo from '../assets/logo.png';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dcfce7] via-[#bbf7d0] to-[#86efac]">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-green-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img 
                src={logo} 
                alt="Midline Shift Manager Logo" 
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
              />
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 whitespace-nowrap">Midline Shift Manager</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Clinic Roster & Leave Management</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
            Simplify Your Clinic Operations
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-2xl mx-auto px-4">
            Smart scheduling. Quick leave requests. All in one place.
          </p>
        </div>

        {/* Two Column Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Admin Login Card */}
          <div 
            onClick={() => navigate('/admin-login')}
            className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border-2 border-transparent hover:border-green-500 overflow-hidden"
          >
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 text-white">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                  <Shield className="w-12 h-12" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-center mb-2">Admin Portal</h3>
              <p className="text-indigo-100 text-center text-lg">Manage shifts, staff & operations</p>
            </div>
            
            <div className="p-8">
              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">Manage daily clinic shifts and assignments</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">Review and approve leave requests</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">Monitor staff availability and schedules</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">Generate reports and manage clinics</p>
                </div>
              </div>

              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-lg group-hover:shadow-xl">
                <Shield className="w-5 h-5" />
                <span>Sign In as Admin</span>
              </button>

              <p className="text-sm text-gray-500 text-center mt-4">
                Requires admin credentials
              </p>
            </div>
          </div>

          {/* Staff Leave Application Card */}
          <div 
            onClick={() => navigate('/staff-leave-request')}
            className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border-2 border-transparent hover:border-green-500 overflow-hidden"
          >
            <div className="bg-gradient-to-br from-green-600 to-emerald-800 p-8 text-white">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                  <FileText className="w-12 h-12" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-center mb-2">Apply for Leave</h3>
              <p className="text-green-100 text-center text-lg">Submit your leave request</p>
            </div>
            
            <div className="p-8">
              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">Quick and easy leave application</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">No login required for staff members</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">Instant submission with reference number</p>
                </div>
              </div>

              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-lg group-hover:shadow-xl">
                <FileText className="w-5 h-5" />
                <span>Apply for Leave</span>
              </button>

              <p className="text-sm text-gray-500 text-center mt-4">
                Available for all staff members
              </p>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-16 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-8 max-w-4xl mx-auto border border-green-200">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="flex justify-center mb-3">
                <div className="bg-green-100 p-3 rounded-full">
                  <Clock className="w-8 h-8 text-green-700" />
                </div>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">24/7 Access</h4>
              <p className="text-sm text-gray-600">
                Apply for leave anytime, from anywhere
              </p>
            </div>
            <div>
              <div className="flex justify-center mb-3">
                <div className="bg-indigo-100 p-3 rounded-full">
                  <Users className="w-8 h-8 text-indigo-700" />
                </div>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Staff Management</h4>
              <p className="text-sm text-gray-600">
                Comprehensive roster and staff tracking
              </p>
            </div>
            <div>
              <div className="flex justify-center mb-3">
                <div className="bg-green-100 p-3 rounded-full">
                  <Calendar className="w-8 h-8 text-green-700" />
                </div>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Smart Scheduling</h4>
              <p className="text-sm text-gray-600">
                Automated shift assignments and coverage
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 pb-8 text-center text-gray-600">
        <p className="text-sm">
          © 2025 Midline Shift Manager. All rights reserved.
        </p>
      </div>
    </div>
  );
};

