import { z } from 'zod';

/**
 * Shared configuration for Business Bridge platform.
 * This package provides environment validation and configuration constants
 * that are shared between frontend and backend.
 */

// ============================================================
// Environment Schema
// ============================================================

export const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_URL: z.string().url().default('http://localhost:3000'),
  API_URL: z.string().url().default('http://localhost:8000/api/v1'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DATABASE_POOL_SIZE: z.coerce.number().int().positive().default(10),
  DATABASE_MAX_OVERFLOW: z.coerce.number().int().min(0).default(20),

  // Authentication (Supabase)
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_JWT_SECRET: z.string().min(1),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_ALGORITHM: z.string().default('HS256'),
  JWT_EXPIRY_MINUTES: z.coerce.number().int().positive().default(30),
  JWT_REFRESH_EXPIRY_DAYS: z.coerce.number().int().positive().default(7),

  // AI Providers
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_AI_API_KEY: z.string().optional(),
  AI_PROVIDER: z.enum(['openai', 'anthropic', 'google']).default('openai'),

  // Payment Providers
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  PAYSTACK_SECRET_KEY: z.string().optional(),
  PAYSTACK_PUBLISHABLE_KEY: z.string().optional(),
  PAYSTACK_WEBHOOK_SECRET: z.string().optional(),
  PAYMENT_PROVIDER: z.enum(['stripe', 'paystack']).default('stripe'),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),
  EMAIL_PROVIDER: z.enum(['smtp', 'resend', 'sendgrid']).default('smtp'),
  RESEND_API_KEY: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),

  // File Storage (Supabase Storage)
  STORAGE_PROVIDER: z.enum(['supabase', 's3', 'local']).default('supabase'),
  STORAGE_BUCKET: z.string().default('business-bridge'),
  SUPABASE_STORAGE_URL: z.string().url().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_S3_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),

  // Redis
  REDIS_URL: z.string().url().optional(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().int().min(0).max(15).default(0),

  // Search
  SEARCH_PROVIDER: z.enum(['postgres', 'meilisearch', 'typesense']).default('postgres'),
  MEILISEARCH_HOST: z.string().url().optional(),
  MEILISEARCH_API_KEY: z.string().optional(),

  // Monitoring
  SENTRY_DSN: z.string().url().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),

  // Feature Flags
  FEATURE_AI_BROKER: z.coerce.boolean().default(true),
  FEATURE_AI_VALUATION: z.coerce.boolean().default(true),
  FEATURE_AI_MATCHING: z.coerce.boolean().default(true),
  FEATURE_ESCROW: z.coerce.boolean().default(true),
  FEATURE_VERIFICATION: z.coerce.boolean().default(true),
  FEATURE_MULTI_CURRENCY: z.coerce.boolean().default(true),

  // Currency
  DEFAULT_CURRENCY: z.enum(['USD', 'GHS', 'GBP', 'EUR', 'CAD', 'AUD']).default('USD'),
  SUPPORTED_CURRENCIES: z.string().default('USD,GHS,GBP,EUR,CAD,AUD'),

  // Pagination
  DEFAULT_PAGE_SIZE: z.coerce.number().int().positive().default(20),
  MAX_PAGE_SIZE: z.coerce.number().int().positive().default(100),
});

export type EnvConfig = z.infer<typeof envSchema>;

// ============================================================
// Runtime Configuration
// ============================================================

let cachedConfig: EnvConfig | null = null;

