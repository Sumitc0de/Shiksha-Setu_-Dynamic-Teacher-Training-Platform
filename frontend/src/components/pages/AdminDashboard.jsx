import React, { useState, useEffect } from 'react';
import { School, Users, BookOpen, FileText, CheckCircle, Clock, TrendingUp, Activity, LogOut } from 'lucide-react';
import * as api from '../../services/api';

const AdminDashboard = ({ user }) => {
  const [overview, setOverview] = useState(null);
  const [schools, setSchools] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [overviewData, schoolsData, teachersData] = await Promise.all([
        api.admin.getOverview(),
        api.admin.listSchools(0, 10),
        api.admin.listTeachers(0, 10)
      ]);
      setOverview(overviewData);
      setSchools(schoolsData);
      setTeachers(teachersData);
    } catch (error) {
      console.error('Failed to load admin data:', error);
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
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Government Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Role</div>
                <div className="text-lg font-semibold text-blue-600">Administrator</div>
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
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('schools')}
              className={`py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'schools'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Schools
            </button>
            <button
              onClick={() => setActiveTab('teachers')}
              className={`py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'teachers'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Teachers
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && overview && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={School}
                label="Total Schools"
                value={overview.total_schools}
                color="blue"
              />
              <StatCard
                icon={Users}
                label="Total Teachers"
                value={overview.total_teachers}
                subtitle={`${overview.active_teachers} active`}
                color="green"
              />
              <StatCard
                icon={FileText}
                label="Training Modules"
                value={overview.total_modules}
                subtitle={`${overview.approved_modules} approved`}
                color="purple"
              />
              <StatCard
                icon={BookOpen}
                label="Training Manuals"
                value={overview.total_manuals}
                color="orange"
              />
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center gap-3">
                  <Activity className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Recent Activities</h2>
                </div>
              </div>
              <div className="p-6">
                {overview.recent_activities && overview.recent_activities.length > 0 ? (
                  <div className="space-y-4">
                    {overview.recent_activities.map((activity, index) => (
                      <ActivityItem key={index} activity={activity} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No recent activities</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schools' && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">All Schools</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">School Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">District</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teachers</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clusters</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modules</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {schools.map((school) => (
                    <tr key={school.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{school.school_name}</div>
                        <div className="text-sm text-gray-500">{school.school_type}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{school.district}, {school.state}</td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900">{school.active_teachers} active</div>
                        <div className="text-sm text-gray-500">{school.total_teachers} total</div>
                      </td>
                      <td className="px-6 py-4 text-gray-900">{school.total_clusters}</td>
                      <td className="px-6 py-4 text-gray-900">{school.total_modules}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'teachers' && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">All Teachers</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">School</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clusters</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modules</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {teachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{teacher.name}</div>
                        <div className="text-sm text-gray-500">{teacher.email}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{teacher.school_name || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-900">{teacher.total_clusters}</td>
                      <td className="px-6 py-4 text-gray-900">{teacher.total_modules}</td>
                      <td className="px-6 py-4">
                        {teacher.last_login ? (
                          <span className="text-sm text-gray-600">
                            {new Date(teacher.last_login).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">Never</span>
                        )}
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

const StatCard = ({ icon: Icon, label, value, subtitle, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-600 mb-1">{label}</div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
        </div>
      </div>
    </div>
  );
};

const ActivityItem = ({ activity }) => {
  const typeColors = {
    cluster_created: 'blue',
    module_generated: 'green',
    manual_uploaded: 'purple',
    module_approved: 'orange'
  };

  const color = typeColors[activity.type] || 'gray';

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
      <div className={`w-10 h-10 rounded-full bg-${color}-100 flex items-center justify-center flex-shrink-0`}>
        <Activity className={`w-5 h-5 text-${color}-600`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900">{activity.title}</p>
        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
          <span>{activity.user_name}</span>
          {activity.school_name && (
            <>
              <span>•</span>
              <span>{activity.school_name}</span>
            </>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(activity.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
