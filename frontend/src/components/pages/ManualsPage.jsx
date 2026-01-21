/**
 * Manuals Page (Page 2)
 * Upload and manage training PDF manuals - the source of truth
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Upload,
  CheckCircle,
  Clock,
  Search,
  Trash2,
  File,
  Calendar,
  BookOpen,
  ArrowRight,
  X,
  AlertCircle,
  Languages,
  Sparkles,
  Eye,
  ChevronDown,
  ChevronUp,
  BookMarked,
  Pin,
  PinOff,
} from 'lucide-react';
import { PageTransition, FadeIn, listContainerVariants, listItemVariants } from '../ui/PageTransition';
import { PageHeader, Modal, Alert, EmptyState, ConfirmDialog, Badge, StatCard, LoadingSpinner } from '../ui/SharedComponents';
import { getManuals, uploadManual, indexManual, deleteManual, toggleManualPin } from '../../services/api';
import { fuzzySearch } from '../../utils/fuzzySearch';

// Language display names with native script
const LANGUAGE_DISPLAY = {
  hindi: 'हिंदी (Hindi)',
  marathi: 'मराठी (Marathi)',
  bengali: 'বাংলা (Bengali)',
  tamil: 'தமிழ் (Tamil)',
  telugu: 'తెలుగు (Telugu)',
  gujarati: 'ગુજરાતી (Gujarati)',
  kannada: 'ಕನ್ನಡ (Kannada)',
  malayalam: 'മലയാളം (Malayalam)',
  punjabi: 'ਪੰਜਾਬੀ (Punjabi)',
  odia: 'ଓଡ଼ିଆ (Odia)',
  urdu: 'اردو (Urdu)',
  english: 'English',
};

export default function ManualsPage() {
  const [manuals, setManuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [indexingIds, setIndexingIds] = useState(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [alert, setAlert] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [expandedManualId, setExpandedManualId] = useState(null);
  const [showAdaptedModal, setShowAdaptedModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Get user to check permissions
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user?.role === 'admin';

  // Form state
  const [uploadTitle, setUploadTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const loadManuals = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getManuals();
      setManuals(data);
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to load manuals' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadManuals();
  }, [loadManuals]);

  const handleFileSelect = (file) => {
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      if (!uploadTitle) {
        setUploadTitle(file.name.replace('.pdf', ''));
      }
    } else {
      setAlert({ type: 'error', message: 'Please select a valid PDF file' });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !uploadTitle.trim()) {
      setAlert({ type: 'error', message: 'Please provide both title and file' });
      return;
    }

    // Validate manual title has at least 2 characters
    if (uploadTitle.trim().length < 2) {
      setAlert({ type: 'error', message: 'Manual title must be at least 2 characters long' });
      return;
    }

    setUploading(true);
    setAlert(null);

    try {
      await uploadManual(uploadTitle.trim(), selectedFile);
      setAlert({ type: 'success', message: 'Manual uploaded successfully! Now index it to enable AI search.' });
      setShowUploadModal(false);
      setUploadTitle('');
      setSelectedFile(null);
      loadManuals();
    } catch (error) {
      setAlert({ type: 'error', message: error.message || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleIndex = async (manual) => {
    setIndexingIds((prev) => new Set([...prev, manual.id]));
    setAlert(null);

    try {
      await indexManual(manual.id);
      setAlert({ type: 'success', message: `"${manual.title}" indexed successfully! It's now ready for AI processing.` });
      loadManuals();
    } catch (error) {
      setAlert({ type: 'error', message: error.message || 'Indexing failed' });
    } finally {
      setIndexingIds((prev) => {
        const next = new Set(prev);
        next.delete(manual.id);
        return next;
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteManual(deleteConfirm.id);
      setAlert({ type: 'success', message: 'Manual deleted successfully!' });
      loadManuals();
    } catch (error) {
      setAlert({ type: 'error', message: error.message || 'Failed to delete manual' });
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleTogglePin = async (manual, e) => {
    e.stopPropagation();
    try {
      await toggleManualPin(manual.id);
      setAlert({ 
        type: 'success', 
        message: manual.pinned ? 'Manual unpinned' : 'Manual pinned for quick access' 
      });
      loadManuals();
    } catch (error) {
      setAlert({ type: 'error', message: error.message || 'Failed to update pin status' });
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const stats = {
    total: manuals.length,
    indexed: manuals.filter((m) => m.indexed).length,
    pending: manuals.filter((m) => !m.indexed).length,
    totalPages: manuals.reduce((sum, m) => sum + (m.total_pages || 0), 0),
  };

  // Filter manuals based on search query
  const filteredManuals = fuzzySearch(
    manuals,
    searchQuery,
    ['title', 'filename', 'detected_language', 'adapted_summary', 'extracted_text'],
    0.4 // Lower threshold for more lenient matching
  );

  return (
    <PageTransition>
      <div className="page">
        <PageHeader
          title="Training Manuals"
          subtitle={isAdmin ? "Upload and manage state training PDF manuals for AI-powered content generation" : "Browse available training manuals for module generation"}
          pageNumber="2"
          action={
            isAdmin ? (
              <button onClick={() => setShowUploadModal(true)} className="btn btn-primary">
                <Upload className="w-4 h-4" />
                Upload Manual
              </button>
            ) : null
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
          <div className="bg-warm-50 border border-warm-200 rounded-page p-4">
            <p className="text-sm text-warm-700">
              <strong>Source of Truth:</strong> Manuals are never altered. The AI reads and adapts 
              content from these documents while preserving the original. After uploading, 
              index each manual to enable intelligent search.
            </p>
          </div>
        </FadeIn>

        {/* Stats */}
        <FadeIn delay={0.1} className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={BookOpen} value={stats.total} label="Total Manuals" loading={loading} />
            <StatCard icon={CheckCircle} value={stats.indexed} label="Indexed" loading={loading} />
            <StatCard icon={Clock} value={stats.pending} label="Pending" loading={loading} />
            <StatCard icon={FileText} value={stats.totalPages} label="Total Pages" loading={loading} />
          </div>
        </FadeIn>

        {/* Search Bar */}
        {manuals.length > 0 && (
          <FadeIn delay={0.15} className="mb-6">
            <div className="relative max-w-md">
              <Search 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" 
                style={{ color: 'var(--ink-400)' }}
              />
              <input
                type="text"
                placeholder="Search manuals by title, language, content..."
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
                Found {filteredManuals.length} {filteredManuals.length === 1 ? 'manual' : 'manuals'}
              </p>
            )}
          </FadeIn>
        )}

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6 animate-pulse flex gap-4">
                <div className="skeleton w-16 h-20 rounded" />
                <div className="flex-1">
                  <div className="skeleton-heading mb-3" />
                  <div className="skeleton-text w-1/2 mb-2" />
                  <div className="skeleton-text w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : manuals.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No Manuals Uploaded"
            description="Upload your first training manual PDF to start generating AI-adapted content for your teacher clusters."
            action={
              <button onClick={() => setShowUploadModal(true)} className="btn btn-primary">
                <Upload className="w-4 h-4" />
                Upload First Manual
              </button>
            }
          />
        ) : (
          <motion.div
            className="grid gap-4 md:grid-cols-2"
            variants={listContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredManuals.map((manual, index) => (
              <motion.div
                key={manual.id}
                variants={listItemVariants}
                className="card card-paper group relative overflow-hidden"
                whileHover={{ y: -4, boxShadow: 'var(--shadow-paper-hover)' }}
                style={{ 
                  background: 'var(--gradient-paper)',
                }}
              >
                {/* Accent stripe based on index status */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ 
                    background: manual.indexed 
                      ? 'var(--gradient-setu)' 
                      : 'var(--gradient-warm-spark)' 
                  }}
                />

                <div className="p-6 flex gap-5">
                  {/* Book-like PDF Icon */}
                  <motion.div 
                    className="relative flex-shrink-0"
                    whileHover={{ rotate: -3, scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div 
                      className="w-16 h-22 rounded-r-lg flex flex-col items-center justify-center relative"
                      style={{ 
                        background: 'linear-gradient(135deg, var(--warm-100) 0%, var(--paper-200) 100%)',
                        boxShadow: '2px 4px 12px rgba(0,0,0,0.08)',
                        border: '1px solid var(--paper-300)',
                      }}
                    >
                      {/* Book spine effect */}
                      <div 
                        className="absolute left-0 top-0 bottom-0 w-1 rounded-l"
                        style={{ 
                          background: manual.indexed 
                            ? 'var(--setu-400)' 
                            : 'var(--warm-400)',
                        }}
                      />
                      <File className="w-7 h-7" style={{ color: 'var(--ink-400)' }} />
                      <span 
                        className="text-[10px] mt-1 font-medium"
                        style={{ color: 'var(--ink-400)' }}
                      >
                        PDF
                      </span>
                    </div>
                    {manual.indexed && (
                      <motion.div 
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ 
                          background: 'var(--success-500)',
                          boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)',
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-white" />
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="text-lg font-medium mb-1 truncate transition-colors group-hover:text-setu-400 flex items-center gap-2"
                      style={{ color: 'var(--ink-900)' }}
                    >
                      {manual.title}
                      {manual.pinned && (
                        <Pin className="w-4 h-4 fill-current flex-shrink-0" style={{ color: 'var(--setu-600)' }} />
                      )}
                    </h3>
                    <p className="text-sm truncate mb-3" style={{ color: 'var(--ink-600)' }}>
                      {manual.filename}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-ink-500 mb-4">
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {manual.total_pages || '?'} pages
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(manual.upload_date).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {manual.indexed ? (
                        <Badge variant="success">
                          <CheckCircle className="w-3 h-3" />
                          Indexed & Ready
                        </Badge>
                      ) : (
                        <Badge variant="warning">
                          <Clock className="w-3 h-3" />
                          Needs Indexing
                        </Badge>
                      )}
                      {manual.detected_language && (
                        <Badge variant="default">
                          <Languages className="w-3 h-3" />
                          {LANGUAGE_DISPLAY[manual.detected_language] || manual.detected_language}
                        </Badge>
                      )}
                    </div>

                    {/* AI Adapted Content Preview */}
                    {manual.indexed && manual.adapted_summary && (
                      <motion.div 
                        className="mt-4 pt-4"
                        style={{ borderTop: '1px dashed var(--paper-300)' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" style={{ color: 'var(--setu-500)' }} />
                            <span className="text-sm font-medium" style={{ color: 'var(--ink-200)' }}>
                              AI Adapted Content
                            </span>
                          </div>
                          <button
                            onClick={() => setShowAdaptedModal(manual)}
                            className="btn btn-ghost btn-sm text-setu-600 hover:text-setu-700"
                          >
                            <Eye className="w-4 h-4" />
                            View Full
                          </button>
                        </div>
                        
                        {/* Key Points Preview */}
                        {manual.key_points && manual.key_points.length > 0 && (
                          <div className="space-y-1">
                            {manual.key_points.slice(0, 3).map((point, idx) => (
                              <p 
                                key={idx} 
                                className="text-sm line-clamp-1 flex items-start gap-2"
                                style={{ color: 'var(--ink-300)' }}
                              >
                                <span style={{ color: 'var(--setu-400)' }}>•</span>
                                <span className="indic-text">{point}</span>
                              </p>
                            ))}
                            {manual.key_points.length > 3 && (
                              <p className="text-xs" style={{ color: 'var(--ink-400)' }}>
                                +{manual.key_points.length - 3} more key points...
                              </p>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 justify-center">
                    <button
                      onClick={(e) => handleTogglePin(manual, e)}
                      className={`btn btn-outline btn-sm ${manual.pinned ? 'btn-primary' : ''}`}
                      title={manual.pinned ? 'Unpin manual' : 'Pin manual'}
                    >
                      {manual.pinned ? <Pin className="w-4 h-4 fill-current" /> : <PinOff className="w-4 h-4" />}
                      {manual.pinned ? 'Pinned' : 'Pin'}
                    </button>
                    {!manual.indexed && (
                      <button
                        onClick={() => handleIndex(manual)}
                        className="btn btn-primary btn-sm"
                        disabled={indexingIds.has(manual.id)}
                      >
                        {indexingIds.has(manual.id) ? (
                          <>
                            <LoadingSpinner size="sm" />
                            Indexing...
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4" />
                            Index Now
                          </>
                        )}
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => setDeleteConfirm(manual)}
                        className="btn btn-outline btn-sm text-danger-500 hover:text-danger-600"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Next page CTA */}
        {manuals.some((m) => m.indexed) && (
          <FadeIn delay={0.3} className="mt-8 text-center">
            <button
              onClick={() => navigate('/generate')}
              className="btn btn-outline group"
            >
              Continue to Generate Modules
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-xs text-ink-400 mt-2">Turn to Page 3</p>
          </FadeIn>
        )}

        {/* Upload Modal */}
        <Modal
          isOpen={showUploadModal}
          onClose={() => {
            setShowUploadModal(false);
            setUploadTitle('');
            setSelectedFile(null);
          }}
          title="Upload Training Manual"
          icon={Upload}
          size="lg"
        >
          <form onSubmit={handleUpload}>
            <div className="modal-body space-y-5">
              {/* Title */}
              <div className="form-group">
                <label className="form-label">
                  Manual Title <span className="form-required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., NCF 2023 Teacher Training Manual"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  minLength={2}
                  required
                />
                <p className="form-hint">A descriptive title for this training manual (minimum 2 characters)</p>
              </div>

              {/* File Upload Zone */}
              <div className="form-group">
                <label className="form-label">
                  PDF File <span className="form-required">*</span>
                </label>
                <div
                  className={`file-upload-zone ${dragOver ? 'dragging' : ''} ${selectedFile ? 'has-file' : ''}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                  />

                  {selectedFile ? (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-14 bg-paper-200 rounded flex items-center justify-center">
                        <File className="w-6 h-6 text-ink-500" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-ink-700">{selectedFile.name}</p>
                        <p className="text-sm text-ink-400">{formatFileSize(selectedFile.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        className="btn btn-ghost btn-icon ml-auto"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-ink-300 mb-3" />
                      <p className="text-ink-600 mb-1">
                        Drop your PDF here or <span className="text-setu-600">browse</span>
                      </p>
                      <p className="text-sm text-ink-400">Only PDF files are accepted</p>
                    </>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="bg-paper-100 rounded-page p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-ink-400 flex-shrink-0" />
                  <div className="text-sm text-ink-500">
                    <p className="mb-1">After uploading, you'll need to index the manual to enable AI search.</p>
                    <p>Indexing extracts and processes the text content for intelligent retrieval.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadTitle('');
                  setSelectedFile(null);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={uploading || !selectedFile || !uploadTitle.trim()}
              >
                {uploading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload Manual
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>

        {/* AI Adapted Content Modal */}
        <Modal
          isOpen={!!showAdaptedModal}
          onClose={() => setShowAdaptedModal(null)}
          title={showAdaptedModal?.title ? `AI Adaptation: ${showAdaptedModal.title}` : 'AI Adapted Content'}
          icon={Sparkles}
          size="xl"
        >
          {showAdaptedModal && (
            <div className="modal-body">
              {/* Language Badge */}
              {showAdaptedModal.detected_language && (
                <div className="mb-4 flex items-center gap-2">
                  <Languages className="w-4 h-4" style={{ color: 'var(--setu-500)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--ink-200)' }}>
                    Content Language:
                  </span>
                  <Badge variant="primary">
                    {LANGUAGE_DISPLAY[showAdaptedModal.detected_language] || showAdaptedModal.detected_language}
                  </Badge>
                </div>
              )}

              {/* Key Points Section */}
              {showAdaptedModal.key_points && showAdaptedModal.key_points.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-medium mb-3 flex items-center gap-2" style={{ color: 'var(--ink-100)' }}>
                    <BookMarked className="w-5 h-5" style={{ color: 'var(--setu-500)' }} />
                    Key Points / मुख्य बिंदु
                  </h4>
                  <ul className="space-y-2">
                    {showAdaptedModal.key_points.map((point, idx) => (
                      <li 
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-lg"
                        style={{ backgroundColor: 'var(--paper-100)' }}
                      >
                        <span 
                          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                          style={{ 
                            backgroundColor: 'var(--setu-100)', 
                            color: 'var(--setu-400)' 
                          }}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-sm indic-text leading-relaxed" style={{ color: 'var(--ink-300)' }}>
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Full Summary Section */}
              {showAdaptedModal.adapted_summary && (
                <div>
                  <h4 className="text-lg font-medium mb-3 flex items-center gap-2" style={{ color: 'var(--ink-100)' }}>
                    <FileText className="w-5 h-5" style={{ color: 'var(--setu-500)' }} />
                    Complete AI Summary
                  </h4>
                  <div 
                    className="p-4 rounded-lg max-h-96 overflow-y-auto"
                    style={{ 
                      backgroundColor: 'var(--paper-100)',
                      border: '1px solid var(--paper-200)',
                    }}
                  >
                    <pre 
                      className="whitespace-pre-wrap text-sm leading-relaxed indic-text"
                      style={{ 
                        color: 'var(--ink-300)',
                        fontFamily: 'inherit',
                      }}
                    >
                      {showAdaptedModal.adapted_summary}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="modal-footer">
            <button
              onClick={() => setShowAdaptedModal(null)}
              className="btn btn-secondary"
            >
              Close
            </button>
          </div>
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={handleDelete}
          title="Delete Manual"
          message={`Are you sure you want to delete "${deleteConfirm?.title}"? This will also remove its indexed content from the AI search.`}
          confirmText="Delete"
          variant="danger"
        />
      </div>
    </PageTransition>
  );
}
