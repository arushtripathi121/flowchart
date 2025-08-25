// services/api.js
import axios from "axios";
import { useAuth } from '../context/AuthContext';

// Base URL from Vite env (e.g., http://localhost:4000/api)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
  withCredentials: true, // send cookies for auth sessions
});

// Request logging
api.interceptors.request.use((config) => {
  const method = (config.method || 'GET').toUpperCase();
  const url = config.baseURL ? `${config.baseURL}${config.url}` : config.url;
  // Safe compact log to avoid leaking large payloads in console
  console.log(`[API] ${method} ${url}`);
  return config;
});

// Response/error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'Request failed';
    console.error(`[API ERROR] ${status || ''} ${message}`);
    return Promise.reject(error);
  }
);

// ===================== AUTH API =====================
export const googleAuth = async (code) => {
  try {
    const response = await api.get(`/auth/google`, { params: { code } });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to authenticate with Google");
  }
};

export const refreshAuth = async () => {
  try {
    const response = await api.get("/auth/verify");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to refresh authentication");
  }
};

export const logout = async () => {
  try {
    const response = await api.post("/auth/logout");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to logout");
  }
};

// ===================== FLOWCHART API =====================
export const flowchartAPI = {
  generateFlowchart: async (prompt, style = "modern", complexity = "medium") => {
    try {
      const response = await api.post("/flowchart/generate", {
        prompt,
        style,
        complexity,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to generate flowchart");
    }
  },

  validateFlowchart: async (flowchartData) => {
    try {
      const response = await api.post("/flowchart/validate", { flowchartData });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to validate flowchart");
    }
  },

  getFormats: async () => {
    try {
      const response = await api.get("/flowchart/formats");
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to get formats");
    }
  },
};

// ===================== DIAGRAM API (Standalone) =====================
// These functions are user-agnostic. The hook below adds user context.
export const diagramAPIFunctions = {
  // Create a new diagram
  saveDiagram: async (diagramData) => {
    try {
      const response = await api.post("/diagrams", diagramData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to save diagram");
    }
  },

  // Fetch diagrams (optionally filtered by userId)
  getDiagrams: async (userId = null) => {
    try {
      const params = userId ? { userId } : {};
      const response = await api.get("/diagrams", { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch diagrams");
    }
  },

  // Fetch a diagram by id (optionally with userId)
  getDiagramById: async (diagramId, userId = null) => {
    try {
      const params = userId ? { userId } : {};
      const response = await api.get(`/diagrams/${diagramId}`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch diagram");
    }
  },

  // Update a diagram by id
  updateDiagram: async (diagramId, diagramData) => {
    try {
      const response = await api.put(`/diagrams/${diagramId}`, diagramData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to update diagram");
    }
  },

  // Delete a diagram by id (optionally with userId in body)
  deleteDiagram: async (diagramId, userId = null) => {
    try {
      const data = userId ? { userId } : {};
      const response = await api.delete(`/diagrams/${diagramId}`, { data });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to delete diagram");
    }
  },
};

// ===================== DIAGRAM API HOOK (With User Context) =====================
// This hook mirrors methods expected by DiagramCanvas.jsx:
// - getUserDiagrams()
// - getDiagramById(id)
// - saveDiagramFromCanvas(title, type, nodes, edges, layout, metadata)
// - updateDiagramFromCanvas(id, title, type, nodes, edges, layout, metadata)
// It also exposes basic saveDiagram/updateDiagram if needed elsewhere.
export const useDiagramAPI = () => {
  const { user } = useAuth();

  return {
    // Basic diagram ops with user context
    saveDiagram: async (diagramData) => {
      const payload = {
        ...diagramData,
        owner: user,
        userEmail: user?.email,
      };
      return diagramAPIFunctions.saveDiagram(payload);
    },

    getUserDiagrams: async () => {
      return diagramAPIFunctions.getDiagrams(user?.id);
    },

    getDiagramById: async (diagramId) => {
      return diagramAPIFunctions.getDiagramById(diagramId, user?.id);
    },

    updateDiagram: async (diagramId, diagramData) => {
      const payload = {
        ...diagramData,
        owner: user?.id,
        userEmail: user?.email,
      };
      return diagramAPIFunctions.updateDiagram(diagramId, payload);
    },

    deleteDiagram: async (diagramId) => {
      return diagramAPIFunctions.deleteDiagram(diagramId, user?.id);
    },

    // React Flow oriented helpers used by DiagramCanvas.jsx
    saveDiagramFromCanvas: async (title, diagramType, nodes, edges, layout, metadata = {}) => {
      const payload = {
        title,
        diagramType,
        layout,
        nodes,
        edges,
        owner: user?.id,
        userEmail: user?.email,
        metadata: {
          nodeCount: nodes?.length || 0,
          edgeCount: edges?.length || 0,
          ...metadata,
        },
      };
      return diagramAPIFunctions.saveDiagram(payload);
    },

    updateDiagramFromCanvas: async (diagramId, title, diagramType, nodes, edges, layout, metadata = {}) => {
      const payload = {
        title,
        diagramType,
        layout,
        nodes,
        edges,
        owner: user?.id,
        userEmail: user?.email,
        metadata: {
          nodeCount: nodes?.length || 0,
          edgeCount: edges?.length || 0,
          ...metadata,
        },
      };
      return diagramAPIFunctions.updateDiagram(diagramId, payload);
    },
  };
};


export default api;
