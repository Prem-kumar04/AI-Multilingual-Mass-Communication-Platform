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
import { getCookie, setCookie, deleteCookie } from '../utils/cookies';

export const API_BASE_URL = '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || getCookie('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const currentRefreshToken =
        localStorage.getItem('refresh_token') || getCookie('refresh_token');

      if (currentRefreshToken) {
        try {
          const res = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            { refresh_token: currentRefreshToken },
            { withCredentials: true }
          );

          const newAccessToken = res.data.access_token;
          const newRefreshToken = res.data.refresh_token;

          localStorage.setItem('token', newAccessToken);
          setCookie('access_token', newAccessToken, 24 * 3600);

          if (newRefreshToken) {
            localStorage.setItem('refresh_token', newRefreshToken);
            setCookie('refresh_token', newRefreshToken, 7 * 24 * 3600);
          }

          processQueue(null, newAccessToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return apiClient(originalRequest);
        } catch (refreshErr) {
          processQueue(refreshErr, null);
        } finally {
          isRefreshing = false;
        }
      } else {
        isRefreshing = false;
      }

      // If refresh failed or no refresh token was found, clear session
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      deleteCookie('access_token');
      deleteCookie('refresh_token');

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
  refreshToken: async (refreshToken?: string) => {
    const res = await apiClient.post('/auth/refresh', { refresh_token: refreshToken });
    return res.data;
  },
  logout: async () => {
    const res = await apiClient.post('/auth/logout');
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
  translateSingleLanguage: async (
    campaignId: string,
    language: string
  ): Promise<TranslationItemResponse> => {
    const res = await apiClient.post(`/translations/campaign/${campaignId}/translate-single`, {
      language,
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


