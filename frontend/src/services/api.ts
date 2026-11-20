import axios from 'axios';
import {
  User,
  Campaign,
  AudienceContact,
  AudienceSegment,
  MessageTemplate,
  AdminMetrics,
  ManagerMetrics,
  CommTeamMetrics,
  Role,
  Permission,
  AuditLog,
  PublicCampaignItem,
  PublicCampaignDetailData,
  PublicFeedbackPayload,
  PublicPortalStats,
  ContentGenerationRequest,
  ContentRegenerationRequest,
  ContentGenerationResponse,
  PromptTemplateItem,
  AIServiceConfigStatus,
  SupportedLanguageItem,
  TranslationItemResponse,
  SentimentAnalysisResponse,
  AudienceSegmentProfile,
  PersonalizationComparisonResponse,
  ContentQualityReportResponse,
  ComplianceRuleItem,
} from '../types';

export const API_BASE_URL = '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const path = window.location.pathname;
      const isPublicPath =
        path === '/' ||
        path === '/public' ||
        path.startsWith('/campaigns') ||
        path.startsWith('/info') ||
        path === '/login';
      if (!isPublicPath) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
};

export const usersApi = {
  list: async (params?: { role?: string; search?: string; is_active?: boolean }): Promise<User[]> => {
    const res = await apiClient.get('/users', { params });
    return res.data;
  },
  create: async (data: any): Promise<User> => {
    const res = await apiClient.post('/users', data);
    return res.data;
  },
  update: async (userId: string, data: any): Promise<User> => {
    const res = await apiClient.put(`/users/${userId}`, data);
    return res.data;
  },
};

export const rolesApi = {
  listRoles: async (): Promise<Role[]> => {
    const res = await apiClient.get('/roles');
    return res.data;
  },
  listPermissions: async (): Promise<Permission[]> => {
    const res = await apiClient.get('/roles/permissions');
    return res.data;
  },
};

export const audienceApi = {
  getContacts: async (params?: { language?: string; state?: string; search?: string }): Promise<AudienceContact[]> => {
    const res = await apiClient.get('/audiences/contacts', { params });
    return res.data;
  },
  createContact: async (data: Partial<AudienceContact>): Promise<AudienceContact> => {
    const res = await apiClient.post('/audiences/contacts', data);
    return res.data;
  },
  updateContact: async (id: string, data: Partial<AudienceContact>): Promise<AudienceContact> => {
    const res = await apiClient.put(`/audiences/contacts/${id}`, data);
    return res.data;
  },
  deleteContact: async (id: string): Promise<void> => {
    await apiClient.delete(`/audiences/contacts/${id}`);
  },
  importCsv: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post('/audiences/contacts/import-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  getSegments: async (): Promise<AudienceSegment[]> => {
    const res = await apiClient.get('/audiences/segments');
    return res.data;
  },
  createSegment: async (data: { name: string; description?: string; filter_criteria: any }): Promise<AudienceSegment> => {
    const res = await apiClient.post('/audiences/segments', data);
    return res.data;
  },
};

export const templatesApi = {
  list: async (): Promise<MessageTemplate[]> => {
    const res = await apiClient.get('/templates');
    return res.data;
  },
  create: async (data: { title: string; category: string; content: string; variables?: string[] }): Promise<MessageTemplate> => {
    const res = await apiClient.post('/templates', data);
    return res.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/templates/${id}`);
  },
};

export const campaignsApi = {
  list: async (params?: { status?: string; category?: string; search?: string; limit?: number; skip?: number }): Promise<Campaign[]> => {
    const res = await apiClient.get('/campaigns', { params });
    return res.data;
  },
  getById: async (id: string): Promise<Campaign> => {
    const res = await apiClient.get(`/campaigns/${id}`);
    return res.data;
  },
  create: async (data: any): Promise<Campaign> => {
    const res = await apiClient.post('/campaigns', data);
    return res.data;
  },
  update: async (id: string, data: any): Promise<Campaign> => {
    const res = await apiClient.put(`/campaigns/${id}`, data);
    return res.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/campaigns/${id}`);
  },
  submit: async (id: string): Promise<Campaign> => {
    const res = await apiClient.post(`/campaigns/${id}/submit`);
    return res.data;
  },
  approve: async (id: string, comments?: string): Promise<Campaign> => {
    const res = await apiClient.post(`/campaigns/${id}/approve`, { comments });
    return res.data;
  },
  reject: async (id: string, reason: string): Promise<Campaign> => {
    const res = await apiClient.post(`/campaigns/${id}/reject`, { reason });
    return res.data;
  },
};

export const analyticsApi = {
  getAdmin: async (): Promise<AdminMetrics> => {
    const res = await apiClient.get('/analytics/admin');
    return res.data;
  },
  getManager: async (): Promise<ManagerMetrics> => {
    const res = await apiClient.get('/analytics/manager');
    return res.data;
  },
  getCommTeam: async (): Promise<CommTeamMetrics> => {
    const res = await apiClient.get('/analytics/commteam');
    return res.data;
  },
};

export const auditApi = {
  getLogs: async (params?: { action?: string; resource_type?: string }): Promise<AuditLog[]> => {
    const res = await apiClient.get('/audit', { params });
    return res.data;
  },
};

