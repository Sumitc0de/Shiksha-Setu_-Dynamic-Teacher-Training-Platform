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

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.detail || 
                    error.message || 
                    'An unexpected error occurred';
    console.error(`API Error:`, message);
    return Promise.reject(new Error(message));
  }
);

// ================== HEALTH ==================
export const checkHealth = () => apiClient.get('/health');

// ================== CLUSTERS ==================
export const getClusters = () => apiClient.get('/api/clusters/');

export const getCluster = (id) => apiClient.get(`/api/clusters/${id}`);

export const createCluster = (clusterData) => {
  const payload = {
    name: clusterData.name,
    geographic_type: clusterData.geographic_type,
    primary_language: clusterData.primary_language,
    infrastructure_level: clusterData.infrastructure_level,
    total_teachers: clusterData.total_teachers,
    specific_challenges: clusterData.specific_challenges || null,
    additional_notes: clusterData.additional_notes || null,
  };
  return apiClient.post('/api/clusters/', payload);
};

export const updateCluster = (id, clusterData) => {
  const payload = {
    name: clusterData.name,
    geographic_type: clusterData.geographic_type,
    primary_language: clusterData.primary_language,
    infrastructure_level: clusterData.infrastructure_level,
    total_teachers: clusterData.total_teachers,
    specific_challenges: clusterData.specific_challenges || null,
    additional_notes: clusterData.additional_notes || null,
  };
  return apiClient.put(`/api/clusters/${id}`, payload);
};

export const deleteCluster = (id) => apiClient.delete(`/api/clusters/${id}`);

export const toggleClusterPin = (id) => apiClient.patch(`/api/clusters/${id}/pin`);

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

export const toggleManualPin = (id) => apiClient.patch(`/api/manuals/${id}/pin`);

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
  getClusters,
  getCluster,
  createCluster,
  updateCluster,
  deleteCluster,
  toggleClusterPin,
  getManuals,
  getManual,
  uploadManual,
  indexManual,
  deleteManual,
  toggleManualPin,
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
