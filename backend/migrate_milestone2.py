import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.session import engine
from sqlalchemy import text

def run_migration():
    print("Starting Milestone 2 database migration...")
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE campaign_translations ADD COLUMN IF NOT EXISTS original_text TEXT;"))
        conn.execute(text("ALTER TABLE campaign_translations ADD COLUMN IF NOT EXISTS cultural_notes TEXT;"))
        conn.execute(text("ALTER TABLE campaign_translations ADD COLUMN IF NOT EXISTS reviewer_notes TEXT;"))

        conn.execute(text("""
        CREATE TABLE IF NOT EXISTS campaign_quality_reports (
            id VARCHAR(36) PRIMARY KEY,
            campaign_id VARCHAR(36) REFERENCES campaigns(id) ON DELETE CASCADE,
            clarity_score INTEGER DEFAULT 85,
            readability_score INTEGER DEFAULT 85,
            compliance_score INTEGER DEFAULT 95,
            compliance_status VARCHAR(50) DEFAULT 'COMPLIANT',
            sentiment_label VARCHAR(50) DEFAULT 'POSITIVE',
            sentiment_score FLOAT DEFAULT 0.5,
            flags JSON DEFAULT '[]'::json,
            suggestions JSON DEFAULT '[]'::json,
            checked_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            checked_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL
        );
        CREATE INDEX IF NOT EXISTS idx_quality_reports_campaign_id ON campaign_quality_reports(campaign_id);
        """))

        conn.execute(text("""
        CREATE TABLE IF NOT EXISTS campaign_personalization_variants (
            id VARCHAR(36) PRIMARY KEY,
            campaign_id VARCHAR(36) REFERENCES campaigns(id) ON DELETE CASCADE,
            segment_name VARCHAR(100) NOT NULL,
            target_audience VARCHAR(100) NOT NULL,
            optimized_headline VARCHAR(255),
            optimized_content TEXT NOT NULL,
            tone_applied VARCHAR(100),
            sentiment_analysis JSON DEFAULT '{}'::json,
            improvement_notes JSON DEFAULT '[]'::json,
            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_personalization_campaign_id ON campaign_personalization_variants(campaign_id);
        """))
        conn.commit()
    print("Milestone 2 database migration completed successfully!")

if __name__ == "__main__":
    run_migration()

