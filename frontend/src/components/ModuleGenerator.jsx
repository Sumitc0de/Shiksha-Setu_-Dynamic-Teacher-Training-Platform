import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { GuideTooltip } from './GuideTooltip';
import { 
  Zap, Bot, AlertCircle, CheckCircle, BookOpen, Building2, 
  Sparkles, ArrowLeft, Download, Share2, FileText, Brain,
  Clock, Calendar, ArrowRight, BookMarked
} from 'lucide-react';

const ModuleGenerator = () => {
  const [clusters, setClusters] = useState([]);
  const [manuals, setManuals] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  
  const [formData, setFormData] = useState({
    manual_id: '',
    cluster_id: '',
    topic: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [clustersData, manualsData, modulesData] = await Promise.all([
        api.getClusters(),
        api.getManuals(),
        api.getModules()
      ]);
      setClusters(clustersData);
      setManuals(manualsData.filter(m => m.indexed));
      setModules(modulesData);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.manual_id || !formData.cluster_id || !formData.topic) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setGenerating(true);
      const result = await api.generateModule(formData);
      setSuccess('Module generated successfully!');
      setSelectedModule(result);
      loadData();
      setFormData({ ...formData, topic: '' });
    } catch (err) {
      setError(err.message || 'Generation failed. Make sure you have a valid GROQ API key.');
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async (module) => {
    try {
      await api.approveModule(module.id);
      setSuccess(`Module "${module.title}" approved!`);
      loadData();
    } catch (err) {
      setError(err.message || 'Approval failed');
    }
  };

  const getClusterName = (id) => {
    const cluster = clusters.find(c => c.id === id);
    return cluster ? cluster.name : 'Unknown';
  };

  const getManualTitle = (id) => {
    const allManuals = manuals;
    const manual = allManuals.find(m => m.id === id);
    return manual ? manual.title : 'Unknown';
  };

  return (
    <div className="module-generator">
      <div className="page-header">
        <div>
          <h1 className="page-title">Module Generator</h1>
          <p className="page-subtitle">
            Generate AI-adapted training modules for specific cluster needs
          </p>
        </div>
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

      <div className="generator-layout">
        {/* Generation Form */}
        <div className="generator-form-section">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <span className="icon"><Zap size={20} /></span>
                Generate New Module
              </h3>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="loading-container-sm">
                  <div className="loading-spinner"></div>
                </div>
              ) : (
                <form onSubmit={handleGenerate}>
                  <div className="form-group">
                    <label className="form-label">
                      Select Manual <span className="required">*</span>
                    </label>
                    <select
                      className="form-control"
                      value={formData.manual_id}
                      onChange={(e) => setFormData({...formData, manual_id: e.target.value})}
                      required
                    >
                      <option value="">Choose a manual...</option>
                      {manuals.map((manual) => (
                        <option key={manual.id} value={manual.id}>
                          {manual.title} ({manual.total_pages} pages)
                        </option>
                      ))}
                    </select>
                    {manuals.length === 0 && (
                      <p className="form-hint text-danger">
                        <AlertCircle size={14} /> No indexed manuals available. Please upload and index a manual first.
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Select Cluster <span className="required">*</span>
                    </label>
                    <select
                      className="form-control"
                      value={formData.cluster_id}
                      onChange={(e) => setFormData({...formData, cluster_id: e.target.value})}
                      required
                    >
                      <option value="">Choose a cluster...</option>
                      {clusters.map((cluster) => (
                        <option key={cluster.id} value={cluster.id}>
                          {cluster.name} ({cluster.geographic_type} - {cluster.primary_language})
                        </option>
                      ))}
                    </select>
                    {clusters.length === 0 && (
                      <p className="form-hint text-danger">
                        <AlertCircle size={14} /> No clusters available. Please create a cluster profile first.
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Topic / Chapter <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., Photosynthesis, Fractions, Classroom Management"
                      value={formData.topic}
                      onChange={(e) => setFormData({...formData, topic: e.target.value})}
                      required
                    />
                    <p className="form-hint">
                      Enter the topic you want to adapt from the selected manual
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={generating || !formData.manual_id || !formData.cluster_id}
                  >
                    {generating ? (
                      <>
                        <span className="loading-spinner-sm"></span>
                        Generating with AI...
                      </>
                    ) : (
                      <><Bot size={20} /> Generate Adapted Module</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* How it works */}
          <div className="info-card">
            <h4><Brain size={20} /> How AI Adaptation Works</h4>
            <div className="info-steps">
              <div className="info-step">
                <span className="step-num">1</span>
                <span>RAG retrieves relevant content from the manual</span>
              </div>
              <div className="info-step">
                <span className="step-num">2</span>
                <span>Llama 3.3-70B analyzes cluster constraints</span>
              </div>
              <div className="info-step">
                <span className="step-num">3</span>
                <span>Content is rewritten for local context</span>
              </div>
              <div className="info-step">
                <span className="step-num">4</span>
                <span>Review and approve before sharing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Generated Modules / Preview */}
        <div className="modules-section">
          {selectedModule ? (
            <div className="module-preview">
              <div className="preview-header">
                <h3><FileText size={20} /> Generated Module</h3>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => setSelectedModule(null)}
                >
                  <ArrowLeft size={16} /> Back to List
                </button>
              </div>
              
              <div className="split-view-compact">
                <div className="split-panel">
                  <div className="split-panel-header">
                    <BookOpen size={18} /> Original Content
                  </div>
                  <div className="split-panel-content">
                    <pre className="content-text">{selectedModule.original_content}</pre>
                  </div>
                </div>
                
                <div className="split-panel adapted">
                  <div className="split-panel-header">
                    <Sparkles size={18} /> Adapted for {getClusterName(selectedModule.cluster_id)}
                  </div>
                  <div className="split-panel-content">
                    <pre className="content-text">{selectedModule.adapted_content}</pre>
                  </div>
                </div>
              </div>

              <div className="preview-actions">
                {!selectedModule.approved && (
                  <button 
                    className="btn btn-success"
                    onClick={() => handleApprove(selectedModule)}
                  >
                    <CheckCircle size={18} /> Approve Module
                  </button>
                )}
                <button className="btn btn-outline">
                  <Download size={18} /> Export PDF
                </button>
                <button className="btn btn-outline">
                  <Share2 size={18} /> Share via WhatsApp
                </button>
              </div>
            </div>
          ) : (
            <div className="modules-list">
              <div className="list-header">
                <h3><BookMarked size={20} /> Generated Modules ({modules.length})</h3>
              </div>
              
              {modules.length === 0 ? (
                <div className="empty-list">
                  <div className="empty-icon"><FileText size={40} /></div>
                  <p>No modules generated yet.</p>
                  <p className="text-muted">Use the form to generate your first adapted module!</p>
                </div>
              ) : (
                <div className="module-cards">
                  {modules.map((module) => (
                    <div 
                      key={module.id} 
                      className="module-card"
                      onClick={() => setSelectedModule(module)}
                    >
                      <div className="module-card-header">
                        <h4>{module.title}</h4>
                        <span className={`badge ${module.approved ? 'badge-success' : 'badge-warning'}`}>
                          {module.approved ? <><CheckCircle size={12} /> Approved</> : <><Clock size={12} /> Pending</>}
                        </span>
                      </div>
                      <div className="module-card-meta">
                        <span><Building2 size={14} /> {getClusterName(module.cluster_id)}</span>
                        <span><Calendar size={14} /> {new Date(module.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="module-card-preview">
                        {module.adapted_content?.substring(0, 150)}...
                      </p>
                      <div className="module-card-footer">
                        <button className="btn btn-sm btn-outline">View Details <ArrowRight size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .module-generator {
          animation: fadeIn 0.3s ease;
        }

        .page-header {
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

        .generator-layout {
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: 32px;
          align-items: start;
        }

        @media (max-width: 1200px) {
          .generator-layout {
            grid-template-columns: 1fr;
          }
        }

        .loading-container-sm {
          padding: 40px;
          display: flex;
          justify-content: center;
        }

        .loading-spinner-sm {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          display: inline-block;
          margin-right: 8px;
        }

        .w-full {
          width: 100%;
        }

        .text-danger {
          color: var(--accent-red);
        }

        .info-card {
          background: var(--bg-elevated);
          border-radius: var(--radius-md);
          padding: 20px;
          margin-top: 20px;
          border: 1px solid var(--glass-border);
        }

        .info-card h4 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 16px;
          color: var(--text-primary);
        }

        .info-steps {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .info-step {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .step-num {
          width: 22px;
          height: 22px;
          background: var(--primary-violet);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 600;
          flex-shrink: 0;
        }

        .modules-list {
          background: var(--bg-elevated);
          border-radius: var(--radius-md);
          border: 1px solid var(--glass-border);
          overflow: hidden;
        }

        .list-header {
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-light);
          background: var(--bg-secondary);
        }

        .list-header h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .empty-list {
          padding: 60px 40px;
          text-align: center;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 16px;
          opacity: 0.3;
        }

        .module-cards {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 600px;
          overflow-y: auto;
        }

        .module-card {
          background: var(--bg-surface);
          border-radius: var(--radius-sm);
          padding: 14px;
          cursor: pointer;
          transition: all var(--transition-fast);
          border: 1px solid transparent;
        }

        .module-card:hover {
          background: var(--bg-hover);
          border-color: var(--glass-border-light);
        }

        .module-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .module-card-header h4 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .module-card-meta {
          display: flex;
          gap: 16px;
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 8px;
        }

        .module-card-preview {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 12px;
        }

        .module-card-footer {
          display: flex;
          justify-content: flex-end;
        }

        .module-preview {
          background: var(--bg-elevated);
          border-radius: var(--radius-md);
          border: 1px solid var(--glass-border);
          overflow: hidden;
        }

        .preview-header {
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-light);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--bg-secondary);
        }

        .preview-header h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .split-view-compact {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 400px;
        }

        @media (max-width: 900px) {
          .split-view-compact {
            grid-template-columns: 1fr;
          }
        }

        .split-panel {
          border-right: 1px solid var(--border-light);
        }

        .split-panel:last-child {
          border-right: none;
        }

        .split-panel.adapted {
          background: linear-gradient(180deg, rgba(255, 107, 53, 0.03) 0%, transparent 100%);
        }

        .split-panel-header {
          padding: 12px 20px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-light);
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .split-panel.adapted .split-panel-header {
          background: rgba(255, 107, 53, 0.1);
          color: var(--primary-color);
        }

        .split-panel-content {
          padding: 20px;
          max-height: 350px;
          overflow-y: auto;
        }

        .content-text {
          font-family: inherit;
          font-size: 0.9rem;
          line-height: 1.7;
          color: var(--text-secondary);
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .preview-actions {
          padding: 20px 24px;
          border-top: 1px solid var(--border-light);
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
      `}</style>
    </div>
  );
};

export default ModuleGenerator;
