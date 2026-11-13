from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User, Role
from app.models.campaign import Campaign, MessageTemplate
from app.models.audience import AudienceContact, AudienceSegment
from app.models.analytics import Feedback, SentimentAnalysisResult
from app.models.distribution import MessageDelivery, DistributionJob
from app.schemas.analytics import (
    DashboardStatsAdmin,
    DashboardStatsManager,
    DashboardStatsCommTeam,
)
from app.core.permissions import (
    require_admin,
    require_manager,
    require_communication_team,
)

router = APIRouter()


@router.get("/admin", response_model=DashboardStatsAdmin)
def get_admin_dashboard_metrics(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    """Aggregate platform-wide administrative statistics."""
    org_id = admin_user.org_id

    total_users = db.query(User).filter(User.org_id == org_id).count()
    active_users = db.query(User).filter(User.org_id == org_id, User.is_active == True).count()
    inactive_users = total_users - active_users

    admin_count = db.query(User).join(User.roles).filter(User.org_id == org_id, Role.name == "ADMIN").count()
    manager_count = db.query(User).join(User.roles).filter(User.org_id == org_id, Role.name == "MANAGER").count()
    comm_count = db.query(User).join(User.roles).filter(User.org_id == org_id, Role.name == "COMMUNICATION_TEAM").count()

    total_campaigns = db.query(Campaign).filter(Campaign.org_id == org_id).count()
    draft_c = db.query(Campaign).filter(Campaign.org_id == org_id, Campaign.status == "DRAFT").count()
    pending_c = db.query(Campaign).filter(Campaign.org_id == org_id, Campaign.status == "PENDING_APPROVAL").count()
    approved_c = db.query(Campaign).filter(Campaign.org_id == org_id, Campaign.status == "APPROVED").count()
    rejected_c = db.query(Campaign).filter(Campaign.org_id == org_id, Campaign.status == "REJECTED").count()
    completed_c = db.query(Campaign).filter(Campaign.org_id == org_id, Campaign.status == "COMPLETED").count()

    total_contacts = db.query(AudienceContact).filter(AudienceContact.org_id == org_id).count()
    total_segments = db.query(AudienceSegment).filter(AudienceSegment.org_id == org_id).count()

    feedback_count = db.query(Feedback).join(Campaign).filter(Campaign.org_id == org_id).count()
    pos_count = (
        db.query(SentimentAnalysisResult)
        .join(Feedback)
        .join(Campaign)
        .filter(Campaign.org_id == org_id, SentimentAnalysisResult.sentiment == "POSITIVE")
        .count()
    )
    neu_count = (
        db.query(SentimentAnalysisResult)
        .join(Feedback)
        .join(Campaign)
        .filter(Campaign.org_id == org_id, SentimentAnalysisResult.sentiment == "NEUTRAL")
        .count()
    )
    neg_count = (
        db.query(SentimentAnalysisResult)
        .join(Feedback)
        .join(Campaign)
        .filter(Campaign.org_id == org_id, SentimentAnalysisResult.sentiment == "NEGATIVE")
        .count()
    )

    delivered_count = (
        db.query(MessageDelivery)
        .join(DistributionJob)
        .join(Campaign)
        .filter(Campaign.org_id == org_id, MessageDelivery.status == "DELIVERED")
        .count()
    )
    failed_count = (
        db.query(MessageDelivery)
        .join(DistributionJob)
        .join(Campaign)
        .filter(Campaign.org_id == org_id, MessageDelivery.status == "FAILED")
        .count()
    )

    return DashboardStatsAdmin(
        total_users=total_users,
        admin_users=admin_count,
        manager_users=manager_count,
        comm_team_users=comm_count,
        active_users=active_users,
        inactive_users=inactive_users,
        total_campaigns=total_campaigns,
        draft_campaigns=draft_c,
        pending_approval_campaigns=pending_c,
        approved_campaigns=approved_c,
        rejected_campaigns=rejected_c,
        completed_campaigns=completed_c,
        total_audience_contacts=total_contacts,
        total_audience_segments=total_segments,
        feedback_count=feedback_count,
        positive_sentiment_count=pos_count,
        neutral_sentiment_count=neu_count,
        negative_sentiment_count=neg_count,
        delivered_count=delivered_count,
        failed_count=failed_count,
    )


@router.get("/manager", response_model=DashboardStatsManager)
def get_manager_dashboard_metrics(
    db: Session = Depends(get_db),
    manager_user: User = Depends(require_manager),
):
    """Aggregate campaign performance metrics authored by the current Manager."""
    org_id = manager_user.org_id
    user_id = manager_user.id

    my_c = db.query(Campaign).filter(Campaign.org_id == org_id, Campaign.created_by == user_id)
    total_c = my_c.count()
    draft_c = my_c.filter(Campaign.status == "DRAFT").count()
    pending_c = my_c.filter(Campaign.status == "PENDING_APPROVAL").count()
    approved_c = my_c.filter(Campaign.status == "APPROVED").count()
    rejected_c = my_c.filter(Campaign.status == "REJECTED").count()
    scheduled_c = my_c.filter(Campaign.status == "SCHEDULED").count()
    completed_c = my_c.filter(Campaign.status == "COMPLETED").count()

    total_reach = db.query(AudienceContact).filter(AudienceContact.org_id == org_id, AudienceContact.is_subscribed == True).count()
    templates_count = db.query(MessageTemplate).filter(MessageTemplate.org_id == org_id).count()

    return DashboardStatsManager(
        my_total_campaigns=total_c,
        my_draft_campaigns=draft_c,
        my_pending_campaigns=pending_c,
        my_approved_campaigns=approved_c,
        my_rejected_campaigns=rejected_c,
        my_scheduled_campaigns=scheduled_c,
        my_completed_campaigns=completed_c,
        total_audience_reach=total_reach,
        total_templates_available=templates_count,
    )


@router.get("/commteam", response_model=DashboardStatsCommTeam)
def get_comm_team_dashboard_metrics(
    db: Session = Depends(get_db),
    comm_user: User = Depends(require_communication_team),
):
    """Aggregate review, approval, and distribution workload metrics for the Communication Team."""
    org_id = comm_user.org_id

    total_submitted = db.query(Campaign).filter(Campaign.org_id == org_id, Campaign.status != "DRAFT").count()
    pending_approval = db.query(Campaign).filter(Campaign.org_id == org_id, Campaign.status == "PENDING_APPROVAL").count()
    approved_awaiting = db.query(Campaign).filter(Campaign.org_id == org_id, Campaign.status == "APPROVED").count()
    rejected_c = db.query(Campaign).filter(Campaign.org_id == org_id, Campaign.status == "REJECTED").count()
    scheduled_c = db.query(Campaign).filter(Campaign.org_id == org_id, Campaign.status == "SCHEDULED").count()
    distributing_c = db.query(Campaign).filter(Campaign.org_id == org_id, Campaign.status == "DISTRIBUTING").count()
    completed_c = db.query(Campaign).filter(Campaign.org_id == org_id, Campaign.status == "COMPLETED").count()
    failed_c = db.query(Campaign).filter(Campaign.org_id == org_id, Campaign.status == "FAILED").count()

    return DashboardStatsCommTeam(
        total_submitted_campaigns=total_submitted,
        pending_approval_campaigns=pending_approval,
        approved_awaiting_distribution=approved_awaiting,
        rejected_campaigns=rejected_c,
        scheduled_campaigns=scheduled_c,
        distributing_campaigns=distributing_c,
        completed_campaigns=completed_c,
        failed_distributions=failed_c,
        total_messages_delivered=0,
        total_messages_failed=0,
    )

