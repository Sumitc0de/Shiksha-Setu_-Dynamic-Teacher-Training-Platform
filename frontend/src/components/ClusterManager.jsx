import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Plus, Building2, Edit, Trash2, X, MapPin, AlertTriangle, 
  CheckCircle, Settings, AlertCircle, Landmark, Mountain, 
  TreePine, Waves, Sun, Trees, Home, Building
} from 'lucide-react';

const ClusterManager = () => {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCluster, setEditingCluster] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    geographic_type: '',
    primary_language: '',
    infrastructure_level: '',
    total_teachers: 0,
    specific_challenges: '',
    additional_notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const regionTypes = [
    'Urban', 'Rural', 'Tribal Belt', 'Semi-Urban', 
    'Coastal', 'Hilly Region', 'Desert Region', 'Forest Area'
  ];

  const languages = [
    'Hindi', 'English', 'Marathi', 'Bengali', 'Tamil', 
    'Telugu', 'Gujarati', 'Kannada', 'Malayalam', 
    'Punjabi', 'Odia', 'Urdu', 'Gondi', 'Bhili', 'Santali'
  ];

  const gradeRanges = ['1-5', '1-8', '6-8', '6-10', '9-12', '1-12'];

  useEffect(() => {
    loadClusters();
  }, []);

  const loadClusters = async () => {
    try {
      setLoading(true);
      const data = await api.getClusters();
      setClusters(data);
    } catch (err) {
      setError('Failed to load clusters');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      geographic_type: '',
      primary_language: '',
      infrastructure_level: '',
      total_teachers: 0,
      specific_challenges: '',
      additional_notes: ''
    });
    setEditingCluster(null);
    setError('');
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (cluster) => {
    setFormData({
      name: cluster.name,
      geographic_type: cluster.geographic_type,
      primary_language: cluster.primary_language,
      infrastructure_level: cluster.infrastructure_level,
      total_teachers: cluster.total_teachers,
      specific_challenges: cluster.specific_challenges || '',
      additional_notes: cluster.additional_notes || ''
    });
    setEditingCluster(cluster);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingCluster) {
        await api.updateCluster(editingCluster.id, formData);
        setSuccess('Cluster updated successfully!');
      } else {
        await api.createCluster(formData);
        setSuccess('Cluster created successfully!');
      }
      setShowModal(false);
      loadClusters();
      resetForm();
    } catch (err) {
      setError(err.message || 'Failed to save cluster');
    }
  };

  const handleDelete = async (cluster) => {
    if (!window.confirm(`Are you sure you want to delete "${cluster.name}"?`)) {
      return;
    }

    try {
      await api.deleteCluster(cluster.id);
      setSuccess('Cluster deleted successfully!');
      loadClusters();
    } catch (err) {
      setError(err.message || 'Failed to delete cluster');
    }
  };

  const getRegionIcon = (type) => {
    const iconMap = {
      'Urban': Building,
      'Rural': Home,
      'Tribal Belt': Mountain,
      'Semi-Urban': Landmark,
      'Coastal': Waves,
      'Hilly Region': Mountain,
      'Desert Region': Sun,
      'Forest Area': TreePine
    };
    const IconComponent = iconMap[type] || MapPin;
    return <IconComponent size={24} />;
  };

  return (
    <div className="cluster-manager">
      <div className="page-header">
        <div>
          <h1 className="page-title">Cluster Profiles</h1>
          <p className="page-subtitle">
            Define unique school clusters with specific constraints and requirements
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={20} /> Create Cluster
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="alert-icon"><AlertCircle size={20} /></span>
          <div className="alert-content">{error}</div>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span className="alert-icon"><CheckCircle size={20} /></span>
          <div className="alert-content">{success}</div>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading clusters...</p>
        </div>
      ) : clusters.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon"><Building2 size={40} /></div>
          <h3 className="empty-state-title">No Clusters Yet</h3>
          <p className="empty-state-text">
            Create your first cluster profile to start generating personalized training modules.
          </p>
          <button className="btn btn-primary" onClick={openCreateModal}>
            Create First Cluster
          </button>
        </div>
      ) : (
        <div className="clusters-grid">
          {clusters.map((cluster) => (
            <div key={cluster.id} className="cluster-card">
              <div className="cluster-header">
                <div className="cluster-icon">
                  {getRegionIcon(cluster.geographic_type)}
                </div>
                <div className="cluster-actions">
                  <button 
                    className="btn-icon-sm edit" 
                    onClick={() => openEditModal(cluster)}
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className="btn-icon-sm delete" 
                    onClick={() => handleDelete(cluster)}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <h3 className="cluster-name">{cluster.name}</h3>
              
              <div className="cluster-badges">
                <span className="cluster-badge region">{cluster.geographic_type}</span>
                <span className="cluster-badge language">{cluster.primary_language}</span>
                <span className="cluster-badge grade">{cluster.total_teachers} teachers</span>
                <span className="cluster-badge infrastructure">{cluster.infrastructure_level}</span>
              </div>

              {cluster.specific_challenges && (
                <div className="cluster-section">
                  <span className="section-label"><AlertTriangle size={14} /> Challenges</span>
                  <p>{cluster.specific_challenges}</p>
                </div>
              )}

              {cluster.additional_notes && (
                <div className="cluster-section">
                  <span className="section-label"><Settings size={14} /> Notes</span>
                  <p>{cluster.additional_notes}</p>
                </div>
              )}

              <div className="cluster-footer">
                <span className="cluster-date">
                  Created {new Date(cluster.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingCluster ? <><Edit size={20} /> Edit Cluster</> : <><Plus size={20} /> Create New Cluster</>}
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">
                    Cluster Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Tribal Belt Schools - Gadchiroli"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Geographic Type <span className="required">*</span>
                    </label>
                    <select
                      className="form-control"
                      value={formData.geographic_type}
                      onChange={(e) => setFormData({...formData, geographic_type: e.target.value})}
                      required
                    >
                      <option value="">Select region...</option>
                      {regionTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Primary Language <span className="required">*</span>
                    </label>
                    <select
                      className="form-control"
                      value={formData.primary_language}
                      onChange={(e) => setFormData({...formData, primary_language: e.target.value})}
                      required
                    >
                      <option value="">Select language...</option>
                      {languages.map((lang) => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Infrastructure Level <span className="required">*</span>
                    </label>
                    <select
                      className="form-control"
                      value={formData.infrastructure_level}
                      onChange={(e) => setFormData({...formData, infrastructure_level: e.target.value})}
                      required
                    >
                      <option value="">Select level...</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Total Teachers <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g., 50"
                      value={formData.total_teachers}
                      onChange={(e) => setFormData({...formData, total_teachers: parseInt(e.target.value) || 0})}
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Specific Challenges</label>
                  <textarea
                    className="form-control"
                    placeholder="e.g., No science lab, Limited electricity, Single classroom"
                    value={formData.specific_challenges}
                    onChange={(e) => setFormData({...formData, specific_challenges: e.target.value})}
                    rows={3}
                  />
                  <p className="form-hint">Describe specific challenges of schools in this cluster</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Additional Notes</label>
                  <textarea
                    className="form-control"
                    placeholder="e.g., High absenteeism, Language barriers, Multi-grade teaching"
                    value={formData.additional_notes}
                    onChange={(e) => setFormData({...formData, additional_notes: e.target.value})}
                    rows={3}
                  />
                  <p className="form-hint">Any other relevant information about this cluster</p>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCluster ? 'Update Cluster' : 'Create Cluster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .cluster-manager {
          animation: fadeIn 0.3s ease;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
        }

        .page-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .page-subtitle {
          color: var(--text-muted);
          font-size: 1rem;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 32px;
        }

        .clusters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 24px;
        }

        .cluster-card {
          background: var(--bg-elevated);
          border-radius: var(--radius-md);
          padding: 20px;
          border: 1px solid var(--glass-border);
          transition: all var(--transition-fast);
        }

        .cluster-card:hover {
          background: var(--bg-surface);
          border-color: var(--glass-border-light);
        }

        .cluster-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .cluster-icon {
          font-size: 1.5rem;
          width: 48px;
          height: 48px;
          background: var(--bg-surface);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-violet);
        }

        .cluster-actions {
          display: flex;
          gap: 8px;
        }

        .btn-icon-sm {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: var(--radius-sm);
          background: var(--bg-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
          font-size: 0.9rem;
        }

        .btn-icon-sm.edit:hover {
          background: rgba(49, 130, 206, 0.15);
        }

        .btn-icon-sm.delete:hover {
          background: rgba(229, 62, 62, 0.15);
        }

        .cluster-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 10px;
        }

        .cluster-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
        }

        .cluster-badge {
          padding: 4px 12px;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
        }

        .cluster-badge.region {
          background: rgba(255, 107, 53, 0.15);
          color: var(--primary-color);
        }

        .cluster-badge.language {
          background: rgba(49, 130, 206, 0.15);
          color: var(--accent-blue);
        }

        .cluster-badge.grade {
          background: rgba(56, 161, 105, 0.15);
          color: var(--accent-green);
        }

        .cluster-section {
          margin-bottom: 12px;
          padding: 12px;
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
        }

        .section-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .cluster-section p {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .cluster-footer {
          padding-top: 12px;
          border-top: 1px solid var(--border-light);
          margin-top: 16px;
        }

        .cluster-date {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 600px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ClusterManager;
