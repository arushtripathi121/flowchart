import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFlowchart } from '../hooks/useFlowchart';
import { useAuth } from '../context/AuthContext';
import PromptForm from '../components/PromptForm';
import DiagramCanvas from '../components/DiagramCanvas'; // Updated import name
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
  FiTrendingUp,
  FiShield,
  FiUser
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

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
// Google Login Component
// ------------------------------------
const GoogleLoginPrompt = ({ onLogin }) => (
  <motion.div
    className="text-center mb-16 max-w-4xl mx-auto"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
  >
    <motion.div
      className="flex justify-center mb-8"
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-blue-500 to-green-500 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
        <div className="relative p-6 bg-white rounded-3xl shadow-2xl border border-gray-100">
          <FiShield className="w-16 h-16 text-gray-700" />
        </div>
      </div>
    </motion.div>

    <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-600 via-red-500 to-green-600 bg-clip-text text-transparent mb-6 leading-tight">
      Secure Access Required
    </h1>

    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
      To ensure the security of your flowcharts and provide personalized features, please sign in with your Google account.
      <span className="block mt-2 text-lg text-gray-500">✨ Your data is encrypted and never shared with third parties</span>
    </p>

    <motion.div
      className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/20 max-w-md mx-auto mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
    >
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-center space-x-2">
        <FiUser className="text-indigo-600" />
        <span>Why Sign In?</span>
      </h3>

      <ul className="text-left space-y-3 text-gray-600 mb-6">
        <li className="flex items-start space-x-2">
          <span className="text-green-500 mt-1">✓</span>
          <span>Save and manage your flowcharts across devices</span>
        </li>
        <li className="flex items-start space-x-2">
          <span className="text-green-500 mt-1">✓</span>
          <span>Access premium AI features and templates</span>
        </li>
        <li className="flex items-start space-x-2">
          <span className="text-green-500 mt-1">✓</span>
          <span>Share and collaborate with team members</span>
        </li>
        <li className="flex items-start space-x-2">
          <span className="text-green-500 mt-1">✓</span>
          <span>Export to multiple formats (PNG, SVG, PDF)</span>
        </li>
      </ul>

      <motion.button
        onClick={onLogin}
        className="group w-full px-6 py-4 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center space-x-3"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <FcGoogle className="w-6 h-6" />
        <span>Continue with Google</span>
        <motion.div
          animate={{ x: [0, 3, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <HiSparkles className="w-5 h-5 text-yellow-500" />
        </motion.div>
      </motion.button>

      <p className="text-xs text-gray-500 mt-4 leading-relaxed">
        By signing in, you agree to our Terms of Service and Privacy Policy.
        We use industry-standard encryption to protect your data.
      </p>
    </motion.div>

    <motion.div
      className="flex flex-wrap justify-center gap-6 text-sm text-gray-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.8 }}
    >
      <div className="flex items-center space-x-2">
        <FiShield className="w-4 h-4 text-green-500" />
        <span>Bank-level Security</span>
      </div>
      <div className="flex items-center space-x-2">
        <HiSparkles className="w-4 h-4 text-purple-500" />
        <span>One-click Sign In</span>
      </div>
      <div className="flex items-center space-x-2">
        <FiZap className="w-4 h-4 text-yellow-500" />
        <span>Instant Access</span>
      </div>
    </motion.div>
  </motion.div>
);

// ------------------------------------
// Hero Section Component (for logged in users)
// ------------------------------------
const HeroSection = ({ onGetStarted, user }) => (
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

    {/* Welcome message for logged in user */}
    {user && (
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <img
            src={user.picture || user.image}
            alt="User"
            className="w-12 h-12 rounded-full border-3 border-white shadow-lg"
          />
          <div className="text-left">
            <p className="text-lg font-semibold text-gray-800">Welcome back, {user.name?.split(' ')[0]}! 👋</p>
            <p className="text-sm text-gray-600">Ready to create something amazing?</p>
          </div>
        </div>
      </motion.div>
    )}

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
        <span>Start Creating</span>
        <FiZap className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
      </button>

      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <HiSparkles className="w-4 h-4" />
        <span>Unlimited flowcharts • Export ready</span>
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
  const { user, login } = useAuth(); // Get user and login from auth context
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
    console.log('Retrying generation...');
  };

  const handleGoogleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <AnimatePresence mode="wait">
        {/* Authentication Required State */}
        {!user && (
          <motion.div
            key="auth-required"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen py-12 px-6"
          >
            <div className="max-w-6xl mx-auto">
              <GoogleLoginPrompt onLogin={handleGoogleLogin} />
            </div>
          </motion.div>
        )}

        {/* Landing State (for authenticated users) */}
        {user && !showForm && !flowchartData && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen py-12 px-6"
          >
            <div className="max-w-6xl mx-auto">
              <HeroSection onGetStarted={handleGetStarted} user={user} />
              <FeaturesSection />
            </div>
          </motion.div>
        )}

        {/* Form State */}
        {user && showForm && !flowchartData && (
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
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <img
                    src={user.picture || user.image}
                    alt="User"
                    className="w-10 h-10 rounded-full border-2 border-indigo-200"
                  />
                  <span className="text-sm text-gray-600">Creating as {user.name}</span>
                </div>

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

        {/* Flowchart State - FIXED */}
        {flowchartData && !loading && (
          <motion.div
            key="flowchart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0"
          >
            <DiagramCanvas
              generatedData={flowchartData} // Changed from flowchartData to generatedData
              onClose={clearFlowchart}
              className="w-full h-full"
              initialDiagramType={flowchartData?.metadata?.diagramType || 'flowchart'}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Generator;
