from pydantic import BaseModel


class DashboardStatsAdmin(BaseModel):
    total_users: int
    admin_users: int
    manager_users: int
    comm_team_users: int
    active_users: int
    inactive_users: int
    total_campaigns: int
    draft_campaigns: int
    pending_approval_campaigns: int
    approved_campaigns: int
    rejected_campaigns: int
    completed_campaigns: int
    total_audience_contacts: int
    total_audience_segments: int
    feedback_count: int = 0
    positive_sentiment_count: int = 0
    neutral_sentiment_count: int = 0
    negative_sentiment_count: int = 0
    delivered_count: int = 0
    failed_count: int = 0


class DashboardStatsManager(BaseModel):
    my_total_campaigns: int
    my_draft_campaigns: int
    my_pending_campaigns: int
    my_approved_campaigns: int
    my_rejected_campaigns: int
    my_scheduled_campaigns: int
    my_completed_campaigns: int
    total_audience_reach: int
    total_templates_available: int


class DashboardStatsCommTeam(BaseModel):
    total_submitted_campaigns: int
    pending_approval_campaigns: int
    approved_awaiting_distribution: int
    rejected_campaigns: int
    scheduled_campaigns: int
    distributing_campaigns: int
    completed_campaigns: int
    failed_distributions: int
    total_messages_delivered: int
    total_messages_failed: int

