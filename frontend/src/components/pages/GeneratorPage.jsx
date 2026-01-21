/**
 * Module Generator Page (Page 3)
 * The core magic - generate AI-adapted training modules
 * Enhanced with ink-on-paper animations
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Sparkles,
  BookOpen,
  Building2,
  Brain,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Wand2,
  Feather,
  Languages,
  Youtube,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { PageTransition, FadeIn, InkReveal } from '../ui/PageTransition';
import { PageHeader, Alert, LoadingSpinner } from '../ui/SharedComponents';
import ProgressIndicator from '../ui/ProgressIndicator';
import toast from 'react-hot-toast';
import { getClusters, getManuals, generateModule, getSupportedLanguages } from '../../services/api';

// Ink drop animation component
const InkDrop = ({ delay = 0 }) => {
  const shouldReduceMotion = useReducedMotion();
  if (shouldReduceMotion) return null;
  
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: 6,
        height: 6,
        background: 'var(--ink-400)',
        left: `${Math.random() * 80 + 10}%`,
        top: -10,
      }}
      initial={{ y: 0, opacity: 1, scale: 1 }}
      animate={{ 
        y: [0, 100, 120],
        opacity: [1, 0.8, 0],
        scale: [1, 0.8, 0.5],
      }}
      transition={{ 
        duration: 1.5, 
        delay,
        ease: "easeIn",
      }}
    />
  );
};

// Quill pen writing animation
const WritingAnimation = () => {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <div className="relative">
      <motion.div
        className="w-16 h-16 mx-auto mb-4 relative"
        animate={shouldReduceMotion ? {} : { 
          x: [0, 5, 0, -5, 0],
          y: [0, -3, 0, -3, 0],
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Feather className="w-full h-full text-ink-500 transform -rotate-45" />
        {!shouldReduceMotion && (
          <>
            {[0, 0.3, 0.6, 0.9, 1.2].map((delay, i) => (
              <InkDrop key={i} delay={delay} />
            ))}
          </>
        )}
      </motion.div>
      
      {/* Ink line being written */}
      {!shouldReduceMotion && (
        <motion.div
          className="absolute left-1/2 top-16 h-0.5 bg-ink-300"
          style={{ transformOrigin: 'left center' }}
          initial={{ width: 0, x: '-50%' }}
          animate={{ 
            width: [0, 60, 0],
            opacity: [0, 1, 0],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </div>
  );
};

// Animated text that appears like ink
const InkText = ({ children, delay = 0 }) => {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      initial={{ opacity: 0, filter: shouldReduceMotion ? 'none' : 'blur(4px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      transition={{ 
        duration: shouldReduceMotion ? 0.2 : 0.8, 
        delay,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
};

export default function GeneratorPage() {
  const [clusters, setClusters] = useState([]);
  const [manuals, setManuals] = useState([]);
  const [languages, setLanguages] = useState({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationMessage, setGenerationMessage] = useState('');
  const [generatedModule, setGeneratedModule] = useState(null);
  const [alert, setAlert] = useState(null);
  const [showYoutubeSuggestions, setShowYoutubeSuggestions] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    manual_id: '',
    cluster_id: '',
    topic: '',
    target_language: 'english',
  });

  // YouTube suggestions for teacher training
  const youtubeSuggestions = [
    {
      title: 'Effective Teaching Strategies for Rural Areas',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      category: 'Teaching Methods'
    },
    {
      title: 'Using Technology in Low-Resource Classrooms',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      category: 'Technology'
    },
    {
      title: 'Cultural Sensitivity in Teaching',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      category: 'Cultural Awareness'
    },
    {
      title: 'Interactive Learning Activities',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      category: 'Engagement'
    },
    {
      title: 'Classroom Management Tips',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      category: 'Management'
    },
  ];

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [clustersData, manualsData, languagesData] = await Promise.all([
        getClusters(),
        getManuals(),
        getSupportedLanguages().catch(() => ({
          english: 'English',
          hindi: 'हिंदी (Hindi)',
          marathi: 'मराठी (Marathi)',
          bengali: 'বাংলা (Bengali)',
          tamil: 'தமிழ் (Tamil)',
          telugu: 'తెలుగు (Telugu)',
          gujarati: 'ગુજરાતી (Gujarati)',
          kannada: 'ಕನ್ನಡ (Kannada)',
          malayalam: 'മലയാളം (Malayalam)',
        })),
      ]);
      setClusters(clustersData);
      // Only show indexed manuals
      setManuals(manualsData.filter((m) => m.indexed));
      setLanguages(languagesData);
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-set target language from cluster selection
  useEffect(() => {
    if (formData.cluster_id) {
      const selectedCluster = clusters.find((c) => c.id === parseInt(formData.cluster_id));
      if (selectedCluster && selectedCluster.primary_language) {
        const clusterLang = selectedCluster.primary_language.toLowerCase();
        if (languages[clusterLang]) {
          setFormData((prev) => ({ ...prev, target_language: clusterLang }));
        }
      }
    }
  }, [formData.cluster_id, clusters, languages]);

  const handleGenerate = async (e) => {
    e.preventDefault();

    const topic = (formData.topic || '').trim();

    if (!formData.manual_id || !formData.cluster_id || !topic) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (topic.length < 2) {
      toast.error('Topic must be at least 2 characters');
      return;
    }

    setGenerating(true);
    setAlert(null);
    setGeneratedModule(null);
    setGenerationProgress(0);
    setGenerationMessage('Initializing AI generation...');

    // Simulate progress stages
    const progressStages = [
      { progress: 20, message: 'Analyzing manual content...' },
      { progress: 40, message: 'Understanding cluster context...' },
      { progress: 60, message: 'Generating adapted content...' },
      { progress: 80, message: 'Finalizing module...' },
      { progress: 95, message: 'Almost done...' }
    ];

    let stageIndex = 0;
    const progressInterval = setInterval(() => {
      if (stageIndex < progressStages.length) {
        const stage = progressStages[stageIndex];
        setGenerationProgress(stage.progress);
        setGenerationMessage(stage.message);
        stageIndex++;
      }
    }, 1500);

    try {
      const result = await generateModule(formData);
      clearInterval(progressInterval);
      setGenerationProgress(100);
      setGenerationMessage('Complete!');
      setGeneratedModule(result);
      toast.success('Module generated successfully!');
    } catch (error) {
      clearInterval(progressInterval);
      toast.error(error.message || 'Generation failed. Make sure you have a valid GROQ API key.');
    } finally {
      setTimeout(() => {
        setGenerating(false);
        setGenerationProgress(0);
      }, 500);
    }
  };

  const getClusterName = (id) => {
    const cluster = clusters.find((c) => c.id === parseInt(id));
    return cluster?.name || 'Unknown Cluster';
  };

  const getManualTitle = (id) => {
    const manual = manuals.find((m) => m.id === parseInt(id));
    return manual?.title || 'Unknown Manual';
  };

  const selectedCluster = clusters.find((c) => c.id === parseInt(formData.cluster_id));

  return (
    <PageTransition>
      <div className="page">
        <PageHeader
          title="Module Generator"
          subtitle="Create AI-adapted training modules tailored to specific teacher clusters"
          pageNumber="3"
        />

        {/* Alerts */}
        <AnimatePresence>
          {alert && (
            <Alert type={alert.type} onDismiss={() => setAlert(null)}>
              {alert.message}
            </Alert>
          )}
        </AnimatePresence>

        {/* Prerequisites check */}
        {!loading && (clusters.length === 0 || manuals.length === 0) && (
          <FadeIn className="mb-8">
            <div className="bg-warm-50 border border-warm-200 rounded-page p-6">
              <h3 className="font-medium text-warm-800 mb-2">Prerequisites Required</h3>
              <p className="text-sm text-warm-700 mb-4">
                Before generating modules, you need:
              </p>
              <ul className="space-y-2 text-sm text-warm-700 mb-4">
                <li className="flex items-center gap-2">
                  {clusters.length > 0 ? (
                    <CheckCircle className="w-4 h-4 text-success-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-warm-500" />
                  )}
                  At least one cluster profile
                </li>
                <li className="flex items-center gap-2">
                  {manuals.length > 0 ? (
                    <CheckCircle className="w-4 h-4 text-success-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-warm-500" />
                  )}
                  At least one indexed manual
                </li>
              </ul>
              <div className="flex gap-3">
                {clusters.length === 0 && (
                  <button onClick={() => navigate('/clusters')} className="btn btn-outline btn-sm">
                    Create Cluster
                  </button>
                )}
              </div>
            </div>
          </FadeIn>
        )}

        {/* Main content - Split view */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Generation Form */}
          <div className="lg:col-span-2">
            <FadeIn>
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-ink-800 flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-setu-600" />
                    Generate New Module
                  </h3>
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="py-12 text-center">
                      <LoadingSpinner className="mx-auto mb-3 text-setu-500" />
                      <p className="text-ink-400">Loading...</p>
                    </div>
                  ) : (
                    <form onSubmit={handleGenerate} className="space-y-5">
                      {/* Manual Selection */}
                      <div className="form-group">
                        <label className="form-label">
                          Select Manual <span className="form-required">*</span>
                        </label>
                        <select
                          className="form-input form-select"
                          value={formData.manual_id}
                          onChange={(e) => setFormData({ ...formData, manual_id: e.target.value })}
                          required
                          disabled={manuals.length === 0}
                        >
                          <option value="">Choose a manual...</option>
                          {manuals.map((manual) => (
                            <option key={manual.id} value={manual.id}>
                              {manual.title} ({manual.total_pages} pages)
                            </option>
                          ))}
                        </select>
                        {manuals.length === 0 && (
                          <p className="form-error flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            No indexed manuals available
                          </p>
                        )}
                      </div>

                      {/* Cluster Selection */}
                      <div className="form-group">
                        <label className="form-label">
                          Select Cluster <span className="form-required">*</span>
                        </label>
                        <select
                          className="form-input form-select"
                          value={formData.cluster_id}
                          onChange={(e) => setFormData({ ...formData, cluster_id: e.target.value })}
                          required
                          disabled={clusters.length === 0}
                        >
                          <option value="">Choose a cluster...</option>
                          {clusters.map((cluster) => (
                            <option key={cluster.id} value={cluster.id}>
                              {cluster.name} ({cluster.geographic_type} - {cluster.primary_language})
                            </option>
                          ))}
                        </select>
                        {clusters.length === 0 && (
                          <p className="form-error flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            No clusters available
                          </p>
                        )}
                      </div>

                      {/* Topic Input */}
                      <div className="form-group">
                        <label className="form-label">
                          Topic / Chapter <span className="form-required">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g., Photosynthesis, Fractions, Classroom Management"
                          value={formData.topic}
                          onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                          required
                        />
                        <p className="form-hint">
                          Enter the topic you want to adapt from the selected manual
                        </p>
                      </div>

                      {/* Output Language Selector */}
                      <div className="form-group">
                        <label className="form-label flex items-center gap-2">
                          <Languages className="w-4 h-4 text-setu-500" />
                          Output Language <span className="form-required">*</span>
                        </label>
                        <select
                          className="form-input form-select"
                          value={formData.target_language}
                          onChange={(e) => setFormData({ ...formData, target_language: e.target.value })}
                          required
                        >
                          {Object.entries(languages).map(([code, name]) => (
                            <option key={code} value={code}>
                              {name}
                            </option>
                          ))}
                        </select>
                        <p className="form-hint">
                          The generated content will be translated to this language
                        </p>
                      </div>

                      {/* Cluster Preview */}
                      {selectedCluster && (
                        <div className="bg-setu-50 border border-setu-200 rounded-page p-4">
                          <p className="text-xs text-setu-600 uppercase tracking-wider mb-2">
                            Adapting for:
                          </p>
                          <p className="font-medium text-setu-800">{selectedCluster.name}</p>
                          <p className="text-sm text-setu-600">
                            {selectedCluster.geographic_type} • {selectedCluster.primary_language}
                          </p>
                          {selectedCluster.specific_challenges && (
                            <p className="text-xs text-setu-500 mt-2 line-clamp-2">
                              Challenges: {selectedCluster.specific_challenges}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Generate Button */}
                      <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={generating || !formData.manual_id || !formData.cluster_id}
                      >
                        {generating ? (
                          <>
                            <LoadingSpinner size="sm" />
                            Generating with AI...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Generate Adapted Module
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* How it works */}
              <div className="mt-6 bg-paper-100 rounded-page p-5">
                <h4 className="font-medium text-ink-700 flex items-center gap-2 mb-4">
                  <Brain className="w-5 h-5 text-setu-600" />
                  How AI Adaptation Works
                </h4>
                <div className="space-y-3">
                  {[
                    { num: 1, text: 'RAG retrieves relevant content from the manual' },
                    { num: 2, text: 'Llama 3.3-70B analyzes cluster constraints' },
                    { num: 3, text: 'Content is rewritten for local context' },
                    { num: 4, text: 'Review, approve, and share with teachers' },
                  ].map((step) => (
                    <div key={step.num} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-setu-100 text-setu-700 text-xs font-medium flex items-center justify-center">
                        {step.num}
                      </div>
                      <span className="text-sm text-ink-600">{step.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Right: Generated Content Preview */}
          <div className="lg:col-span-3">
            <FadeIn delay={0.1}>
              {generating ? (
                <motion.div 
                  className="card min-h-[500px] flex items-center justify-center relative overflow-hidden p-8"
                  style={{ background: 'var(--gradient-paper)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {/* Paper lines effect */}
                  <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                    {[...Array(20)].map((_, i) => (
                      <div 
                        key={i} 
                        className="border-b border-ink-400" 
                        style={{ marginTop: '28px' }}
                      />
                    ))}
                  </div>
                  
                  <div className="text-center relative z-10 w-full max-w-md">
                    <WritingAnimation />
                    
                    {/* Progress Indicator */}
                    <div className="mb-6">
                      <ProgressIndicator 
                        progress={generationProgress} 
                        message={generationMessage}
                      />
                    </div>
                    
                    <motion.h3 
                      className="text-lg font-medium mb-2"
                      style={{ color: 'var(--ink-200)' }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      Writing Your Module...
                    </motion.h3>
                    
                    <motion.p 
                      className="max-w-xs mx-auto text-sm"
                      style={{ color: 'var(--ink-400)' }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      The AI is carefully crafting adapted content for your cluster. 
                      This may take 30-60 seconds.
                    </motion.p>
                    
                    {/* Progress dots */}
                    <motion.div 
                      className="flex justify-center gap-2 mt-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      {[0, 0.2, 0.4].map((delay, i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full"
                          style={{ background: 'var(--setu-400)' }}
                          animate={{ 
                            scale: [1, 1.3, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{ 
                            duration: 1,
                            delay,
                            repeat: Infinity,
                          }}
                        />
                      ))}
                    </motion.div>
                  </div>
                </motion.div>
              ) : generatedModule ? (
                <motion.div 
                  className="card overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div 
                    className="card-header flex items-center justify-between"
                    style={{ 
                      background: 'linear-gradient(135deg, var(--success-50) 0%, var(--paper-100) 100%)',
                      borderBottom: '1px solid var(--success-200)'
                    }}
                  >
                    <InkText delay={0.1}>
                      <div className="flex items-center gap-3">
                        <motion.div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ background: 'var(--success-100)' }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", delay: 0.2 }}
                        >
                          <CheckCircle className="w-5 h-5" style={{ color: 'var(--success-600)' }} />
                        </motion.div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-medium" style={{ color: 'var(--ink-100)' }}>
                              {generatedModule.title}
                            </h3>
                            {generatedModule.language && generatedModule.language !== 'english' && (
                              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-setu-100 text-setu-700 flex items-center gap-1">
                                <Languages className="w-3 h-3" />
                                {languages[generatedModule.language] || generatedModule.language}
                              </span>
                            )}
                          </div>
                          <p className="text-sm" style={{ color: 'var(--ink-400)' }}>
                            Adapted for {getClusterName(generatedModule.cluster_id)}
                          </p>
                        </div>
                      </div>
                    </InkText>
                    <motion.button
                      onClick={() => navigate('/library')}
                      className="btn btn-outline btn-sm"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      View in Library
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>

                  {/* Split view with ink reveal effect */}
                  <div className="split-view p-6">
                    {/* Original Content */}
                    <motion.div 
                      className="split-panel"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <div className="split-panel-header">
                        <BookOpen className="w-4 h-4" />
                        Original Content
                      </div>
                      <div className="split-panel-body">
                        <InkText delay={0.5}>
                          <pre className="prose-content text-sm whitespace-pre-wrap">
                            {generatedModule.original_content}
                          </pre>
                        </InkText>
                      </div>
                    </motion.div>

                    {/* Adapted Content with highlight effect */}
                    <motion.div 
                      className="split-panel adapted relative"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                    >
                      {/* Glow accent */}
                      <motion.div
                        className="absolute -top-1 left-0 right-0 h-1 rounded-t"
                        style={{ background: 'var(--gradient-setu)' }}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                      />
                      <div className="split-panel-header flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Adapted Content
                        </div>
                        {generatedModule.language && generatedModule.language !== 'english' && (
                          <span className="text-xs px-2 py-0.5 bg-setu-100 text-setu-700 rounded-full">
                            {languages[generatedModule.language]?.split(' ')[0] || generatedModule.language}
                          </span>
                        )}
                      </div>
                      <div className="split-panel-body">
                        <InkText delay={0.7}>
                          <pre 
                            className={`prose-content text-sm whitespace-pre-wrap ${
                              generatedModule.language && generatedModule.language !== 'english' ? 'indic-text' : ''
                            }`}
                            lang={generatedModule.language || 'en'}
                          >
                            {generatedModule.adapted_content}
                          </pre>
                        </InkText>
                      </div>
                    </motion.div>
                  </div>

                  {/* Learning Objective with reveal */}
                  {generatedModule.learning_objective && (
                    <motion.div 
                      className="px-6 pb-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 }}
                    >
                      <div 
                        className="rounded-lg p-4"
                        style={{ 
                          background: 'linear-gradient(135deg, var(--success-50) 0%, var(--paper-50) 100%)',
                          border: '1px solid var(--success-200)'
                        }}
                      >
                        <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--success-600)' }}>
                          Learning Objective
                        </p>
                        <InkText delay={1.0}>
                          <p className="text-sm" style={{ color: 'var(--success-400)' }}>
                            {generatedModule.learning_objective}
                          </p>
                        </InkText>
                      </div>
                    </motion.div>
                  )}

                  {/* Actions */}
                  <motion.div 
                    className="card-footer flex justify-between items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                  >
                    <button
                      onClick={() => setGeneratedModule(null)}
                      className="btn btn-ghost"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Generate Another
                    </button>
                    <motion.button
                      onClick={() => navigate('/library')}
                      className="btn btn-primary"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Go to Library
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </motion.div>

                  {/* YouTube Suggestions - shown after module generation */}
                  <motion.div 
                    className="px-6 pb-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                  >
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => setShowYoutubeSuggestions(!showYoutubeSuggestions)}
                        className="flex items-center gap-2 text-sm font-medium transition-colors"
                        style={{ 
                          color: '#3b82f6',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#2563eb';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#3b82f6';
                        }}
                      >
                        <Youtube className="w-4 h-4" />
                        <span>Want some YouTube suggestions?</span>
                        <motion.div
                          animate={{ rotate: showYoutubeSuggestions ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </motion.div>
                      </button>

                      <AnimatePresence>
                        {showYoutubeSuggestions && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 space-y-2">
                              {youtubeSuggestions.map((video, index) => (
                                <motion.a
                                  key={index}
                                  href={video.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-start gap-3 p-3 rounded-lg transition-all"
                                  style={{
                                    backgroundColor: 'var(--paper-100)',
                                    border: '1px solid var(--paper-200)',
                                  }}
                                  initial={{ x: -20, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: index * 0.1 }}
                                  whileHover={{
                                    backgroundColor: 'var(--setu-50)',
                                    borderColor: 'var(--setu-300)',
                                    scale: 1.02,
                                  }}
                                >
                                  <div className="flex-shrink-0 mt-0.5">
                                    <div 
                                      className="w-8 h-8 rounded flex items-center justify-center"
                                      style={{ backgroundColor: '#ff0000' }}
                                    >
                                      <Youtube className="w-5 h-5 text-white" />
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <h4 
                                        className="text-sm font-medium leading-snug"
                                        style={{ color: 'var(--ink-100)' }}
                                      >
                                        {video.title}
                                      </h4>
                                      <ExternalLink 
                                        className="w-4 h-4 flex-shrink-0" 
                                        style={{ color: 'var(--ink-300)' }}
                                      />
                                    </div>
                                    <span 
                                      className="text-xs mt-1 inline-block px-2 py-0.5 rounded"
                                      style={{
                                        color: 'var(--setu-600)',
                                        backgroundColor: 'var(--setu-100)',
                                      }}
                                    >
                                      {video.category}
                                    </span>
                                  </div>
                                </motion.a>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </motion.div>
              ) : (
                <div className="card min-h-[500px] flex items-center justify-center bg-paper-50">
                  <div className="text-center text-ink-400">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-paper-200 flex items-center justify-center">
                      <Sparkles className="w-10 h-10" />
                    </div>
                    <h3 className="text-lg font-medium text-ink-600 mb-2">
                      Ready to Generate
                    </h3>
                    <p className="max-w-sm mx-auto">
                      Select a manual, choose a cluster, enter a topic, and click generate to create an AI-adapted module.
                    </p>
                  </div>
                </div>
              )}
            </FadeIn>
          </div>
        </div>

        {/* Next page CTA */}
        <FadeIn delay={0.3} className="mt-8 text-center">
          <button
            onClick={() => navigate('/library')}
            className="btn btn-outline group"
          >
            View Module Library
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-xs text-ink-400 mt-2">Turn to Page 4</p>
        </FadeIn>
      </div>
    </PageTransition>
  );
}
