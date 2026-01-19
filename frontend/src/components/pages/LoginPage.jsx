import React, { useState } from 'react';
import { LogIn, BookOpen, Mail, Lock, AlertCircle, Eye, EyeOff, Shield, School, User, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as api from '../../services/api';

const LoginPage = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const quickLogins = [
    { 
      role: 'ADMIN', 
      name: 'Dr. Rajesh Kumar',
      email: 'admin@shiksha-setu.gov.in', 
      password: 'admin123', 
      color: 'blue',
      icon: Shield,
      description: 'Government Official - Monitor all schools'
    },
    { 
      role: 'PRINCIPAL', 
      name: 'Mrs. Anita Sharma',
      email: 'principal.mumbai@school.edu', 
      password: 'principal123', 
      color: 'purple',
      icon: School,
      description: 'School Administrator - Monitor teachers'
    },
    { 
      role: 'TEACHER', 
      name: 'Priya Deshmukh',
      email: 'priya.deshmukh@school.edu', 
      password: 'teacher123', 
      color: 'green',
      icon: User,
      description: 'Teacher - Create training modules'
    }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.auth.login(credentials);
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      onLoginSuccess(response);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickCred) => {
    setCredentials(quickCred);
    setError('');
    setLoading(true);

    try {
      const response = await api.auth.login({ email: quickCred.email, password: quickCred.password });
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      onLoginSuccess(response);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
      {/* Back to Home Button */}
      <button
        onClick={() => navigate('/landing')}
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white transition-colors border shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </button>

      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8">{/* Left Side - Branding */}
        <div className="flex flex-col justify-center space-y-6 p-8">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Shiksha-Setu</h1>
              <p className="text-lg text-gray-600">शिक्षा-सेतु</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Localized Teacher Training, Powered by AI
            </h2>
            <p className="text-gray-600 text-lg">
              A bridge between state curricula and local teaching needs
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-800">For Administrators</h3>
                <p className="text-gray-600 text-sm">Monitor schools and oversee training programs</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <School className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-800">For Principals</h3>
                <p className="text-gray-600 text-sm">Track teacher performance and module creation</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-800">For Teachers</h3>
                <p className="text-gray-600 text-sm">Create personalized training modules with AI</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to access your dashboard</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">Login Failed</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="your.email@school.edu"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Login Demo Accounts */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Quick Demo Login</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {quickLogins.map((quick) => {
                const Icon = quick.icon;
                return (
                  <button
                    key={quick.email}
                    onClick={() => handleQuickLogin(quick)}
                    disabled={loading}
                    className={`w-full p-4 border-2 border-${quick.color}-200 bg-${quick.color}-50 hover:bg-${quick.color}-100 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group text-left`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 bg-${quick.color}-600 rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-${quick.color}-900 font-semibold`}>{quick.role}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-sm text-gray-600 truncate">{quick.name}</span>
                        </div>
                        <p className="text-xs text-gray-600">{quick.description}</p>
                      </div>
                      <LogIn className={`w-5 h-5 text-${quick.color}-600 group-hover:translate-x-1 transition-transform`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
