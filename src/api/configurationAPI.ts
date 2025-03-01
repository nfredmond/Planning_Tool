/**
 * Configuration API
 * 
 * This module provides API functions to interact with the backend configuration services.
 * It allows fetching and updating settings for various modules including:
 * - Accessibility and Inclusive Design
 * - Collaborative Design Tools
 * - Cross-Departmental Collaboration
 * - Data Privacy and Security
 * - Educational Components
 * - Emergency Resilience Planning
 * - Global Knowledge Exchange
 * - Implementation Tools
 * - Long-term Maintenance Planning
 */

import axios from 'axios';

// Base API URL - would come from environment in a real app
const API_URL = '/api';

// Types for API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Accessibility and Inclusive Design API
export const accessibilityAPI = {
  getSettings: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await axios.get(`${API_URL}/accessibility/settings`);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error fetching accessibility settings:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch accessibility settings'
      };
    }
  },
  
  updateSettings: async (settings: any): Promise<ApiResponse<any>> => {
    try {
      const response = await axios.post(`${API_URL}/accessibility/settings`, settings);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error updating accessibility settings:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update accessibility settings'
      };
    }
  },
  
  checkUniversalDesign: async (plan: any): Promise<ApiResponse<any>> => {
    try {
      const response = await axios.post(`${API_URL}/accessibility/check-compliance`, plan);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error checking universal design compliance:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to check universal design compliance'
      };
    }
  }
};

// Collaborative Design Tools API
export const collaborativeDesignAPI = {
  getSettings: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await axios.get(`${API_URL}/collaborative-design/settings`);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error fetching collaborative design settings:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch collaborative design settings'
      };
    }
  },
  
  updateSettings: async (settings: any): Promise<ApiResponse<any>> => {
    try {
      const response = await axios.post(`${API_URL}/collaborative-design/settings`, settings);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error updating collaborative design settings:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update collaborative design settings'
      };
    }
  },
  
  getTemplates: async (category?: string): Promise<ApiResponse<any>> => {
    try {
      const url = category 
        ? `${API_URL}/collaborative-design/templates?category=${category}`
        : `${API_URL}/collaborative-design/templates`;
      const response = await axios.get(url);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error fetching design templates:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch design templates'
      };
    }
  }
};

// Cross-departmental Collaboration API
export const crossDepartmentalAPI = {
  getSettings: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await axios.get(`${API_URL}/cross-departmental/settings`);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error fetching cross-departmental settings:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch cross-departmental settings'
      };
    }
  },
  
  updateSettings: async (settings: any): Promise<ApiResponse<any>> => {
    try {
      const response = await axios.post(`${API_URL}/cross-departmental/settings`, settings);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error updating cross-departmental settings:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update cross-departmental settings'
      };
    }
  },
  
  getDepartments: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await axios.get(`${API_URL}/cross-departmental/departments`);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error fetching departments:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch departments'
      };
    }
  }
};

// Data Privacy and Security API
export const dataPrivacyAPI = {
  getSettings: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await axios.get(`${API_URL}/data-privacy/settings`);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error fetching data privacy settings:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch data privacy settings'
      };
    }
  },
  
  updateSettings: async (settings: any): Promise<ApiResponse<any>> => {
    try {
      const response = await axios.post(`${API_URL}/data-privacy/settings`, settings);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error updating data privacy settings:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update data privacy settings'
      };
    }
  },
  
  requestDataExport: async (userId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await axios.post(`${API_URL}/data-privacy/export-request`, { userId });
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error requesting data export:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to request data export'
      };
    }
  }
};

