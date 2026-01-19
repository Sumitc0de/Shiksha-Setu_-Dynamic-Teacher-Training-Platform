/**
 * Module Library Page (Page 4)
 * The Reading Room - View, manage, and provide feedback on generated modules
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Library,
  BookOpen,
  Sparkles,
  CheckCircle,
  Clock,
  Filter,
  Trash2,
  ArrowLeft,
  Star,
  MessageSquare,
  Building2,
  FileText,
  Calendar,
  ThumbsUp,
  Download,
  Share2,
} from 'lucide-react';
import { PageTransition, FadeIn, listContainerVariants, listItemVariants } from '../ui/PageTransition';
import { PageHeader, Modal, Alert, EmptyState, ConfirmDialog, Badge, LoadingSpinner } from '../ui/SharedComponents';
import {
  getModules,
  getClusters,
  getManuals,
  approveModule,
  deleteModule,
  submitFeedback,
  exportModulePDF,
  downloadPDF,
} from '../../services/api';

export default function LibraryPage() {
  const [modules, setModules] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [manuals, setManuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [alert, setAlert] = useState(null);
  const [exportingModuleId, setExportingModuleId] = useState(null);

  // Filters
  const [filterCluster, setFilterCluster] = useState('');
  const [filterManual, setFilterManual] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [modulesData, clustersData, manualsData] = await Promise.all([
        getModules({ cluster_id: filterCluster || undefined, manual_id: filterManual || undefined }),
        getClusters(),
        getManuals(),
      ]);
      setModules(modulesData);
      setClusters(clustersData);
      setManuals(manualsData);
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to load modules' });
    } finally {
      setLoading(false);
    }
  }, [filterCluster, filterManual]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getClusterName = (id) => {
    const cluster = clusters.find((c) => c.id === id);
    return cluster?.name || 'Unknown';
  };

  const getManualTitle = (id) => {
    const manual = manuals.find((m) => m.id === id);
    return manual?.title || 'Unknown';
  };

  const handleApprove = async (module) => {
    try {
      await approveModule(module.id);
      setAlert({ type: 'success', message: `Module "${module.title}" approved!` });
      loadData();
      if (selectedModule?.id === module.id) {
        setSelectedModule({ ...selectedModule, approved: true });
      }
    } catch (error) {
      setAlert({ type: 'error', message: error.message || 'Failed to approve module' });
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteModule(deleteConfirm.id);
      setAlert({ type: 'success', message: 'Module deleted successfully!' });
      loadData();
      if (selectedModule?.id === deleteConfirm.id) {
        setSelectedModule(null);
      }
    } catch (error) {
      setAlert({ type: 'error', message: error.message || 'Failed to delete module' });
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleExport = async (module, event) => {
    // Prevent card click event
    event?.stopPropagation();

    try {
      setExportingModuleId(module.id);
      
      // Step 1: Export the module PDF
      console.log('Exporting module:', module.id);
      const response = await exportModulePDF(module.id);
      console.log('Export response:', response);
      
      // axios already unwraps .data, so response itself is the data
      const exportResponse = response.data || response;
      console.log('Export data:', exportResponse);
      
      if (!exportResponse || !exportResponse.pdf_id) {
        throw new Error('Invalid response from server: pdf_id not found');
      }
      
      const pdfId = exportResponse.pdf_id;
      console.log('PDF ID:', pdfId);

      // Step 2: Download the PDF
      const downloadResponse = await downloadPDF(pdfId);
      const pdfBlob = downloadResponse.data || downloadResponse;
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${module.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setAlert({ type: 'success', message: 'Module exported successfully!' });
    } catch (error) {
      console.error('Export error:', error);
      setAlert({ type: 'error', message: error.message || 'Failed to export module' });
    } finally {
      setExportingModuleId(null);
    }
  };

  return (
    <PageTransition>
      <div className="page">
        <PageHeader
          title="Module Library"
          subtitle="Browse, review, and manage all generated training modules"
          pageNumber="4"
        />

        {/* Alerts */}
        <AnimatePresence>
          {alert && (
            <Alert type={alert.type} onDismiss={() => setAlert(null)}>
              {alert.message}
            </Alert>
          )}
        </AnimatePresence>

        {/* View: Module Detail or List */}
        {selectedModule ? (
          <ModuleDetail
            module={selectedModule}
            clusterName={getClusterName(selectedModule.cluster_id)}
            manualTitle={getManualTitle(selectedModule.manual_id)}
            onBack={() => setSelectedModule(null)}
            onApprove={() => handleApprove(selectedModule)}
            onDelete={() => setDeleteConfirm(selectedModule)}
            onFeedback={() => setShowFeedback(true)}
          />
        ) : (
          <>
            {/* Filters */}
            <FadeIn className="mb-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 text-sm text-ink-500">
                  <Filter className="w-4 h-4" />
                  Filter by:
                </div>
                <select
                  className="form-input form-select py-2 w-auto"
                  value={filterCluster}
                  onChange={(e) => setFilterCluster(e.target.value)}
                >
                  <option value="">All Clusters</option>
                  {clusters.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <select
                  className="form-input form-select py-2 w-auto"
                  value={filterManual}
                  onChange={(e) => setFilterManual(e.target.value)}
                >
                  <option value="">All Manuals</option>
                  {manuals.map((m) => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
                {(filterCluster || filterManual) && (
                  <button
                    onClick={() => {
                      setFilterCluster('');
                      setFilterManual('');
                    }}
                    className="btn btn-ghost btn-sm"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </FadeIn>

            {/* Module List */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="card p-6 animate-pulse">
                    <div className="skeleton-heading mb-3" />
                    <div className="skeleton-text w-1/2 mb-2" />
                    <div className="skeleton-text w-1/3" />
                  </div>
                ))}
              </div>
            ) : modules.length === 0 ? (
              <EmptyState
                icon={Library}
                title="No Modules Found"
                description={
                  filterCluster || filterManual
                    ? 'No modules match your current filters. Try adjusting or clearing the filters.'
                    : 'Generate your first training module to see it here.'
                }
                action={
                  filterCluster || filterManual ? (
                    <button
                      onClick={() => {
                        setFilterCluster('');
                        setFilterManual('');
                      }}
                      className="btn btn-primary"
                    >
                      Clear Filters
                    </button>
                  ) : null
                }
              />
            ) : (
              <motion.div
                className="grid gap-4 md:grid-cols-2"
                variants={listContainerVariants}
                initial="hidden"
                animate="visible"
              >
                {modules.map((module, index) => (
                  <motion.div
                    key={module.id}
                    variants={listItemVariants}
                    className="card card-paper group cursor-pointer relative overflow-hidden"
                    onClick={() => setSelectedModule(module)}
                    whileHover={{ y: -6, scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    style={{
                      boxShadow: 'var(--shadow-paper)',
                    }}
                  >
                    {/* Bookmark ribbon */}
                    <div 
                      className="absolute top-0 right-4 w-8 h-10"
                      style={{
                        background: module.approved 
                          ? 'linear-gradient(135deg, var(--success-400) 0%, var(--success-500) 100%)'
                          : 'linear-gradient(135deg, var(--warm-400) 0%, var(--warm-500) 100%)',
                        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                    />
                    
                    {/* Card accent stripe */}
                    <div 
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ 
                        background: module.approved 
                          ? 'var(--gradient-teal-spark)'
                          : 'var(--gradient-warm-spark)'
                      }}
                    />

                    <div className="p-6 pt-5">
                      <div className="flex items-start justify-between mb-3 pr-8">
                        <div className="flex-1">
                          <motion.h3 
                            className="text-lg font-medium mb-1 transition-colors"
                            style={{ color: 'var(--ink-100)' }}
                            whileHover={{ color: 'var(--setu-400)' }}
                          >
                            {module.title}
                          </motion.h3>
                          <div className="flex flex-wrap gap-3 text-sm" style={{ color: 'var(--ink-400)' }}>
                            <span className="flex items-center gap-1">
                              <Building2 className="w-4 h-4" style={{ color: 'var(--setu-500)' }} />
                              {getClusterName(module.cluster_id)}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="w-4 h-4" style={{ color: 'var(--warm-500)' }} />
                              {getManualTitle(module.manual_id)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Date and status row */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--ink-400)' }}>
                          <Calendar className="w-3 h-3" />
                          {new Date(module.created_at).toLocaleDateString()}
                        </span>
                        {module.approved ? (
                          <Badge variant="success">
                            <CheckCircle className="w-3 h-3" />
                            Approved
                          </Badge>
                        ) : (
                          <Badge variant="warning">
                            <Clock className="w-3 h-3" />
                            Pending
                          </Badge>
                        )}
                      </div>

                      {/* Preview with fade */}
                      <div className="relative">
                        <p className="text-sm line-clamp-2" style={{ color: 'var(--ink-400)' }}>
                          {module.adapted_content?.substring(0, 150)}...
                        </p>
                        <div 
                          className="absolute bottom-0 left-0 right-0 h-6 pointer-events-none"
                          style={{ 
                            background: 'linear-gradient(to top, var(--paper-50), transparent)'
                          }}
                        />
                      </div>

                      {/* Hover prompt */}
                      <div 
                        className="mt-3 pt-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ borderTop: '1px solid var(--paper-200)' }}
                      >
                        <span className="text-xs" style={{ color: 'var(--setu-400)' }}>
                          Click to read full module
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleExport(module, e)}
                            disabled={exportingModuleId === module.id}
                            className="flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors"
                            style={{
                              color: exportingModuleId === module.id ? 'var(--ink-300)' : 'var(--setu-500)',
                              backgroundColor: 'var(--paper-100)',
                              border: '1px solid var(--paper-200)',
                            }}
                            onMouseEnter={(e) => {
                              if (exportingModuleId !== module.id) {
                                e.currentTarget.style.backgroundColor = 'var(--setu-50)';
                                e.currentTarget.style.borderColor = 'var(--setu-300)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--paper-100)';
                              e.currentTarget.style.borderColor = 'var(--paper-200)';
                            }}
                          >
                            {exportingModuleId === module.id ? (
                              <>
                                <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin" 
                                     style={{ borderColor: 'var(--ink-300)', borderTopColor: 'transparent' }} />
                                Exporting...
                              </>
                            ) : (
                              <>
                                <Download className="w-3 h-3" />
                                Export & Share
                              </>
                            )}
                          </button>
                          <BookOpen className="w-4 h-4" style={{ color: 'var(--setu-500)' }} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={handleDelete}
          title="Delete Module"
          message={`Are you sure you want to delete "${deleteConfirm?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="danger"
        />

        {/* Feedback Modal */}
        {selectedModule && (
          <FeedbackModal
            isOpen={showFeedback}
            onClose={() => setShowFeedback(false)}
            moduleId={selectedModule.id}
            moduleTitle={selectedModule.title}
            onSuccess={() => {
              setAlert({ type: 'success', message: 'Thank you for your feedback!' });
              setShowFeedback(false);
            }}
            onError={(msg) => setAlert({ type: 'error', message: msg })}
          />
        )}
      </div>
    </PageTransition>
  );
}

// ==================== MODULE DETAIL COMPONENT ====================
function ModuleDetail({
  module,
  clusterName,
  manualTitle,
  onBack,
  onApprove,
  onDelete,
  onFeedback,
}) {
  return (
    <FadeIn>
      {/* Back button */}
      <button onClick={onBack} className="btn btn-ghost mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Library
      </button>

      <div className="card">
        {/* Header */}
        <div className="card-header">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-medium text-ink-800 mb-2">
                {module.title}
              </h2>
              <div className="flex flex-wrap gap-4 text-sm text-ink-500">
                <span className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {clusterName}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {manualTitle}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(module.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {module.approved ? (
                <Badge variant="success">
                  <CheckCircle className="w-3 h-3" />
                  Approved
                </Badge>
              ) : (
                <Badge variant="warning">
                  <Clock className="w-3 h-3" />
                  Pending Review
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Split view content */}
        <div className="split-view p-6">
          {/* Original Content */}
          <div className="split-panel">
            <div className="split-panel-header">
              <BookOpen className="w-4 h-4" />
              Original Content
            </div>
            <div className="split-panel-body max-h-[500px]">
              <pre className="prose-content text-sm">{module.original_content}</pre>
            </div>
          </div>

          {/* Adapted Content */}
          <div className="split-panel adapted">
            <div className="split-panel-header">
              <Sparkles className="w-4 h-4" />
              Adapted Content
            </div>
            <div className="split-panel-body max-h-[500px]">
              <pre className="prose-content text-sm">{module.adapted_content}</pre>
            </div>
          </div>
        </div>

        {/* Learning Objective */}
        {module.learning_objective && (
          <div className="px-6 pb-6">
            <div className="bg-success-50 border border-success-200 rounded-page p-4">
              <p className="text-xs text-success-600 uppercase tracking-wider mb-1">
                Learning Objective
              </p>
              <p className="text-sm text-success-800">{module.learning_objective}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="card-footer flex flex-wrap gap-3 justify-between items-center">
          <div className="flex gap-3">
            {!module.approved && (
              <button onClick={onApprove} className="btn btn-success">
                <ThumbsUp className="w-4 h-4" />
                Approve Module
              </button>
            )}
            <button onClick={onFeedback} className="btn btn-outline">
              <MessageSquare className="w-4 h-4" />
              Give Feedback
            </button>
          </div>
          <button onClick={onDelete} className="btn btn-ghost text-danger-500 hover:text-danger-600">
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </FadeIn>
  );
}

// ==================== FEEDBACK MODAL COMPONENT ====================
function FeedbackModal({ isOpen, onClose, moduleId, moduleTitle, onSuccess, onError }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      onError('Please select a rating');
      return;
    }

    setSubmitting(true);

    try {
      await submitFeedback(moduleId, rating, comment || null);
      onSuccess();
      setRating(0);
      setComment('');
    } catch (error) {
      onError(error.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Give Feedback" icon={MessageSquare}>
      <form onSubmit={handleSubmit}>
        <div className="modal-body space-y-6">
          {/* Module title */}
          <div className="bg-paper-100 rounded-page p-4">
            <p className="text-xs text-ink-400 mb-1">Rating module:</p>
            <p className="font-medium text-ink-700">{moduleTitle}</p>
          </div>

          {/* Why feedback matters */}
          <div className="bg-setu-50 border border-setu-200 rounded-page p-4">
            <p className="text-sm text-setu-700">
              <strong>Why feedback matters:</strong> Your input helps improve AI-generated content 
              quality and ensures modules meet teacher needs across different clusters.
            </p>
          </div>

          {/* Star Rating */}
          <div className="form-group">
            <label className="form-label">
              Rating <span className="form-required">*</span>
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 focus:outline-none"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <Star
                    className={`rating-star ${
                      star <= (hoverRating || rating) ? 'filled' : 'empty'
                    }`}
                    fill={star <= (hoverRating || rating) ? 'currentColor' : 'none'}
                  />
                </button>
              ))}
            </div>
            <p className="form-hint">
              {rating === 0
                ? 'Click to rate'
                : rating === 1
                ? 'Poor - needs significant improvement'
                : rating === 2
                ? 'Fair - has issues'
                : rating === 3
                ? 'Good - acceptable quality'
                : rating === 4
                ? 'Very Good - minor improvements possible'
                : 'Excellent - ready to use'}
            </p>
          </div>

          {/* Comment */}
          <div className="form-group">
            <label className="form-label">Comments (Optional)</label>
            <textarea
              className="form-input form-textarea"
              rows={4}
              placeholder="Share specific feedback about the content quality, accuracy, or suggestions for improvement..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting || rating === 0}>
            {submitting ? (
              <>
                <LoadingSpinner size="sm" />
                Submitting...
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4" />
                Submit Feedback
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