export const publicApi = {
  listCampaigns: async (params?: {
    category?: string;
    language?: string;
    search?: string;
    limit?: number;
  }): Promise<PublicCampaignItem[]> => {
    const res = await apiClient.get('/public/campaigns', { params });
    return res.data;
  },
  getCampaignById: async (id: string): Promise<PublicCampaignDetailData> => {
    const res = await apiClient.get(`/public/campaigns/${id}`);
    return res.data;
  },
  submitFeedback: async (
    id: string,
    data: PublicFeedbackPayload
  ): Promise<{ success: boolean; message: string; feedback_id: string; detected_sentiment: string }> => {
    const res = await apiClient.post(`/public/campaigns/${id}/feedback`, data);
    return res.data;
  },
  getStats: async (): Promise<PublicPortalStats> => {
    const res = await apiClient.get('/public/stats');
    return res.data;
  },
};

export const contentGenerationApi = {
  generate: async (data: ContentGenerationRequest): Promise<ContentGenerationResponse> => {
    const res = await apiClient.post('/content-generation/generate', data);
    return res.data;
  },
  regenerate: async (data: ContentRegenerationRequest): Promise<ContentGenerationResponse> => {
    const res = await apiClient.post('/content-generation/regenerate', data);
    return res.data;
  },
  getTemplates: async (): Promise<PromptTemplateItem[]> => {
    const res = await apiClient.get('/content-generation/templates');
    return res.data;
  },
  getConfigStatus: async (): Promise<AIServiceConfigStatus> => {
    const res = await apiClient.get('/content-generation/config-status');
    return res.data;
  },
  getHistory: async (campaignId?: string): Promise<any[]> => {
    const res = await apiClient.get('/content-generation/history', {
      params: campaignId ? { campaign_id: campaignId } : undefined,
    });
    return res.data;
  },
};

export const translationsApi = {
  getLanguages: async (): Promise<SupportedLanguageItem[]> => {
    const res = await apiClient.get('/translations/languages');
    return res.data;
  },
  translate: async (payload: {
    text: string;
    target_language: string;
    source_language?: string;
    title?: string;
    context?: string;
  }): Promise<TranslationItemResponse> => {
    const res = await apiClient.post('/translations/translate', payload);
    return res.data;
  },
  generateCampaignTranslations: async (
    campaignId: string,
    targetLanguages?: string[]
  ): Promise<TranslationItemResponse[]> => {
    const res = await apiClient.post(`/translations/campaign/${campaignId}/generate`, {
      target_languages: targetLanguages,
    });
    return res.data;
  },
  getCampaignTranslations: async (campaignId: string): Promise<TranslationItemResponse[]> => {
    const res = await apiClient.get(`/translations/campaign/${campaignId}`);
    return res.data;
  },
  reviewTranslation: async (
    translationId: string,
    payload: {
      is_verified: boolean;
      edited_title?: string;
      edited_body?: string;
      reviewer_notes?: string;
    }
  ): Promise<TranslationItemResponse> => {
    const res = await apiClient.put(`/translations/${translationId}/review`, payload);
    return res.data;
  },
};

export const optimizationApi = {
  getSegments: async (): Promise<AudienceSegmentProfile[]> => {
    const res = await apiClient.get('/optimization/segments');
    return res.data;
  },
  analyzeSentiment: async (text: string, campaignName?: string): Promise<SentimentAnalysisResponse> => {
    const res = await apiClient.post('/optimization/analyze-sentiment', {
      text,
      campaign_name: campaignName,
    });
    return res.data;
  },
  personalize: async (payload: {
    text: string;
    target_audience: string;
    title?: string;
    campaign_name?: string;
    campaign_objective?: string;
    preferred_tone?: string;
  }): Promise<PersonalizationComparisonResponse> => {
    const res = await apiClient.post('/optimization/personalize', payload);
    return res.data;
  },
  personalizeCampaign: async (
    campaignId: string,
    targetSegments: string[]
  ): Promise<PersonalizationComparisonResponse[]> => {
    const res = await apiClient.post(`/optimization/campaign/${campaignId}/personalize`, {
      target_segments: targetSegments,
    });
    return res.data;
  },
  getCampaignVariants: async (campaignId: string): Promise<any[]> => {
    const res = await apiClient.get(`/optimization/campaign/${campaignId}/variants`);
    return res.data;
  },
};

export const complianceApi = {
  getRules: async (): Promise<ComplianceRuleItem[]> => {
    const res = await apiClient.get('/compliance/rules');
    return res.data;
  },
  checkQuality: async (payload: {
    text: string;
    title?: string;
    category?: string;
    is_emergency?: boolean;
  }): Promise<ContentQualityReportResponse> => {
    const res = await apiClient.post('/compliance/check', payload);
    return res.data;
  },
  validateCampaign: async (campaignId: string): Promise<ContentQualityReportResponse> => {
    const res = await apiClient.post(`/compliance/campaign/${campaignId}/validate`);
    return res.data;
  },
  getCampaignReport: async (campaignId: string): Promise<ContentQualityReportResponse> => {
    const res = await apiClient.get(`/compliance/campaign/${campaignId}/report`);
    return res.data;
  },
};


