/**
 * Shiksha-Setu API Service Layer
 * Centralized API communication with Axios and error handling
 * 
 * API CONTRACTS (DO NOT MODIFY):
 * - /api/clusters/          - GET, POST
 * - /api/clusters/{id}      - GET, PUT, DELETE
 * - /api/manuals/           - GET
 * - /api/manuals/upload     - POST (multipart/form-data)
 * - /api/manuals/{id}       - GET, DELETE
 * - /api/manuals/{id}/index - POST
 * - /api/modules/           - GET (with query params: cluster_id, manual_id)
 * - /api/modules/generate   - POST
 * - /api/modules/{id}       - GET, DELETE
 * - /api/modules/{id}/approve - PATCH
 * - /api/modules/{id}/feedback - POST
 * - /api/translation/translate - POST
 * - /api/translation/translate/batch - POST
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds for AI generation
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    const message = error.response?.data?.detail || 
                    error.message || 
                    'An unexpected error occurred';
    console.error(`API Error:`, message);
    return Promise.reject(new Error(message));
  }
);

// ================== HEALTH ==================
export const checkHealth = () => apiClient.get('/health');

// ================== AUTHENTICATION ==================
export const auth = {
  login: (credentials) => apiClient.post('/api/auth/login', credentials),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return apiClient.post('/api/auth/logout');
  },
  getCurrentUser: () => apiClient.get('/api/auth/me'),
  getDashboardStats: () => apiClient.get('/api/auth/dashboard/stats'),
};

// ================== ADMIN (Government Officials) ==================
export const admin = {
  getOverview: () => apiClient.get('/api/admin/overview'),
  listSchools: (skip = 0, limit = 50) => apiClient.get(`/api/admin/schools?skip=${skip}&limit=${limit}`),
  listTeachers: (skip = 0, limit = 50, schoolId = null) => {
    const url = schoolId 
      ? `/api/admin/teachers?skip=${skip}&limit=${limit}&school_id=${schoolId}`
      : `/api/admin/teachers?skip=${skip}&limit=${limit}`;
    return apiClient.get(url);
  },
  getSchoolDetails: (schoolId) => apiClient.get(`/api/admin/schools/${schoolId}`),
};

// ================== SCHOOLS (Principals/Administrators) ==================
export const schools = {
  getDashboard: () => apiClient.get('/api/schools/dashboard'),
  listTeachers: (skip = 0, limit = 50) => apiClient.get(`/api/schools/teachers?skip=${skip}&limit=${limit}`),
  getTeacherDetails: (teacherId) => apiClient.get(`/api/schools/teachers/${teacherId}`),
  listClusters: (skip = 0, limit = 50, teacherId = null) => {
    const url = teacherId
      ? `/api/schools/clusters?skip=${skip}&limit=${limit}&teacher_id=${teacherId}`
      : `/api/schools/clusters?skip=${skip}&limit=${limit}`;
    return apiClient.get(url);
  },
  listModules: (skip = 0, limit = 50, teacherId = null, approved = null) => {
    let url = `/api/schools/modules?skip=${skip}&limit=${limit}`;
    if (teacherId) url += `&teacher_id=${teacherId}`;
    if (approved !== null) url += `&approved=${approved}`;
    return apiClient.get(url);
  },
};

// ================== CLUSTERS ==================
export const getClusters = () => apiClient.get('/api/clusters/');

export const getCluster = (id) => apiClient.get(`/api/clusters/${id}`);

export const createCluster = (clusterData) => {
  const payload = {
    name: clusterData.name,
    region_type: clusterData.geographic_type || clusterData.region_type,
    language: clusterData.primary_language || clusterData.language,
    infrastructure_constraints: clusterData.infrastructure_level || clusterData.infrastructure_constraints || null,
    key_issues: clusterData.specific_challenges || clusterData.key_issues || null,
    grade_range: clusterData.additional_notes || clusterData.grade_range || null,
  };
  return apiClient.post('/api/clusters/', payload);
};

export const updateCluster = (id, clusterData) => {
  const payload = {
    name: clusterData.name,
    region_type: clusterData.geographic_type || clusterData.region_type,
    language: clusterData.primary_language || clusterData.language,
    infrastructure_constraints: clusterData.infrastructure_level || clusterData.infrastructure_constraints || null,
    key_issues: clusterData.specific_challenges || clusterData.key_issues || null,
    grade_range: clusterData.additional_notes || clusterData.grade_range || null,
  };
  return apiClient.put(`/api/clusters/${id}`, payload);
};

export const deleteCluster = (id) => apiClient.delete(`/api/clusters/${id}`);

// ================== MANUALS ==================
export const getManuals = () => apiClient.get('/api/manuals/');

export const getManual = (id) => apiClient.get(`/api/manuals/${id}`);

export const uploadManual = async (title, file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(
    `${API_BASE_URL}/api/manuals/upload?title=${encodeURIComponent(title)}`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000, // 2 minutes for large files
    }
  );
  return response.data;
};

export const indexManual = (id) => apiClient.post(`/api/manuals/${id}/index`);

export const deleteManual = (id) => apiClient.delete(`/api/manuals/${id}`);

// ================== MODULES ==================
export const getModules = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.cluster_id) params.append('cluster_id', filters.cluster_id);
  if (filters.manual_id) params.append('manual_id', filters.manual_id);
  
  const queryString = params.toString();
  return apiClient.get(`/api/modules/${queryString ? `?${queryString}` : ''}`);
};

export const getModule = (id) => apiClient.get(`/api/modules/${id}`);

export const getSupportedLanguages = () => apiClient.get('/api/modules/languages');

export const generateModule = (data) => {
  const payload = {
    manual_id: parseInt(data.manual_id),
    cluster_id: parseInt(data.cluster_id),
    topic: data.topic,
    target_language: data.target_language || null,
  };
  return apiClient.post('/api/modules/generate', payload);
};

export const approveModule = (id) => apiClient.patch(`/api/modules/${id}/approve`);

export const deleteModule = (id) => apiClient.delete(`/api/modules/${id}`);

export const submitFeedback = (moduleId, rating, comment = null) => {
  return apiClient.post(`/api/modules/${moduleId}/feedback`, { rating, comment });
};

// ================== TRANSLATION ==================
export const translate = (text, targetLanguage, sourceLanguage = 'english') => {
  return apiClient.post('/api/translation/translate', {
    text,
    target_language: targetLanguage,
    source_language: sourceLanguage,
  });
};

export const batchTranslate = (texts, targetLanguage, sourceLanguage = 'english') => {
  return apiClient.post('/api/translation/translate/batch', {
    texts,
    target_language: targetLanguage,
    source_language: sourceLanguage,
  });
};

// ================== DASHBOARD STATS ==================
export const getDashboardStats = async () => {
  const [clusters, manuals, modules] = await Promise.all([
    getClusters(),
    getManuals(),
    getModules(),
  ]);
  
  return {
    totalClusters: clusters.length,
    totalManuals: manuals.length,
    indexedManuals: manuals.filter(m => m.indexed).length,
    totalModules: modules.length,
    approvedModules: modules.filter(m => m.approved).length,
  };
};

// Default export for backward compatibility
const api = {
  checkHealth,
  auth,
  admin,
  schools,
  getClusters,
  getCluster,
  createCluster,
  updateCluster,
  deleteCluster,
  getManuals,
  getManual,
  uploadManual,
  indexManual,
  deleteManual,
  getModules,
  getModule,
  generateModule,
  approveModule,
  deleteModule,
  submitFeedback,
  translate,
  batchTranslate,
  getDashboardStats,
};

export default api;
