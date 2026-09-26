# Generate strong JWT secret
JWT_SECRET=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")

# Update .env file
cat > apps/api/.env << EOF
# Application
ENVIRONMENT=development
DEBUG=True
APP_URL=http://localhost:3000
API_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/business_bridge

# Redis
REDIS_URL=redis://localhost:6379

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# JWT (SECURE - GENERATED)
JWT_SECRET=$JWT_SECRET
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Storage
STORAGE_BUCKET_PUBLIC=public
STORAGE_BUCKET_PRIVATE=private

# Email Provider
EMAIL_PROVIDER=NOT_CONFIGURED
EMAIL_FROM=noreply@businessbridge.com

# Payment Provider
PAYMENT_PROVIDER=NOT_CONFIGURED

# Security
RATE_LIMIT_PER_MINUTE=60
ENABLE_RATE_LIMITING=True

# Feature Flags
ENABLE_VERIFICATION=True
ENABLE_MESSAGING=True
ENABLE_OFFERS=True
ENABLE_DOCUMENTS=True
ENABLE_NOTIFICATIONS=True
ENABLE_AI_FEATURES=True
ENABLE_DATA_ROOMS=True
ENABLE_DEAL_ROOMS=True
ENABLE_VALUATION=True
ENABLE_REVIEWS=True
ENABLE_AI_BROKER=True
EOF

echo "✅ Secure .env file created with generated JWT_SECRET"
