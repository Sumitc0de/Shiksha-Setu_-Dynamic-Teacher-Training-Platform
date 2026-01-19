/**
 * Landing Page
 * Welcome page with login option for new visitors
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Users, Globe, Award, ArrowRight, LogIn } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: BookOpen,
      title: 'AI-Powered Training',
      description: 'Generate localized training modules using advanced AI technology'
    },
    {
      icon: Globe,
      title: 'Multi-Language Support',
      description: 'Create content in multiple Indian languages including Hindi, Marathi, Bengali, and more'
    },
    {
      icon: Users,
      title: 'Collaborative Platform',
      description: 'Schools and teachers work together to create quality training materials'
    },
    {
      icon: Award,
      title: 'Quality Assurance',
      description: 'Built-in approval workflow ensures high-quality educational content'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Shiksha-Setu</h1>
              <p className="text-sm text-gray-600">शिक्षा-सेतु</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <LogIn className="w-5 h-5" />
            Login
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Dynamic Teacher Training Platform
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              AI-powered localized teacher training platform for DIET and SCERT officials across India
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white text-center"
        >
          <h3 className="text-3xl font-bold mb-8">Empowering Education Across India</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-5xl font-bold mb-2">10+</div>
              <div className="text-blue-100">Indian Languages</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">AI</div>
              <div className="text-blue-100">Powered Generation</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Available Platform</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <span className="text-gray-600">Shiksha-Setu | शिक्षा-सेतु</span>
            </div>
            <div className="text-gray-500 text-sm">
              Dynamic Teacher Training Platform for India
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