export function getConfig(): EnvConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${errors}`);
  }

  cachedConfig = result.data;
  return cachedConfig;
}

export function resetConfig(): void {
  cachedConfig = null;
}

// ============================================================
// Constants
// ============================================================

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
] as const;

export const BUSINESS_TYPES = [
  'SAAS',
  'ECOMMERCE',
  'WEBSITE',
  'MOBILE_APP',
  'AGENCY',
  'CONTENT_SITE',
  'NEWSLETTER',
  'AMAZON_BUSINESS',
  'SHOPIFY_STORE',
  'MARKETPLACE',
  'COMMUNITY',
  'PLUGIN',
  'AI_BUSINESS',
  'DIGITAL_PRODUCT',
  'DOMAIN',
  'OTHER',
] as const;

export const LISTING_STATUSES = [
  'DRAFT',
  'PENDING_REVIEW',
  'ACTIVE',
  'UNDER_OFFER',
  'SOLD',
  'EXPIRED',
  'WITHDRAWN',
  'REJECTED',
] as const;

export const TRANSACTION_STATUSES = [
  'OFFER_PENDING',
  'OFFER_ACCEPTED',
  'OFFER_REJECTED',
  'OFFER_COUNTERED',
  'OFFER_EXPIRED',
  'OFFER_WITHDRAWN',
  'DUE_DILIGENCE',
  'ESCROW_FUNDED',
  'AGREEMENT_SIGNED',
  'ASSET_TRANSFER',
  'COMPLETED',
  'DISPUTED',
  'CANCELLED',
  'REFUNDED',
] as const;

export const USER_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'MODERATOR',
  'BROKER',
  'VERIFIED_BUYER',
  'VERIFIED_SELLER',
  'BUYER',
  'SELLER',
  'GUEST',
] as const;

export const OWNER_INVOLVEMENT = [
  'NONE',
  'LOW',
  'MEDIUM',
  'HIGH',
  'FULL_TIME',
] as const;

export const SALE_TYPES = [
  'FULL_SALE',
  'PARTIAL_SALE',
  'PARTNERSHIP',
  'AUCTION',
] as const;

export const DOCUMENT_CATEGORIES = [
  'FINANCIAL',
  'LEGAL',
  'OPERATIONAL',
  'TECHNICAL',
  'IDENTITY',
  'VERIFICATION',
  'CONTRACT',
  'NDA',
  'OTHER',
] as const;

export const VERIFICATION_TYPES = [
  'IDENTITY',
  'BUSINESS_OWNERSHIP',
  'REVENUE',
  'TRAFFIC',
  'FINANCIAL',
  'ASSET',
  'TECHNOLOGY',
] as const;

export const NOTIFICATION_TYPES = [
  'OFFER_RECEIVED',
  'OFFER_ACCEPTED',
  'OFFER_REJECTED',
  'OFFER_COUNTERED',
  'MESSAGE_RECEIVED',
  'TRANSACTION_UPDATE',
  'PAYMENT_RECEIVED',
  'PAYMENT_FAILED',
  'VERIFICATION_REQUESTED',
  'VERIFICATION_APPROVED',
  'VERIFICATION_REJECTED',
  'REVIEW_RECEIVED',
  'SYSTEM_ANNOUNCEMENT',
] as const;

// ============================================================
// Validation Helpers
// ============================================================

export function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function parseCurrency(value: string, _currencyCode: string = 'USD'): number {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
}

export function calculateMultiple(askingPrice: number, monthlyProfit: number): number {
  if (monthlyProfit <= 0) return 0;
  return Math.round((askingPrice / (monthlyProfit * 12)) * 10) / 10;
}

export function calculateMonthlyProfit(askingPrice: number, multiple: number): number {
  if (multiple <= 0) return 0;
  return Math.round(askingPrice / (multiple * 12));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}

export function generateSlug(base: string, existingSlugs: Set<string>): string {
  let slug = slugify(base);
  let counter = 1;
  let finalSlug = slug;

  while (existingSlugs.has(finalSlug)) {
    counter++;
    finalSlug = `${slug}-${counter}`;
  }

  return finalSlug;
}

// ============================================================
// Feature Flag Helpers
// ============================================================

export function isFeatureEnabled(feature: keyof Pick<EnvConfig,
  'FEATURE_AI_BROKER' |
  'FEATURE_AI_VALUATION' |
  'FEATURE_AI_MATCHING' |
  'FEATURE_ESCROW' |
  'FEATURE_VERIFICATION' |
  'FEATURE_MULTI_CURRENCY'
>): boolean {
  return getConfig()[feature];
}

export function getSupportedCurrencies(): string[] {
  return getConfig().SUPPORTED_CURRENCIES.split(',').map(c => c.trim().toUpperCase());
}

export function isCurrencySupported(currency: string): boolean {
  return getSupportedCurrencies().includes(currency.toUpperCase());
}