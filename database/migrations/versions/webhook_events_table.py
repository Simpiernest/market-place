"""Add webhook_events table for replay protection

Revision ID: webhook_events_001
Revises: 541755fba18c
Create Date: 2026-09-12 06:13:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'webhook_events_001'
down_revision = '541755fba18c'
branch_labels = None
depends_on = None


def upgrade():
    """Add webhook_events table for replay attack prevention."""
    op.create_table(
        'webhook_events',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('provider', sa.String(50), nullable=False, comment='Payment provider (stripe, paystack, etc.)'),
        sa.Column('event_id', sa.String(255), nullable=False, comment='Unique event ID from provider'),
        sa.Column('event_type', sa.String(100), nullable=False, comment='Event type (checkout.session.completed, etc.)'),
        sa.Column('transaction_id', postgresql.UUID(as_uuid=True), nullable=True, comment='Associated transaction if available'),
        sa.Column('payload_preview', sa.Text(), nullable=True, comment='First 1000 chars of payload for debugging'),
        sa.Column('processed_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),

        # Composite unique constraint to prevent duplicate processing
        sa.UniqueConstraint('provider', 'event_id', name='uq_webhook_provider_event'),

        # Index for fast lookups
        sa.Index('ix_webhook_events_provider_event_id', 'provider', 'event_id'),
        sa.Index('ix_webhook_events_transaction_id', 'transaction_id'),
        sa.Index('ix_webhook_events_processed_at', 'processed_at'),

        comment='Stores processed webhook events to prevent replay attacks'
    )

    # Add foreign key to transactions table
    op.create_foreign_key(
        'fk_webhook_events_transaction_id',
        'webhook_events', 'transactions',
        ['transaction_id'], ['id'],
        ondelete='SET NULL'
    )


def downgrade():
    """Remove webhook_events table."""
    op.drop_constraint('fk_webhook_events_transaction_id', 'webhook_events', type_='foreignkey')
    op.drop_index('ix_webhook_events_processed_at', table_name='webhook_events')
    op.drop_index('ix_webhook_events_transaction_id', table_name='webhook_events')
    op.drop_index('ix_webhook_events_provider_event_id', table_name='webhook_events')
    op.drop_table('webhook_events')
