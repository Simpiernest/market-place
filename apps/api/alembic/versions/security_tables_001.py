"""
Alembic migration: Add security tables (audit logs, disputes, refund agreements).
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from uuid import uuid4

# revision identifiers
revision = 'security_tables_001'
down_revision = None  # Set to your latest migration ID
branch_labels = None
depends_on = None


def upgrade():
    # RefundAgreement table
    op.create_table(
        'refund_agreements',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid4),
        sa.Column('transaction_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('transactions.id'), nullable=False),
        sa.Column('buyer_agreed', sa.Boolean(), default=False),
        sa.Column('seller_agreed', sa.Boolean(), default=False),
        sa.Column('buyer_agreed_at', sa.DateTime(), nullable=True),
        sa.Column('seller_agreed_at', sa.DateTime(), nullable=True),
        sa.Column('reason', sa.Text()),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now())
    )

    # Dispute table
    op.create_table(
        'disputes',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid4),
        sa.Column('transaction_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('transactions.id'), nullable=False),
        sa.Column('initiated_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('status', sa.String(), default='OPEN'),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column('resolution', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('resolved_at', sa.DateTime(), nullable=True)
    )

    # AuditLog table
    op.create_table(
        'audit_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid4),
        sa.Column('event_type', sa.String(), nullable=False, index=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('severity', sa.String(), default='INFO'),
        sa.Column('ip_address', sa.String()),
        sa.Column('user_agent', sa.String()),
        sa.Column('metadata', postgresql.JSON(), default={}),
        sa.Column('timestamp', sa.DateTime(), default=sa.func.now(), index=True)
    )

    # FinancialAuditLog table
    op.create_table(
        'financial_audit_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid4),
        sa.Column('event_type', sa.String(), nullable=False, index=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('transaction_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('transactions.id'), nullable=False),
        sa.Column('amount', sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column('metadata', postgresql.JSON(), default={}),
        sa.Column('timestamp', sa.DateTime(), default=sa.func.now(), index=True)
    )

    # Create indexes for performance
    op.create_index('idx_audit_event_type', 'audit_logs', ['event_type'])
    op.create_index('idx_audit_timestamp', 'audit_logs', ['timestamp'])
    op.create_index('idx_audit_user_id', 'audit_logs', ['user_id'])
    op.create_index('idx_audit_severity', 'audit_logs', ['severity'])

    op.create_index('idx_financial_audit_event_type', 'financial_audit_logs', ['event_type'])
    op.create_index('idx_financial_audit_timestamp', 'financial_audit_logs', ['timestamp'])
    op.create_index('idx_financial_audit_user_id', 'financial_audit_logs', ['user_id'])
    op.create_index('idx_financial_audit_transaction_id', 'financial_audit_logs', ['transaction_id'])

    op.create_index('idx_disputes_transaction_id', 'disputes', ['transaction_id'])
    op.create_index('idx_disputes_status', 'disputes', ['status'])

    op.create_index('idx_refund_agreements_transaction_id', 'refund_agreements', ['transaction_id'])


def downgrade():
    # Drop indexes
    op.drop_index('idx_refund_agreements_transaction_id', table_name='refund_agreements')
    op.drop_index('idx_disputes_status', table_name='disputes')
    op.drop_index('idx_disputes_transaction_id', table_name='disputes')
    op.drop_index('idx_financial_audit_transaction_id', table_name='financial_audit_logs')
    op.drop_index('idx_financial_audit_user_id', table_name='financial_audit_logs')
    op.drop_index('idx_financial_audit_timestamp', table_name='financial_audit_logs')
    op.drop_index('idx_financial_audit_event_type', table_name='financial_audit_logs')
    op.drop_index('idx_audit_severity', table_name='audit_logs')
    op.drop_index('idx_audit_user_id', table_name='audit_logs')
    op.drop_index('idx_audit_timestamp', table_name='audit_logs')
    op.drop_index('idx_audit_event_type', table_name='audit_logs')

    # Drop tables
    op.drop_table('financial_audit_logs')
    op.drop_table('audit_logs')
    op.drop_table('disputes')
    op.drop_table('refund_agreements')
