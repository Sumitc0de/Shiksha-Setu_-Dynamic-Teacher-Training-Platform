/**
 * Admin Manuals Page - Government Portal Version
 * Upload and manage training PDF manuals with white/blue color scheme
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
  X,
  AlertCircle,
  Languages,
  Sparkles,
  Eye,
  BookMarked,
  Pin,
  PinOff,
} from 'lucide-react';
import { PageTransition, FadeIn, listContainerVariants, listItemVariants } from '../ui/PageTransition';
import { Modal, Alert, EmptyState, ConfirmDialog, Badge, StatCard, LoadingSpinner } from '../ui/SharedComponents';
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
  punjabi: 'ਪੰਜਾಬੀ (Punjabi)',
  odia: 'ଓଡ଼ିଆ (Odia)',
  urdu: 'اردو (Urdu)',
  english: 'English',
};

export default function AdminManualsPage() {
  const [manuals, setManuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [indexingIds, setIndexingIds] = useState(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [alert, setAlert] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [showAdaptedModal, setShowAdaptedModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

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
      setAlert({ type: 'success', message: `"${manual.title}" indexed successfully!` });
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

  const filteredManuals = fuzzySearch(
    manuals,
    searchQuery,
    ['title', 'filename', 'detected_language', 'adapted_summary', 'extracted_text'],
    0.4
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Training Manuals</h1>
              <p className="text-gray-600 mt-1">Upload and manage state training PDF manuals</p>
            </div>
            <button onClick={() => setShowUploadModal(true)} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-shadow flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Manual
            </button>
          </div>
        </div>

        {/* Alerts */}
        <AnimatePresence>
          {alert && (
            <Alert type={alert.type} onDismiss={() => setAlert(null)}>
              {alert.message}
            </Alert>
          )}
        </AnimatePresence>

        {/* Info box */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Source of Truth:</strong> Manuals are never altered. The AI reads and adapts 
            content from these documents while preserving the original. After uploading, 
            index each manual to enable intelligent search.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Manuals</div>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.indexed}</div>
                <div className="text-sm text-gray-600">Indexed</div>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalPages}</div>
                <div className="text-sm text-gray-600">Total Pages</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {manuals.length > 0 && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search manuals by title, language, content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  title="Clear search"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="text-sm mt-2 text-gray-600">
                Found {filteredManuals.length} {filteredManuals.length === 1 ? 'manual' : 'manuals'}
              </p>
            )}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse flex gap-4">
                <div className="w-16 h-20 bg-gray-200 rounded" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : manuals.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Manuals Uploaded</h3>
            <p className="text-gray-600 mb-6">Upload your first training manual PDF to start generating AI-adapted content.</p>
            <button onClick={() => setShowUploadModal(true)} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-shadow inline-flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload First Manual
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredManuals.map((manual) => (
              <div
                key={manual.id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
              >
                {/* Accent stripe */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${manual.indexed ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-yellow-400'}`} />

                <div className="p-6 flex gap-5">
                  {/* PDF Icon */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-22 rounded-lg flex flex-col items-center justify-center relative bg-gray-100 border border-gray-200 shadow-sm">
                      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l ${manual.indexed ? 'bg-blue-600' : 'bg-yellow-400'}`} />
                      <File className="w-7 h-7 text-gray-600" />
                      <span className="text-[10px] mt-1 font-medium text-gray-600">PDF</span>
                    </div>
                    {manual.indexed && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                        <CheckCircle className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium mb-1 truncate text-gray-900 group-hover:text-blue-600 flex items-center gap-2">
                      {manual.title}
                      {manual.pinned && <Pin className="w-4 h-4 fill-current flex-shrink-0 text-blue-600" />}
                    </h3>
                    <p className="text-sm truncate mb-3 text-gray-600">{manual.filename}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
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
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                          <CheckCircle className="w-3 h-3" />
                          Indexed & Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                          <Clock className="w-3 h-3" />
                          Needs Indexing
                        </span>
                      )}
                      {manual.detected_language && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                          <Languages className="w-3 h-3" />
                          {LANGUAGE_DISPLAY[manual.detected_language] || manual.detected_language}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 justify-center">
                    <button
                      onClick={(e) => handleTogglePin(manual, e)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors flex items-center gap-2 ${
                        manual.pinned 
                          ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' 
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                      title={manual.pinned ? 'Unpin manual' : 'Pin manual'}
                    >
                      {manual.pinned ? <Pin className="w-4 h-4 fill-current" /> : <PinOff className="w-4 h-4" />}
                      {manual.pinned ? 'Pinned' : 'Pin'}
                    </button>
                    {!manual.indexed && (
                      <button
                        onClick={() => handleIndex(manual)}
                        className="px-3 py-2 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-md transition-shadow flex items-center gap-2"
                        disabled={indexingIds.has(manual.id)}
                      >
                        {indexingIds.has(manual.id) ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                    <button
                      onClick={() => setDeleteConfirm(manual)}
                      className="px-3 py-2 text-sm bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
              <div className="form-group">
                <label className="form-label">Manual Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., NCF 2023 Teacher Training Manual"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  minLength={2}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">A descriptive title (minimum 2 characters)</p>
              </div>

              <div className="form-group">
                <label className="form-label">PDF File <span className="text-red-500">*</span></label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    dragOver ? 'border-blue-500 bg-blue-50' : selectedFile ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
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
                    <div className="flex items-center gap-4 justify-center">
                      <div className="w-12 h-14 bg-gray-200 rounded flex items-center justify-center">
                        <File className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        className="ml-auto p-1 hover:bg-gray-200 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-gray-400 mb-3 mx-auto" />
                      <p className="text-gray-700 mb-1">
                        Drop your PDF here or <span className="text-blue-600 font-medium">browse</span>
                      </p>
                      <p className="text-sm text-gray-500">Only PDF files are accepted</p>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="text-sm text-blue-900">
                  <p className="mb-1">After uploading, you'll need to index the manual to enable AI search.</p>
                  <p>Indexing extracts and processes the text content for intelligent retrieval.</p>
                </div>
              </div>
            </div>

            <div className="modal-footer flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadTitle('');
                  setSelectedFile(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-shadow flex items-center gap-2"
                disabled={uploading || !selectedFile || !uploadTitle.trim()}
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
    </div>
  );
}
