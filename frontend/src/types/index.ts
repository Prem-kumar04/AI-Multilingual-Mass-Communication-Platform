export type UserRoleName = 'ADMIN' | 'MANAGER' | 'COMMUNICATION_TEAM';

export interface Role {
  id: string;
  name: UserRoleName;
  description?: string;
  is_system_role?: boolean;
}

export interface Permission {
  id: string;
  code: string;
  resource: string;
  action: string;
  description?: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  org_id: string;
  is_active: boolean;
  roles: Role[];
  permissions: string[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type CampaignStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'SCHEDULED'
  | 'DISTRIBUTING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED';

export interface CampaignTranslation {
  id: string;
  language_code: string;
  language_name: string;
  translated_title?: string;
  translated_body: string;
  is_verified: boolean;
}

export interface CampaignApproval {
  id: string;
  reviewer_id: string;
  reviewer_name?: string;
  decision: 'APPROVED' | 'REJECTED';
  comments?: string;
  decided_at: string;
}

export interface CampaignStatusHistory {
  id: string;
  from_status: string;
  to_status: string;
  changed_by?: string;
  reason?: string;
  created_at: string;
}

export interface Campaign {
  id: string;
  org_id: string;
  created_by: string;
  creator_name?: string;
  title: string;
  description?: string;
  objective: string;
  category: string;
  campaign_type: string;
  status: CampaignStatus;
  target_channels: string[];
  primary_language: string;
  target_languages: string[];
  raw_content?: string;
  proposed_delivery_date?: string;
  proposed_delivery_time?: string;
  recipient_count: number;
  segment_ids: string[];
  created_at: string;
  updated_at: string;
  translations: CampaignTranslation[];
  approvals: CampaignApproval[];
  status_history: CampaignStatusHistory[];
}

export interface AudienceContact {
  id: string;
  org_id: string;
  first_name: string;
  last_name?: string;
  phone_number: string;
  email?: string;
  preferred_language: string;
  location_state?: string;
  location_district?: string;
  gender?: string;
  age_group?: string;
  occupation?: string;
  is_subscribed: boolean;
  created_at: string;
  updated_at: string;
}

export interface AudienceSegment {
  id: string;
  org_id: string;
  name: string;
  description?: string;
  filter_criteria: {
    states?: string[];
    languages?: string[];
    age_groups?: string[];
    genders?: string[];
    occupations?: string[];
  };
  estimated_reach: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MessageTemplate {
  id: string;
  org_id: string;
  title: string;
  category: string;
  content: string;
  variables: string[];
  created_at: string;
  updated_at: string;
}

export interface AdminMetrics {
  total_users: number;
  admin_users: number;
  manager_users: number;
  comm_team_users: number;
  active_users: number;
  inactive_users: number;
  total_campaigns: number;
  draft_campaigns: number;
  pending_approval_campaigns: number;
  approved_campaigns: number;
  rejected_campaigns: number;
  completed_campaigns: number;
  total_audience_contacts: number;
  total_audience_segments: number;
  feedback_count?: number;
  positive_sentiment_count?: number;
  neutral_sentiment_count?: number;
  negative_sentiment_count?: number;
  delivered_count?: number;
  failed_count?: number;
}

export interface ManagerMetrics {
  my_total_campaigns: number;
  my_draft_campaigns: number;
  my_pending_campaigns: number;
  my_approved_campaigns: number;
  my_rejected_campaigns: number;
  my_scheduled_campaigns: number;
  my_completed_campaigns: number;
  total_audience_reach: number;
  total_templates_available: number;
}

export interface CommTeamMetrics {
  total_submitted_campaigns: number;
  pending_approval_campaigns: number;
  approved_awaiting_distribution: number;
  rejected_campaigns: number;
  scheduled_campaigns: number;
  distributing_campaigns: number;
  completed_campaigns: number;
  failed_distributions: number;
  total_messages_delivered: number;
  total_messages_failed: number;
}

export interface AuditLog {
  id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  user_id?: string;
  user_name?: string;
  ip_address?: string;
  payload_before?: Record<string, any>;
  payload_after?: Record<string, any>;
  timestamp: string;
}

export interface PublicTranslation {
  id: string;
  language_code: string;
  language_name: string;
  translated_title?: string;
  translated_body: string;
  is_verified: boolean;
}

export interface PublicCampaignItem {
  id: string;
  title: string;
  category: string;
  objective: string;
  description?: string;
  primary_language: string;
  target_languages: string[];
  target_channels: string[];
  recipient_count: number;
  proposed_delivery_date?: string;
  created_at: string;
  languages_available: string[];
  issuing_authority: string;
}

export interface PublicCampaignDetailData {
  id: string;
  title: string;
  category: string;
  objective: string;
  description?: string;
  raw_content?: string;
  primary_language: string;
  target_languages: string[];
  target_channels: string[];
  recipient_count: number;
  proposed_delivery_date?: string;
  proposed_delivery_time?: string;
  created_at: string;
  updated_at: string;
  status: string;
  issuing_authority: string;
  translations: PublicTranslation[];
  languages_available: string[];
}

export interface PublicFeedbackPayload {
  feedback_text: string;
  channel_type?: string;
  citizen_name?: string;
  citizen_contact?: string;
  sentiment_rating?: 'HELPFUL' | 'NEUTRAL' | 'NEEDS_IMPROVEMENT';
}

export interface PublicPortalStats {
  total_campaigns: number;
  total_reach: number;
  supported_languages: string[];
  active_channels: string[];
  verified_advisories_count: number;
}

export interface ContentVariation {
  variation_id: number;
  headline: string;
  content: string;
  call_to_action: string;
  hashtags: string[];
}

export interface ContentGenerationRequest {
  campaign_name: string;
  campaign_objective: string;
  target_audience: string;
  product_or_service_details?: string;
  campaign_type?: string;
  content_type?: string;
  preferred_tone?: string;
  additional_instructions?: string;
  content_length?: string;
  target_language?: string;
  variations_count?: number;
  campaign_id?: string;
}

export interface ContentRegenerationRequest {
  original_content_id?: string;
  campaign_name: string;
  campaign_objective: string;
  target_audience: string;
  content_type: string;
  previous_content: string;
  new_tone?: string;
  new_length?: string;
  additional_instructions?: string;
  target_language?: string;
  variations_count?: number;
  campaign_id?: string;
}

export interface ContentGenerationResponse {
  request_id: string;
  campaign_id?: string;
  campaign_name: string;
  campaign_type: string;
  content_type: string;
  tone: string;
  target_language: string;
  headline: string;
  content: string;
  call_to_action: string;
  suggested_hashtags: string[];
  variations: ContentVariation[];
  generation_status: string;
  model_used: string;
  tokens_used: number;
  created_at: string;
  metadata: Record<string, any>;
}

export interface PromptTemplateItem {
  key: string;
  name: string;
  description: string;
  default_length: string;
}

export interface AIServiceConfigStatus {
  service_initialized: boolean;
  active_provider: string;
  model_name: string;
  supported_content_types: string[];
  supported_tones: string[];
  api_key_configured: boolean;
}


