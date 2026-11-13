import logging
from sqlalchemy.orm import Session

from app.database.session import Base, engine, SessionLocal
from app.core.security import get_password_hash

# ── Import ALL models so SQLAlchemy registers them with Base.metadata ──────────
from app.models.user import Organization, User, Role, Permission          # noqa: F401
from app.models.audience import AudienceContact, AudienceSegment          # noqa: F401
from app.models.campaign import (                                          # noqa: F401
    Campaign, CampaignVersion, CampaignApproval,
    CampaignStatusHistory, MessageTemplate,
)
from app.models.content import GeneratedContent, CampaignTranslation      # noqa: F401
from app.models.distribution import (                                      # noqa: F401
    CommunicationChannel, DistributionJob, MessageDelivery, DeliveryAttempt,
)
from app.models.analytics import EngagementEvent, Feedback, SentimentAnalysisResult  # noqa: F401
from app.models.audit import AuditLog                                      # noqa: F401
# ──────────────────────────────────────────────────────────────────────────────

from app.crud.crud_audience import evaluate_segment_criteria

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init_db(db: Session) -> None:
    # 1. Create all tables
    Base.metadata.create_all(bind=engine)

    # 2. Seed Organization
    org = db.query(Organization).filter(Organization.code == "GOV_DPIC").first()
    if not org:
        org = Organization(
            name="Department of Public Information & Communication (Govt of India)",
            code="GOV_DPIC",
            domain="commplatform.gov.in",
            is_active=True,
        )
        db.add(org)
        db.flush()
        logger.info(f"Created default organization: {org.name}")

    # 3. Seed Permissions
    permissions_data = [
        # User management
        ("users:create", "USER", "create", "Create new platform users"),
        ("users:read", "USER", "read", "View platform user details"),
        ("users:update", "USER", "update", "Update user accounts"),
        ("users:deactivate", "USER", "deactivate", "Activate or deactivate users"),
        # Roles & Permissions
        ("roles:manage", "ROLE", "manage", "Manage system roles and capability mappings"),
        # Campaigns
        ("campaigns:create", "CAMPAIGN", "create", "Create draft campaigns"),
        ("campaigns:read", "CAMPAIGN", "read", "View campaign details"),
        ("campaigns:update", "CAMPAIGN", "update", "Update own draft campaigns"),
        ("campaigns:delete", "CAMPAIGN", "delete", "Delete own draft campaigns"),
        ("campaigns:submit", "CAMPAIGN", "submit", "Submit campaigns for approval"),
        ("campaigns:approve", "CAMPAIGN", "approve", "Approve pending campaigns"),
        ("campaigns:reject", "CAMPAIGN", "reject", "Reject campaigns with feedback"),
        ("campaigns:distribute", "CAMPAIGN", "distribute", "Initiate multi-channel campaign dispatch"),
        # Audiences
        ("audiences:manage", "AUDIENCE", "manage", "Add contacts, import CSV, create segments"),
        ("audiences:read", "AUDIENCE", "read", "View audience contacts and segments"),
        # AI & Translation
        ("ai:generate", "AI", "generate", "Generate AI-assisted communication content"),
        ("translations:manage", "TRANSLATION", "manage", "Generate and edit multilingual translations"),
        ("translations:review", "TRANSLATION", "review", "Verify multilingual translations"),
        # Templates
        ("templates:manage", "TEMPLATE", "manage", "Create and edit message templates"),
        # Analytics & Audit
        ("analytics:platform_wide", "ANALYTICS", "platform_wide", "View platform-wide analytics"),
        ("analytics:own_campaigns", "ANALYTICS", "own_campaigns", "View author-level analytics"),
        ("analytics:distribution", "ANALYTICS", "distribution", "View delivery and engagement metrics"),
        ("audit:read", "AUDIT", "read", "View security audit logs"),
        ("settings:manage", "SETTINGS", "manage", "Configure system integrations and settings"),
    ]

    permission_map = {}
    for code, resource, action, desc in permissions_data:
        p = db.query(Permission).filter(Permission.code == code).first()
        if not p:
            p = Permission(code=code, resource=resource, action=action, description=desc)
            db.add(p)
            db.flush()
        permission_map[code] = p

    # 4. Seed Roles
    # Role 1: ADMIN
    admin_role = db.query(Role).filter(Role.name == "ADMIN").first()
    if not admin_role:
        admin_role = Role(
            name="ADMIN",
            description="Platform Administrator with total governance, user management, and security oversight",
            is_system_role=True,
        )
        db.add(admin_role)
        db.flush()

    # Admin receives administrative oversight permissions
    admin_perms = [
        "users:create", "users:read", "users:update", "users:deactivate",
        "roles:manage", "audiences:manage", "audiences:read", "templates:manage",
        "campaigns:read", "analytics:platform_wide", "audit:read", "settings:manage",
    ]
    admin_role.permissions = [permission_map[code] for code in admin_perms if code in permission_map]

    # Role 2: MANAGER
    manager_role = db.query(Role).filter(Role.name == "MANAGER").first()
    if not manager_role:
        manager_role = Role(
            name="MANAGER",
            description="Campaign Creator responsible for campaign preparation, AI authoring, translations, and audience segmentation",
            is_system_role=True,
        )
        db.add(manager_role)
        db.flush()

    manager_perms = [
        "campaigns:create", "campaigns:read", "campaigns:update", "campaigns:delete", "campaigns:submit",
        "audiences:manage", "audiences:read", "templates:manage", "ai:generate",
        "translations:manage", "analytics:own_campaigns",
    ]
    manager_role.permissions = [permission_map[code] for code in manager_perms if code in permission_map]

    # Role 3: COMMUNICATION_TEAM
    comm_role = db.query(Role).filter(Role.name == "COMMUNICATION_TEAM").first()
    if not comm_role:
        comm_role = Role(
            name="COMMUNICATION_TEAM",
            description="Verification & Distribution Authority responsible for campaign approvals, rejections, and multi-channel dispatch",
            is_system_role=True,
        )
        db.add(comm_role)
        db.flush()

    comm_perms = [
        "campaigns:read", "campaigns:approve", "campaigns:reject", "campaigns:distribute",
        "translations:review", "audiences:read", "analytics:distribution",
    ]
    comm_role.permissions = [permission_map[code] for code in comm_perms if code in permission_map]

    db.flush()

    # 5. Seed Users
    seed_users = [
        ("admin@commplatform.gov.in", "Admin@12345", "Dr. Rajesh Kumar (Admin)", [admin_role]),
        ("manager@commplatform.gov.in", "Manager@12345", "Priya Sharma (Campaign Manager)", [manager_role]),
        ("commteam@commplatform.gov.in", "CommTeam@12345", "Vikramaditya Verma (Comm Officer)", [comm_role]),
    ]

    for email, pwd, full_name, roles in seed_users:
        u = db.query(User).filter(User.email == email).first()
        if not u:
            u = User(
                org_id=org.id,
                email=email,
                hashed_password=get_password_hash(pwd),
                full_name=full_name,
                is_active=True,
            )
            u.roles = roles
            db.add(u)
            logger.info(f"Created seed user: {email}")

    # 6. Seed Communication Channels
    channels_data = [
        ("WHATSAPP", "Meta WhatsApp Cloud API Gateway", 80),
        ("SMS", "Telecom DLT National SMS Gateway", 150),
        ("EMAIL", "NIC Gov Transmit SMTP Cluster", 100),
        ("PUSH", "National Alert Mobile Push Gateway", 200),
        ("WEB_BROADCAST", "Public Portal Broadcast Feed", 500),
    ]
    for c_type, p_name, r_limit in channels_data:
        chan = db.query(CommunicationChannel).filter(CommunicationChannel.channel_type == c_type).first()
        if not chan:
            chan = CommunicationChannel(
                channel_type=c_type,
                provider_name=p_name,
                rate_limit_per_second=r_limit,
                is_active=True,
                credentials_encrypted={"status": "Configured for staging/production adapter"},
            )
            db.add(chan)

    # 7. Seed Sample Audience Contacts
    contacts_seed = [
        ("Aarav", "Reddy", "+919876500001", "aarav.reddy@example.in", "Telugu", "Telangana", "Hyderabad", "Male", "26-40", "Software Engineer"),
        ("Sravani", "Rao", "+919876500002", "sravani.rao@example.in", "Telugu", "Andhra Pradesh", "Visakhapatnam", "Female", "18-25", "Student"),
        ("Amit", "Patel", "+919876500003", "amit.patel@example.in", "Hindi", "Delhi", "New Delhi", "Male", "41-60", "Civil Servant"),
        ("Sunita", "Devi", "+919876500004", "sunita.devi@example.in", "Hindi", "Uttar Pradesh", "Varanasi", "Female", "60+", "Homemaker"),
        ("Kavitha", "Sundaram", "+919876500005", "kavitha.sundaram@example.in", "Tamil", "Tamil Nadu", "Chennai", "Female", "26-40", "Doctor"),
        ("Manoj", "Hegde", "+919876500006", "manoj.hegde@example.in", "Kannada", "Karnataka", "Bengaluru", "Male", "26-40", "Banker"),
        ("Ananya", "Banerjee", "+919876500007", "ananya.b@example.in", "Bengali", "West Bengal", "Kolkata", "Female", "18-25", "Researcher"),
        ("Sachin", "Kulkarni", "+919876500008", "sachin.kulkarni@example.in", "Marathi", "Maharashtra", "Pune", "Male", "41-60", "Business Owner"),
        ("Rahul", "Nambiar", "+919876500009", "rahul.nambiar@example.in", "Malayalam", "Kerala", "Thiruvananthapuram", "Male", "26-40", "Professor"),
        ("Deepak", "Sharma", "+919876500010", "deepak.sharma@example.in", "English", "Delhi", "Central Delhi", "Male", "26-40", "Journalist"),
    ]

    for fname, lname, phone, mail, lang, st, dist, gen, age, occ in contacts_seed:
        existing = db.query(AudienceContact).filter(AudienceContact.phone_number == phone).first()
        if not existing:
            contact = AudienceContact(
                org_id=org.id,
                first_name=fname,
                last_name=lname,
                phone_number=phone,
                email=mail,
                preferred_language=lang,
                location_state=st,
                location_district=dist,
                gender=gen,
                age_group=age,
                occupation=occ,
                is_subscribed=True,
            )
            db.add(contact)

    db.flush()

    # 8. Seed Audience Segments
    seg1 = db.query(AudienceSegment).filter(AudienceSegment.name == "Southern States - Regional Health Alert").first()
    if not seg1:
        crit1 = {"states": ["Telangana", "Andhra Pradesh", "Tamil Nadu", "Karnataka"]}
        reach1 = evaluate_segment_criteria(db, org.id, crit1)
        seg1 = AudienceSegment(
            org_id=org.id,
            name="Southern States - Regional Health Alert",
            description="Targeted demographic in southern states for health advisories",
            filter_criteria=crit1,
            estimated_reach=reach1,
        )
        db.add(seg1)

    seg2 = db.query(AudienceSegment).filter(AudienceSegment.name == "Hindi Belt - Public Safety Advisory").first()
    if not seg2:
        crit2 = {"languages": ["Hindi"]}
        reach2 = evaluate_segment_criteria(db, org.id, crit2)
        seg2 = AudienceSegment(
            org_id=org.id,
            name="Hindi Belt - Public Safety Advisory",
            description="Citizens with Hindi language preference for national announcements",
            filter_criteria=crit2,
            estimated_reach=reach2,
        )
        db.add(seg2)

    # 9. Seed Message Templates
    templates_seed = [
        (
            "Extreme Weather & Monsoon Warning",
            "Emergency Alerts",
            "URGENT WEATHER ADVISORY: Heavy rainfall and severe cyclonic winds are predicted across {{location}} over the next {{duration}}. Citizens are advised to remain indoors and contact disaster helpline 1070 for emergency assistance.",
            ["location", "duration"],
        ),
        (
            "Pulse Polio Immunization Drive",
            "Healthcare Announcements",
            "NATIONAL HEALTH MISSION: Protect your child against polio. Free immunization booths are open this Sunday at all Primary Health Centers in {{district}}. Ensure all children below 5 years receive two drops of life.",
            ["district"],
        ),
        (
            "Public Service Digital Gateway Policy",
            "Government Policy Updates",
            "CITIZEN NOTIFICATION: New digital portal services for citizen certifications are now active. Access seamless, paperless service delivery at your nearest Citizen Service Center.",
            [],
        ),
    ]

    for t_title, t_cat, t_content, t_vars in templates_seed:
        existing_tmpl = db.query(MessageTemplate).filter(MessageTemplate.title == t_title).first()
        if not existing_tmpl:
            tmpl = MessageTemplate(
                org_id=org.id,
                title=t_title,
                category=t_cat,
                content=t_content,
                variables=t_vars,
            )
            db.add(tmpl)

    db.commit()
    logger.info("Database initialized and seeded successfully with default roles, users, and templates!")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()

