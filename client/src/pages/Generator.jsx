// components/Generator.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFlowchart } from '../hooks/useFlowchart';
import PromptForm from '../components/PromptForm';
import FlowchartViewer from '../components/FlowchartViewer';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  HiX,
  HiLightningBolt,
  HiSparkles
} from 'react-icons/hi';
import {
  FiZap,
  FiTarget,
  FiGrid,
  FiTrendingUp
} from 'react-icons/fi';

// ------------------------------------
// Feature Cards Component
// ------------------------------------
const FeatureCard = ({ icon: Icon, title, description, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
  >
    <div className="flex items-center space-x-3 mb-3">
      <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </motion.div>
);

// ------------------------------------
// Hero Section Component
// ------------------------------------
const HeroSection = ({ onGetStarted }) => (
  <motion.div
    className="text-center mb-16"
    initial={{ opacity: 0, y: -30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay: 0.2 }}
  >
    <motion.div
      className="flex justify-center mb-8"
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.8, delay: 0.4 }}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
        <div className="relative p-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl shadow-2xl">
          <FiZap className="w-16 h-16 text-white" />
        </div>
      </div>
    </motion.div>

    <h1 className="text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 leading-tight">
      AI Flowchart Generator
    </h1>

    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
      Transform your ideas into stunning, professional flowcharts with the power of artificial intelligence.
      Create complex diagrams in seconds, not hours.
    </p>

    <motion.div
      className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
    >
      <button
        onClick={onGetStarted}
        className="group px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex items-center space-x-2"
      >
        <span>Get Started</span>
        <FiZap className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
      </button>

      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <HiSparkles className="w-4 h-4" />
        <span>No signup required • Instant results</span>
      </div>
    </motion.div>
  </motion.div>
);

// ------------------------------------
// Features Section Component
// ------------------------------------
const FeaturesSection = () => {
  const features = [
    {
      icon: FiTarget,
      title: "Smart AI Generation",
      description: "Advanced AI understands your requirements and creates professional flowcharts instantly from simple text descriptions."
    },
    {
      icon: FiGrid,
      title: "Multiple Layouts",
      description: "Choose from vertical, horizontal, and custom layout options that automatically optimize for readability and flow."
    },
    {
      icon: FiTrendingUp,
      title: "Export & Share",
      description: "Export your flowcharts as PNG, SVG, or JSON. Share with your team or embed in presentations effortlessly."
    }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6 mb-12">
      {features.map((feature, index) => (
        <FeatureCard
          key={index}
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
          delay={0.6 + (index * 0.2)}
        />
      ))}
    </div>
  );
};

// ------------------------------------
// Error Display Component
// ------------------------------------
const ErrorDisplay = ({ error, onRetry }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="max-w-2xl mx-auto mt-8"
  >
    <div className="bg-red-50/80 backdrop-blur-xl border border-red-200 rounded-2xl p-6 flex items-start space-x-4">
      <div className="p-2 bg-red-100 rounded-xl flex-shrink-0">
        <HiX className="w-5 h-5 text-red-500" />
      </div>
      <div className="flex-1">
        <p className="text-red-800 font-semibold mb-2">Generation Failed</p>
        <p className="text-red-600 mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  </motion.div>
);

// ------------------------------------
// Main Generator Component
// ------------------------------------
const Generator = () => {
  const [showForm, setShowForm] = useState(false);
  const {
    flowchartData,
    loading,
    error,
    generateFlowchart,
    clearFlowchart
  } = useFlowchart();

  const handleGenerate = async (prompt, style, complexity) => {
    try {
      await generateFlowchart(prompt, style, complexity);
    } catch (err) {
      console.error('Generation failed:', err);
    }
  };

  const handleGetStarted = () => {
    setShowForm(true);
  };

  const handleBack = () => {
    setShowForm(false);
    clearFlowchart();
  };

  const handleRetry = () => {
    // You could implement retry logic here
    console.log('Retrying generation...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <AnimatePresence mode="wait">
        {/* Landing State */}
        {!showForm && !flowchartData && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen py-12 px-6"
          >
            <div className="max-w-6xl mx-auto">
              <HeroSection onGetStarted={handleGetStarted} />
              <FeaturesSection />
            </div>
          </motion.div>
        )}

        {/* Form State */}
        {showForm && !flowchartData && (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen py-12 px-6"
          >
            <div className="max-w-4xl mx-auto">
              {/* Back Button */}
              <motion.button
                onClick={handleBack}
                className="mb-8 flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span>← Back to Home</span>
              </motion.button>

              {/* Form Header */}
              <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Create Your Flowchart
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Describe your process or workflow, and watch as AI transforms your words into a professional diagram.
                </p>
              </motion.div>

              <PromptForm onSubmit={handleGenerate} loading={loading} />

              {error && (
                <ErrorDisplay error={error} onRetry={handleRetry} />
              )}
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <LoadingSpinner />
          </motion.div>
        )}

        {/* Flowchart State */}
        {flowchartData && !loading && (
          <motion.div
            key="flowchart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0"
          >
            <FlowchartViewer
              flowchartData={flowchartData}
              onClose={clearFlowchart}
              showToolbar={true}
              showStats={true}
              showCloseButton={true}
              allowFullscreen={true}
              initialLayout="TB"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Generator;
