import React, { useState, useEffect } from 'react';
import { School, Users, BookOpen, FileText, CheckCircle, Clock, TrendingUp, Activity, LogOut, BarChart3, PieChart, AlertCircle, Target, ChevronRight, Home } from 'lucide-react';
import * as api from '../../services/api';
import SimpleBarChart from '../charts/SimpleBarChart';
import SimplePieChart from '../charts/SimplePieChart';
import TrendIndicator from '../charts/TrendIndicator';

const AdminDashboard = ({ user }) => {
  const [overview, setOverview] = useState(null);
  const [schools, setSchools] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Geographic drill-down state
  const [geoView, setGeoView] = useState('states'); // 'states', 'districts', 'schools', 'school-detail'
  const [selectedState, setSelectedState] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [geoData, setGeoData] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);

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

  const handleStateClick = async (state) => {
    setGeoLoading(true);
    try {
      const districts = await api.admin.getDistrictsByState(state);
      setSelectedState(state);
      setGeoData(districts);
      setGeoView('districts');
    } catch (error) {
      console.error('Failed to load districts:', error);
    } finally {
      setGeoLoading(false);
    }
  };

  const handleDistrictClick = async (district) => {
    setGeoLoading(true);
    try {
      const schools = await api.admin.getSchoolsByDistrict(selectedState, district);
      setSelectedDistrict(district);
      setGeoData(schools);
      setGeoView('schools');
    } catch (error) {
      console.error('Failed to load schools:', error);
    } finally {
      setGeoLoading(false);
    }
  };

  const handleSchoolClick = async (school) => {
    setGeoLoading(true);
    try {
      const stats = await api.admin.getSchoolStats(school.id);
      setSelectedSchool(stats);
      setGeoView('school-detail');
    } catch (error) {
      console.error('Failed to load school stats:', error);
    } finally {
      setGeoLoading(false);
    }
  };

  const resetGeoView = () => {
    setGeoView('states');
    setSelectedState(null);
    setSelectedDistrict(null);
    setSelectedSchool(null);
    setGeoData(null);
  };

  const goBackToDistricts = () => {
    setGeoView('districts');
    setSelectedDistrict(null);
    setSelectedSchool(null);
  };

  const goBackToSchools = () => {
    setGeoView('schools');
    setSelectedSchool(null);
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
                trend={12}
              />
              <StatCard
                icon={Users}
                label="Total Teachers"
                value={overview.total_teachers}
                subtitle={`${overview.active_teachers} active`}
                color="green"
                trend={8}
              />
              <StatCard
                icon={FileText}
                label="Training Modules"
                value={overview.total_modules}
                subtitle={`${overview.approved_modules} approved`}
                color="purple"
                trend={15}
              />
              <StatCard
                icon={BookOpen}
                label="Training Manuals"
                value={overview.total_manuals}
                color="orange"
                trend={5}
              />
            </div>

            {/* Geographic Distribution */}
            {overview.states_breakdown && overview.states_breakdown.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <School className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Geographic Distribution</h2>
                </div>

                {/* Breadcrumb Navigation */}
                <div className="flex items-center gap-2 mb-4 text-sm">
                  <button
                    onClick={resetGeoView}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                      geoView === 'states' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    All States
                  </button>
                  {selectedState && (
                    <>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <button
                        onClick={goBackToDistricts}
                        className={`px-3 py-1 rounded-lg transition-colors ${
                          geoView === 'districts' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {selectedState}
                      </button>
                    </>
                  )}
                  {selectedDistrict && (
                    <>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <button
                        onClick={goBackToSchools}
                        className={`px-3 py-1 rounded-lg transition-colors ${
                          geoView === 'schools' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {selectedDistrict}
                      </button>
                    </>
                  )}
                  {selectedSchool && (
                    <>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 font-medium rounded-lg">
                        {selectedSchool.school_name}
                      </span>
                    </>
                  )}
                </div>

                {geoLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <>
                    {/* States View */}
                    {geoView === 'states' && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-600 mb-3">Click on a state to view districts</h3>
                        {overview.states_breakdown.map((state, index) => (
                          <button
                            key={index}
                            onClick={() => handleStateClick(state.state)}
                            className="w-full text-left p-4 rounded-lg border hover:border-blue-500 hover:bg-blue-50 transition-all group"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900 group-hover:text-blue-700">
                                {state.state}
                              </span>
                              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                            </div>
                            <div className="flex gap-4 text-sm text-gray-600">
                              <span>{state.total_districts} districts</span>
                              <span>•</span>
                              <span>{state.total_schools} schools</span>
                              <span>•</span>
                              <span>{state.total_teachers} teachers</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Districts View */}
                    {geoView === 'districts' && geoData && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-600 mb-3">
                          Districts in {selectedState} - Click to view schools
                        </h3>
                        {geoData.map((district, index) => (
                          <button
                            key={index}
                            onClick={() => handleDistrictClick(district.district)}
                            className="w-full text-left p-4 rounded-lg border hover:border-blue-500 hover:bg-blue-50 transition-all group"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900 group-hover:text-blue-700">
                                {district.district}
                              </span>
                              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                            </div>
                            <div className="flex gap-4 text-sm text-gray-600">
                              <span>{district.total_schools} schools</span>
                              <span>•</span>
                              <span>{district.total_teachers} teachers</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Schools View */}
                    {geoView === 'schools' && geoData && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-600 mb-3">
                          Schools in {selectedDistrict}, {selectedState} - Click for details
                        </h3>
                        {geoData.map((school, index) => (
                          <button
                            key={index}
                            onClick={() => handleSchoolClick(school)}
                            className="w-full text-left p-4 rounded-lg border hover:border-blue-500 hover:bg-blue-50 transition-all group"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <span className="font-medium text-gray-900 group-hover:text-blue-700 block">
                                  {school.school_name}
                                </span>
                                {school.school_type && (
                                  <span className="text-xs text-gray-500">{school.school_type}</span>
                                )}
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                            </div>
                            <div className="flex gap-4 text-sm text-gray-600">
                              <span>{school.total_teachers} teachers</span>
                              <span>•</span>
                              <span>{school.active_teachers} active</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* School Detail View */}
                    {geoView === 'school-detail' && selectedSchool && (
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {selectedSchool.school_name}
                          </h3>
                          <div className="flex gap-3 text-sm text-gray-700">
                            <span className="px-3 py-1 bg-white rounded-full">{selectedSchool.school_type}</span>
                            <span className="px-3 py-1 bg-white rounded-full">{selectedSchool.district}</span>
                            <span className="px-3 py-1 bg-white rounded-full">{selectedSchool.state}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-3xl font-bold text-blue-600">
                              {selectedSchool.total_teachers}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">Total Teachers</div>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg">
                            <div className="text-3xl font-bold text-green-600">
                              {selectedSchool.active_teachers}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">Active Teachers</div>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2">Teacher Statistics</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Teacher Activation Rate</span>
                              <span className="font-semibold text-gray-900">
                                {selectedSchool.total_teachers > 0 
                                  ? Math.round((selectedSchool.active_teachers / selectedSchool.total_teachers) * 100)
                                  : 0}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full transition-all"
                                style={{ 
                                  width: `${selectedSchool.total_teachers > 0 
                                    ? (selectedSchool.active_teachers / selectedSchool.total_teachers) * 100 
                                    : 0}%` 
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-800">
                            <strong>Note:</strong> Training modules are tracked at the platform level by clusters, not by individual schools. 
                            Module statistics are available in the platform-wide overview.
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* School Types Distribution */}
              {overview.school_types_breakdown && overview.school_types_breakdown.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <PieChart className="w-6 h-6 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-900">School Types</h3>
                  </div>
                  <SimplePieChart
                    data={overview.school_types_breakdown.map(type => ({
                      label: type.school_type,
                      value: type.count
                    }))}
                  />
                </div>
              )}

              {/* Module Status */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <PieChart className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-bold text-gray-900">Module Status</h3>
                </div>
                <SimplePieChart
                  data={[
                    { label: 'Approved', value: overview.approved_modules },
                    { label: 'Pending', value: overview.pending_modules },
                    { label: 'In Progress', value: Math.max(0, overview.total_modules - overview.approved_modules - overview.pending_modules) }
                  ]}
                />
              </div>

              {/* Teacher Engagement */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-bold text-gray-900">Teacher Engagement</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Rate</span>
                    <TrendIndicator 
                      value={`${Math.round((overview.active_teachers / overview.total_teachers) * 100)}%`}
                      trend={5}
                    />
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-green-500 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${(overview.active_teachers / overview.total_teachers) * 100}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{overview.active_teachers}</div>
                      <div className="text-xs text-gray-600">Active</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-600">{overview.total_teachers - overview.active_teachers}</div>
                      <div className="text-xs text-gray-600">Inactive</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* State-wise Statistics Table */}
            {overview.states_breakdown && overview.states_breakdown.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-bold text-gray-900">State-wise Statistics</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Districts</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schools</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teachers</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Teachers/School</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {overview.states_breakdown.map((state, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{state.state}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-900">{state.total_districts}</td>
                          <td className="px-6 py-4 text-gray-900">{state.total_schools}</td>
                          <td className="px-6 py-4 text-gray-900">{state.total_teachers}</td>
                          <td className="px-6 py-4 text-gray-900">
                            {(state.total_teachers / state.total_schools).toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Platform Performance */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Platform Performance</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Avg Modules per School</div>
                  <TrendIndicator 
                    value={Math.round(overview.total_modules / Math.max(1, overview.total_schools))}
                    trend={10}
                  />
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Avg Modules per Teacher</div>
                  <TrendIndicator 
                    value={Math.round(overview.total_modules / Math.max(1, overview.total_teachers))}
                    trend={7}
                  />
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Approval Rate</div>
                  <TrendIndicator 
                    value={`${Math.round((overview.approved_modules / Math.max(1, overview.total_modules)) * 100)}%`}
                    trend={3}
                  />
                </div>
              </div>
            </div>

            {/* Top Performing Schools */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Top Performing Schools</h2>
              </div>
              <SimpleBarChart
                data={schools.slice(0, 5).map(school => ({
                  label: school.school_name,
                  value: school.total_modules
                }))}
                color="blue"
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

const StatCard = ({ icon: Icon, label, value, subtitle, color, trend }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
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
                <TrendingUp className="w-3 h-3" />
                +{trend}%
              </div>
            )}
          </div>
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
