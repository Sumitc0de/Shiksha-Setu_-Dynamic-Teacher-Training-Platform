import React, { useState, useEffect } from 'react';
import { School, Users, BookOpen, CheckCircle, Clock, TrendingUp, UserCheck, LogOut, BarChart3, PieChart, Award, Target } from 'lucide-react';
import * as api from '../../services/api';
import SimpleBarChart from '../charts/SimpleBarChart';
import SimplePieChart from '../charts/SimplePieChart';
import TrendIndicator from '../charts/TrendIndicator';

const PrincipalDashboard = ({ user }) => {
  const [dashboard, setDashboard] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardData, teachersData, clustersData, modulesData] = await Promise.all([
        api.schools.getDashboard(),
        api.schools.listTeachers(0, 20),
        api.schools.listClusters(0, 20),
        api.schools.listModules(0, 20)
      ]);
      setDashboard(dashboardData);
      setTeachers(teachersData);
      setClusters(clustersData);
      setModules(modulesData);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.auth.logout();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading school dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">School Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user.name}</p>
              {dashboard && (
                <p className="text-lg font-semibold text-purple-600 mt-2">{dashboard.school_name}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Role</div>
                <div className="text-lg font-semibold text-purple-600">Principal</div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('teachers')}
              className={`py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'teachers'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Teachers
            </button>
            <button
              onClick={() => setActiveTab('clusters')}
              className={`py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'clusters'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Clusters
            </button>
            <button
              onClick={() => setActiveTab('modules')}
              className={`py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'modules'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Modules
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && dashboard && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={Users}
                label="Total Teachers"
                value={dashboard.total_teachers}
                subtitle={`${dashboard.active_teachers} active`}
                color="purple"
                trend={5}
              />
              <StatCard
                icon={BookOpen}
                label="Training Clusters"
                value={dashboard.total_clusters}
                color="blue"
                trend={10}
              />
              <StatCard
                icon={CheckCircle}
                label="Approved Modules"
                value={dashboard.approved_modules}
                color="green"
                trend={15}
              />
              <StatCard
                icon={Clock}
                label="Pending Modules"
                value={dashboard.pending_modules}
                color="orange"
                trend={-8}
              />
            </div>

            {/* Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Module Status Distribution */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <PieChart className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-bold text-gray-900">Module Status</h3>
                </div>
                <SimplePieChart
                  data={[
                    { label: 'Approved', value: dashboard.approved_modules },
                    { label: 'Pending', value: dashboard.pending_modules },
                    { label: 'In Progress', value: Math.max(0, dashboard.total_modules - dashboard.approved_modules - dashboard.pending_modules) }
                  ]}
                />
              </div>

              {/* Teacher Performance Metrics */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-bold text-gray-900">Performance</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Approval Rate</div>
                    <TrendIndicator 
                      value={`${dashboard.total_modules > 0 ? Math.round((dashboard.approved_modules / dashboard.total_modules) * 100) : 0}%`}
                      trend={3}
                    />
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Avg Modules/Teacher</div>
                    <TrendIndicator 
                      value={Math.round(dashboard.total_modules / Math.max(1, dashboard.total_teachers))}
                      trend={7}
                    />
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Active Teachers</div>
                    <TrendIndicator 
                      value={`${Math.round((dashboard.active_teachers / Math.max(1, dashboard.total_teachers)) * 100)}%`}
                      trend={2}
                    />
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900">Key Metrics</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Total Modules</span>
                    <span className="text-xl font-bold text-gray-900">{dashboard.total_modules}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Clusters per Teacher</span>
                    <span className="text-xl font-bold text-gray-900">
                      {(dashboard.total_clusters / Math.max(1, dashboard.total_teachers)).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Modules per Cluster</span>
                    <span className="text-xl font-bold text-gray-900">
                      {(dashboard.total_modules / Math.max(1, dashboard.total_clusters)).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Performing Teachers */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-bold text-gray-900">Top Performing Teachers</h2>
              </div>
              <SimpleBarChart
                data={teachers.slice(0, 5).map(teacher => ({
                  label: teacher.name,
                  value: teacher.total_modules
                }))}
                color="purple"
              />
            </div>

            {/* School Info */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">School Information</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-gray-500">District</div>
                  <div className="text-lg font-semibold text-gray-900">{dashboard.district || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">State</div>
                  <div className="text-lg font-semibold text-gray-900">{dashboard.state || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total Modules</div>
                  <div className="text-lg font-semibold text-gray-900">{dashboard.total_modules}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Approval Rate</div>
                  <div className="text-lg font-semibold text-green-600">
                    {dashboard.total_modules > 0
                      ? Math.round((dashboard.approved_modules / dashboard.total_modules) * 100)
                      : 0}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'teachers' && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Teacher Performance</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clusters</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modules</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approved</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recent Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {teachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{teacher.name}</div>
                        <div className="text-sm text-gray-500">{teacher.email}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-900">{teacher.total_clusters}</td>
                      <td className="px-6 py-4 text-gray-900">{teacher.total_modules}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {teacher.approved_modules}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {teacher.last_login ? (
                          <span className="text-sm text-gray-600">
                            {new Date(teacher.last_login).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">Never</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{teacher.recent_activity || 'No recent activity'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'clusters' && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Training Clusters</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cluster Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Language</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Topic</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modules</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {clusters.map((cluster) => (
                    <tr key={cluster.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{cluster.name}</td>
                      <td className="px-6 py-4 text-gray-600">{cluster.teacher_name}</td>
                      <td className="px-6 py-4 text-gray-600">{cluster.region_type}</td>
                      <td className="px-6 py-4 text-gray-600">{cluster.language}</td>
                      <td className="px-6 py-4 text-gray-600">{cluster.topic || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-900">{cluster.total_modules}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'modules' && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Training Modules</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Module Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cluster</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Language</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {modules.map((module) => (
                    <tr key={module.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{module.title}</td>
                      <td className="px-6 py-4 text-gray-600">{module.cluster_name}</td>
                      <td className="px-6 py-4 text-gray-600">{module.teacher_name}</td>
                      <td className="px-6 py-4 text-gray-600">{module.language || 'English'}</td>
                      <td className="px-6 py-4">
                        {module.approved ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(module.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, subtitle, color, trend }) => {
  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-600 mb-1">{label}</div>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            {trend !== undefined && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                trend > 0 ? 'bg-green-50 text-green-600' : trend < 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'
              }`}>
                <TrendingUp className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
                {trend > 0 ? '+' : ''}{trend}%
              </div>
            )}
          </div>
          {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
        </div>
      </div>
    </div>
  );
};

export default PrincipalDashboard;
