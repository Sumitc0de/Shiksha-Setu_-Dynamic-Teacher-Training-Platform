/**
 * Clusters Page (Page 1)
 * Define teacher contexts - the foundation of personalization
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Languages,
  GraduationCap,
  AlertTriangle,
  Settings,
  ArrowRight,
  Mountain,
  Home,
  Waves,
  Sun,
  TreePine,
  Landmark,
  Pin,
  PinOff,
  Search,
  X,
} from 'lucide-react';
import { PageTransition, FadeIn, listContainerVariants, listItemVariants } from '../ui/PageTransition';
import { PageHeader, Modal, Alert, EmptyState, ConfirmDialog, Badge, LoadingSpinner } from '../ui/SharedComponents';
import { getClusters, createCluster, updateCluster, deleteCluster, toggleClusterPin } from '../../services/api';
import { fuzzySearch } from '../../utils/fuzzySearch';

// Configuration data
const REGION_TYPES = [
  'Urban', 'Rural', 'Tribal Belt', 'Semi-Urban',
  'Coastal', 'Hilly Region', 'Desert Region', 'Forest Area'
];

const LANGUAGES = [
  'Hindi', 'English', 'Marathi', 'Bengali', 'Tamil',
  'Telugu', 'Gujarati', 'Kannada', 'Malayalam',
  'Punjabi', 'Odia', 'Urdu', 'Gondi', 'Bhili', 'Santali'
];

const INFRASTRUCTURE_LEVELS = ['High', 'Medium', 'Low'];

const GRADE_RANGES = ['1-5', '1-8', '6-8', '6-10', '9-12', '1-12'];

const REGION_ICONS = {
  'Urban': Landmark,
  'Rural': Home,
  'Tribal Belt': Mountain,
  'Semi-Urban': Building2,
  'Coastal': Waves,
  'Hilly Region': Mountain,
  'Desert Region': Sun,
  'Forest Area': TreePine,
};

export default function ClustersPage() {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCluster, setEditingCluster] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    geographic_type: '',
    primary_language: '',
    infrastructure_level: '',
    total_teachers: 0,
    specific_challenges: '',
    additional_notes: '',
  });

  const loadClusters = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getClusters();
      setClusters(data);
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to load clusters' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClusters();
  }, [loadClusters]);

  const resetForm = () => {
    setFormData({
      name: '',
      geographic_type: '',
      primary_language: '',
      infrastructure_level: '',
      total_teachers: 0,
      specific_challenges: '',
      additional_notes: '',
    });
    setEditingCluster(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (cluster) => {
    setFormData({
      name: cluster.name,
      geographic_type: cluster.region_type || cluster.geographic_type,
      primary_language: cluster.language || cluster.primary_language,
      infrastructure_level: cluster.infrastructure_constraints || cluster.infrastructure_level,
      total_teachers: cluster.total_teachers || 0,
      specific_challenges: cluster.key_issues || cluster.specific_challenges || '',
      additional_notes: cluster.grade_range || cluster.additional_notes || '',
    });
    setEditingCluster(cluster);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setAlert(null);

    // Validate cluster name has at least 2 characters
    if (!formData.name || formData.name.trim().length < 2) {
      setAlert({ type: 'error', message: 'Cluster name must be at least 2 characters long' });
      setSaving(false);
      return;
    }

    try {
      if (editingCluster) {
        await updateCluster(editingCluster.id, formData);
        setAlert({ type: 'success', message: 'Cluster updated successfully!' });
      } else {
        await createCluster(formData);
        setAlert({ type: 'success', message: 'Cluster created successfully!' });
      }
      setShowModal(false);
      resetForm();
      loadClusters();
    } catch (error) {
      setAlert({ type: 'error', message: error.message || 'Failed to save cluster' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteCluster(deleteConfirm.id);
      setAlert({ type: 'success', message: 'Cluster deleted successfully!' });
      loadClusters();
    } catch (error) {
      setAlert({ type: 'error', message: error.message || 'Failed to delete cluster' });
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleTogglePin = async (cluster, e) => {
    e.stopPropagation();
    try {
      await toggleClusterPin(cluster.id);
      setAlert({ 
        type: 'success', 
        message: cluster.pinned ? 'Cluster unpinned' : 'Cluster pinned for quick access' 
      });
      loadClusters();
    } catch (error) {
      setAlert({ type: 'error', message: error.message || 'Failed to update pin status' });
    }
  };

  const getRegionIcon = (type) => {
    const IconComponent = REGION_ICONS[type] || MapPin;
    return IconComponent;
  };

  // Filter clusters based on search query
  const filteredClusters = fuzzySearch(
    clusters,
    searchQuery,
    ['name', 'geographic_type', 'primary_language', 'specific_challenges', 'infrastructure_level'],
    0.4 // Lower threshold for more lenient matching
  );

  return (
    <PageTransition>
      <div className="page">
        <PageHeader
          title="Cluster Profiles"
          subtitle="Define unique school clusters with specific constraints and teaching contexts"
          pageNumber="1"
          action={
            <button onClick={openCreateModal} className="btn btn-primary">
              <Plus className="w-4 h-4" />
              Create Cluster
            </button>
          }
        />

        {/* Alerts */}
        <AnimatePresence>
          {alert && (
            <Alert type={alert.type} onDismiss={() => setAlert(null)}>
              {alert.message}
            </Alert>
          )}
        </AnimatePresence>

        {/* Info box */}
        <FadeIn className="mb-8">
          <div 
            className="rounded-md p-4"
            style={{ 
              backgroundColor: 'var(--setu-50)',
              border: '1px solid var(--setu-200)',
            }}
          >
            <p className="text-sm" style={{ color: 'var(--setu-400)' }}>
              <strong>What are Clusters?</strong> Clusters represent groups of schools with similar 
              characteristics—like language, region type, and infrastructure challenges. 
              The AI uses these profiles to adapt training content appropriately.
            </p>
          </div>
        </FadeIn>
        {/* Search Bar */}
        {clusters.length > 0 && (
          <FadeIn delay={0.15} className="mb-6">
            <div className="relative max-w-md">
              <Search 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" 
                style={{ color: 'var(--ink-400)' }}
              />
              <input
                type="text"
                placeholder="Search clusters by name, region, language..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10 pr-10"
                style={{ backgroundColor: 'var(--paper-100)' }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-ink-100 rounded-full transition-colors"
                  title="Clear search"
                >
                  <X className="w-4 h-4" style={{ color: 'var(--ink-400)' }} />
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="text-sm mt-2" style={{ color: 'var(--ink-500)' }}>
                Found {filteredClusters.length} {filteredClusters.length === 1 ? 'cluster' : 'clusters'}
              </p>
            )}
          </FadeIn>
        )}
        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="skeleton w-12 h-12 rounded-full mb-4" />
                <div className="skeleton-heading mb-3" />
                <div className="skeleton-text w-3/4 mb-2" />
                <div className="skeleton-text w-1/2" />
              </div>
            ))}
          </div>
        ) : clusters.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No Clusters Yet"
            description="Create your first cluster profile to start generating personalized training modules for specific teacher groups."
            action={
              <button onClick={openCreateModal} className="btn btn-primary">
                <Plus className="w-4 h-4" />
                Create First Cluster
              </button>
            }
          />
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={listContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredClusters.map((cluster) => {
              const RegionIcon = getRegionIcon(cluster.region_type || cluster.geographic_type);
              return (
                <motion.div
                  key={cluster.id}
                  variants={listItemVariants}
                  className="card card-paper group"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'var(--setu-100)', color: 'var(--setu-600)' }}
                      >
                        <RegionIcon className="w-6 h-6" />
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleTogglePin(cluster, e)}
                          className={`btn btn-ghost btn-icon p-2 ${cluster.pinned ? 'opacity-100' : ''}`}
                          style={{ color: cluster.pinned ? 'var(--setu-600)' : 'inherit' }}
                          title={cluster.pinned ? 'Unpin cluster' : 'Pin cluster'}
                        >
                          {cluster.pinned ? <Pin className="w-4 h-4 fill-current" /> : <PinOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => openEditModal(cluster)}
                          className="btn btn-ghost btn-icon p-2"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(cluster)}
                          className="btn btn-ghost btn-icon p-2"
                          style={{ color: 'var(--danger-500)' }}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      {cluster.name}
                      {cluster.pinned && (
                        <Pin className="w-4 h-4 fill-current" style={{ color: 'var(--setu-600)' }} />
                      )}
                    </h3>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="primary">
                        <MapPin className="w-3 h-3" />
                        {cluster.region_type || cluster.geographic_type}
                      </Badge>
                      <Badge variant="default">
                        <Languages className="w-3 h-3" />
                        {cluster.language || cluster.primary_language}
                      </Badge>
                      {cluster.infrastructure_constraints && (
                        <Badge variant="default">
                          <Settings className="w-3 h-3" />
                          {cluster.infrastructure_constraints}
                        </Badge>
                      )}
                      {cluster.grade_range && (
                        <Badge variant="default">
                          <GraduationCap className="w-3 h-3" />
                          Grade {cluster.grade_range}
                        </Badge>
                      )}
                    </div>

                    {/* Details */}
                    {cluster.key_issues && (
                      <div className="mb-3">
                        <div className="flex items-center gap-1 text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                          <AlertTriangle className="w-3 h-3" />
                          Key Issues
                        </div>
                        <p className="text-sm line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                          {cluster.key_issues}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div 
                    className="px-6 py-3"
                    style={{ 
                      borderTop: '1px solid var(--border)',
                      backgroundColor: 'var(--card-footer)',
                    }}
                  >
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Created {new Date(cluster.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Next page CTA */}
        {clusters.length > 0 && (
          <FadeIn delay={0.3} className="mt-8 text-center">
            <button
              onClick={() => navigate('/manuals')}
              className="btn btn-outline group"
            >
              Continue to Manuals
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-xs mt-2" style={{ color: 'var(--ink-400)' }}>Turn to Page 2</p>
          </FadeIn>
        )}

        {/* Create/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
          title={editingCluster ? 'Edit Cluster' : 'Create New Cluster'}
          icon={editingCluster ? Edit : Plus}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="modal-body space-y-5">
              {/* Name */}
              <div className="form-group">
                <label className="form-label">
                  Cluster Name <span className="form-required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Tribal Belt Schools - Gadchiroli"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  minLength={2}
                  required
                />
                <p className="form-hint">A descriptive name for this group of schools (minimum 2 characters)</p>
              </div>

              {/* Region and Language */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">
                    Geographic Type <span className="form-required">*</span>
                  </label>
                  <select
                    className="form-input form-select"
                    value={formData.geographic_type}
                    onChange={(e) => setFormData({ ...formData, geographic_type: e.target.value })}
                    required
                  >
                    <option value="">Select region...</option>
                    {REGION_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Primary Language <span className="form-required">*</span>
                  </label>
                  <select
                    className="form-input form-select"
                    value={formData.primary_language}
                    onChange={(e) => setFormData({ ...formData, primary_language: e.target.value })}
                    required
                  >
                    <option value="">Select language...</option>
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Infrastructure Level and Total Teachers */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">
                    Infrastructure Level <span className="form-required">*</span>
                  </label>
                  <select
                    className="form-input form-select"
                    value={formData.infrastructure_level}
                    onChange={(e) => setFormData({ ...formData, infrastructure_level: e.target.value })}
                    required
                  >
                    <option value="">Select level...</option>
                    {INFRASTRUCTURE_LEVELS.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Total Teachers <span className="form-required">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g., 50"
                    value={formData.total_teachers}
                    onChange={(e) => setFormData({ ...formData, total_teachers: parseInt(e.target.value) || 0 })}
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Specific Challenges */}
              <div className="form-group">
                <label className="form-label">Specific Challenges</label>
                <textarea
                  className="form-input form-textarea"
                  rows={3}
                  placeholder="e.g., Limited internet, no projectors, irregular electricity..."
                  value={formData.specific_challenges}
                  onChange={(e) => setFormData({ ...formData, specific_challenges: e.target.value })}
                />
                <p className="form-hint">Describe any specific challenges or limitations</p>
              </div>

              {/* Additional Notes */}
              <div className="form-group">
                <label className="form-label">Additional Notes</label>
                <textarea
                  className="form-input form-textarea"
                  rows={3}
                  placeholder="e.g., High dropout rates, language barriers, seasonal migration..."
                  value={formData.additional_notes}
                  onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
                />
                <p className="form-hint">Any other relevant information about this cluster</p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Saving...
                  </>
                ) : editingCluster ? (
                  'Update Cluster'
                ) : (
                  'Create Cluster'
                )}
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={handleDelete}
          title="Delete Cluster"
          message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone, and any modules generated for this cluster will lose their context.`}
          confirmText="Delete"
          variant="danger"
        />
      </div>
    </PageTransition>
  );
}
