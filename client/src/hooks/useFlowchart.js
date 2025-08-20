import { useState, useCallback } from 'react';
import { flowchartAPI } from '../services/api';

export const useFlowchart = () => {
  const [flowchartData, setFlowchartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const generateFlowchart = useCallback(async (prompt, style, complexity) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await flowchartAPI.generateFlowchart(prompt, style, complexity);
      const newFlowchart = {
        ...response,
        id: Date.now(),
        prompt,
        timestamp: new Date().toISOString()
      };
      
      setFlowchartData(newFlowchart);
      setHistory(prev => [newFlowchart, ...prev.slice(0, 9)]);
      return newFlowchart;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearFlowchart = useCallback(() => {
    setFlowchartData(null);
    setError(null);
  }, []);

  const loadFromHistory = useCallback((flowchart) => {
    setFlowchartData(flowchart);
    setError(null);
  }, []);

  return {
    flowchartData,
    loading,
    error,
    history,
    generateFlowchart,
    clearFlowchart,
    loadFromHistory
  };
};
