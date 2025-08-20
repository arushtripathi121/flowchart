import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFlowchart } from '../hooks/useFlowchart';
import PromptForm from '../components/PromptForm';
import FlowchartViewer from '../components/FlowchartViewer';
import LoadingSpinner from '../components/LoadingSpinner';

const Generator = () => {
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI Flowchart Generator
          </h1>
          <p className="text-lg text-gray-600">
            Transform your ideas into professional flowcharts instantly
          </p>
        </motion.div>

        {!flowchartData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <PromptForm onSubmit={handleGenerate} loading={loading} />

            {error && (
              <motion.div
                className="max-w-4xl mx-auto mt-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                  <span className="text-red-500 text-xl">⚠️</span>
                  <div>
                    <p className="text-red-800 font-medium">Generation Failed</p>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        <AnimatePresence>
          {loading && <LoadingSpinner />}

          {flowchartData && !loading && (
            <FlowchartViewer
              flowchartData={flowchartData}
              onClose={clearFlowchart}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Generator;