// Educational Components API
export const educationalAPI = {
  getSettings: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await axios.get(`${API_URL}/educational/settings`);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error fetching educational settings:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch educational settings'
      };
    }
  },
  
  updateSettings: async (settings: any): Promise<ApiResponse<any>> => {
    try {
      const response = await axios.post(`${API_URL}/educational/settings`, settings);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error updating educational settings:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update educational settings'
      };
    }
  },
  
  getResources: async (category?: string): Promise<ApiResponse<any>> => {
    try {
      const url = category 
        ? `${API_URL}/educational/resources?category=${category}`
        : `${API_URL}/educational/resources`;
      const response = await axios.get(url);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error fetching educational resources:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch educational resources'
      };
    }
  }
};

// Emergency Resilience Planning API
export const emergencyResilienceAPI = {
  getSettings: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await axios.get(`${API_URL}/emergency-resilience/settings`);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error fetching emergency resilience settings:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch emergency resilience settings'
      };
    }
  },
  
  updateSettings: async (settings: any): Promise<ApiResponse<any>> => {
    try {
      const response = await axios.post(`${API_URL}/emergency-resilience/settings`, settings);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error updating emergency resilience settings:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update emergency resilience settings'
      };
    }
  },
  
  getEmergencyContacts: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await axios.get(`${API_URL}/emergency-resilience/contacts`);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error fetching emergency contacts:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch emergency contacts'
      };
    }
  }
};

// Global Knowledge Exchange API
export const globalKnowledgeAPI = {
  getSettings: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await axios.get(`${API_URL}/global-knowledge/settings`);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error fetching global knowledge settings:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch global knowledge settings'
      };
    }
  },
  
  updateSettings: async (settings: any): Promise<ApiResponse<any>> => {
    try {
      const response = await axios.post(`${API_URL}/global-knowledge/settings`, settings);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error updating global knowledge settings:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update global knowledge settings'
      };
    }
  },
  
  getFeaturedCaseStudies: async (region?: string): Promise<ApiResponse<any>> => {
    try {
      const url = region 
        ? `${API_URL}/global-knowledge/case-studies?region=${region}`
        : `${API_URL}/global-knowledge/case-studies`;
      const response = await axios.get(url);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error fetching case studies:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch case studies'
      };
    }
  }
};

// Implementation Tools API
export const implementationToolsAPI = {
  getSettings: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await axios.get(`${API_URL}/implementation-tools/settings`);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error fetching implementation tools settings:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch implementation tools settings'
      };
    }
  },
  
  updateSettings: async (settings: any): Promise<ApiResponse<any>> => {
    try {
      const response = await axios.post(`${API_URL}/implementation-tools/settings`, settings);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error updating implementation tools settings:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update implementation tools settings'
      };
    }
  },
  
  getProjectTimeline: async (projectId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await axios.get(`${API_URL}/implementation-tools/project/${projectId}/timeline`);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error fetching project timeline:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch project timeline'
      };
    }
  }
};

// Long-term Maintenance Planning API
export const maintenancePlanningAPI = {
  getSettings: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await axios.get(`${API_URL}/maintenance-planning/settings`);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error fetching maintenance planning settings:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch maintenance planning settings'
      };
    }
  },
  
  updateSettings: async (settings: any): Promise<ApiResponse<any>> => {
    try {
      const response = await axios.post(`${API_URL}/maintenance-planning/settings`, settings);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error updating maintenance planning settings:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update maintenance planning settings'
      };
    }
  },
  
  getAssetLifecycleData: async (assetId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await axios.get(`${API_URL}/maintenance-planning/asset/${assetId}/lifecycle`);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error fetching asset lifecycle data:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch asset lifecycle data'
      };
    }
  }
};

// Export a combined API object
const configurationAPI = {
  accessibility: accessibilityAPI,
  collaborativeDesign: collaborativeDesignAPI,
  crossDepartmental: crossDepartmentalAPI,
  dataPrivacy: dataPrivacyAPI,
  educational: educationalAPI,
  emergencyResilience: emergencyResilienceAPI,
  globalKnowledge: globalKnowledgeAPI,
  implementationTools: implementationToolsAPI,
  maintenancePlanning: maintenancePlanningAPI
};

export default configurationAPI; 