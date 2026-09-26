import { z } from 'zod';

// Common Schemas
export const currencySchema = z.enum(['USD', 'GHS', 'GBP', 'EUR', 'CAD', 'AUD']);

export const businessTypeSchema = z.enum([
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
  'OTHER'
]);

export const ownerInvolvementSchema = z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'FULL_TIME']);

// Auth Schemas
export const registerSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    { message: 'Password must contain uppercase, lowercase, and number' }
  ),
  full_name: z.string().min(2, { message: 'Full name is required' }),
  role: z.enum(['BUYER', 'SELLER', 'BROKER'])
});

export const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' })
});

export const resetPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' })
});

export const updatePasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' })
});

// Buyer Schemas
export const buyerMandateSchema = z.object({
  business_types: z.array(businessTypeSchema).min(1, 'Select at least one business type'),
  industries: z.array(z.string()).min(1, 'Select at least one industry'),
  budget_min: z.number().min(0, 'Minimum budget must be positive'),
  budget_max: z.number().min(0, 'Maximum budget must be positive'),
  currency: currencySchema,
  min_revenue: z.number().optional(),
  min_profit: z.number().optional(),
  max_owner_involvement: ownerInvolvementSchema.optional(),
  preferred_geographies: z.array(z.string()).optional()
}).refine(data => data.budget_max >= data.budget_min, {
  message: 'Maximum budget must be greater than minimum budget',
  path: ['budget_max']
});

export const buyerQualificationSchema = z.object({
  net_worth: z.number().min(0),
  liquid_assets: z.number().min(0),
  investment_experience: z.enum(['FIRST_TIME', 'SOME_EXPERIENCE', 'EXPERIENCED', 'PROFESSIONAL']),
  proof_of_funds_document: z.string().optional()
});

// Business & Listing Schemas
export const businessBasicsSchema = z.object({
  title: z.string().min(10, { message: 'Title must be at least 10 characters' }).max(100),
  business_type: businessTypeSchema,
  industry: z.string().min(1, { message: 'Industry is required' }),
  description: z.string().min(100, { message: 'Description must be at least 100 characters' }).max(5000),
  website_url: z.string().url({ message: 'Invalid URL' }).optional().or(z.literal('')),
  established_date: z.string().optional()
});

export const financialDataSchema = z.object({
  monthly_revenue: z.number().min(0, 'Revenue must be positive'),
  monthly_profit: z.number().min(0, 'Profit must be positive'),
  monthly_expenses: z.number().min(0, 'Expenses must be positive'),
  currency: currencySchema,
  annual_revenue: z.number().optional(),
  annual_profit: z.number().optional()
});

export const listingDetailsSchema = z.object({
  asking_price: z.number().min(1, 'Asking price must be positive'),
  currency: currencySchema,
  sale_type: z.enum(['FULL_SALE', 'PARTIAL_SALE', 'PARTNERSHIP', 'AUCTION']),
  highlights: z.array(z.string()).max(10).optional(),
  growth_opportunities: z.string().max(2000).optional(),
  risks: z.string().max(2000).optional(),
  owner_involvement: ownerInvolvementSchema,
  traffic_monthly: z.number().min(0).optional(),
  customers_count: z.number().min(0).optional()
});

// Offer Schemas
export const offerSchema = z.object({
  listing_id: z.string().uuid(),
  amount: z.number().min(1, 'Offer amount must be positive'),
  currency: currencySchema,
  conditions: z.string().max(1000).optional(),
  financing_info: z.string().max(500).optional(),
  expiry_date: z.string().optional()
});

export const counterofferSchema = z.object({
  parent_offer_id: z.string().uuid(),
  amount: z.number().min(1, 'Counteroffer amount must be positive'),
  currency: currencySchema,
  conditions: z.string().max(1000).optional()
});

// Message Schemas
export const messageSchema = z.object({
  conversation_id: z.string().uuid(),
  content: z.string().min(1, 'Message cannot be empty').max(5000)
});

export const createConversationSchema = z.object({
  listing_id: z.string().uuid().optional(),
  offer_id: z.string().uuid().optional(),
  initial_message: z.string().min(1).max(5000)
});

// Search Schemas
export const searchFiltersSchema = z.object({
  query: z.string().optional(),
  business_types: z.array(businessTypeSchema).optional(),
  industries: z.array(z.string()).optional(),
  price_min: z.number().min(0).optional(),
  price_max: z.number().min(0).optional(),
  revenue_min: z.number().min(0).optional(),
  revenue_max: z.number().min(0).optional(),
  profit_min: z.number().min(0).optional(),
  profit_max: z.number().min(0).optional(),
  verified_only: z.boolean().optional(),
  sale_types: z.array(z.enum(['FULL_SALE', 'PARTIAL_SALE', 'PARTNERSHIP', 'AUCTION'])).optional(),
  owner_involvement: z.array(ownerInvolvementSchema).optional(),
  countries: z.array(z.string()).optional(),
  sort_by: z.enum(['price_asc', 'price_desc', 'revenue_desc', 'profit_desc', 'newest', 'oldest']).optional(),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(20)
});

// Document Schemas
export const documentUploadSchema = z.object({
  listing_id: z.string().uuid().optional(),
  deal_id: z.string().uuid().optional(),
  category: z.enum([
    'FINANCIAL',
    'LEGAL',
    'OPERATIONAL',
    'TECHNICAL',
    'IDENTITY',
    'VERIFICATION',
    'CONTRACT',
    'NDA',
    'OTHER'
  ]),
  file_size: z.number().max(100 * 1024 * 1024, 'File size must not exceed 100MB')
});

// Review Schemas
export const reviewSchema = z.object({
  transaction_id: z.string().uuid(),
  rating: z.number().min(1).max(5),
  communication_rating: z.number().min(1).max(5),
  professionalism_rating: z.number().min(1).max(5),
  accuracy_rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional()
});

// Verification Schemas
export const verificationRequestSchema = z.object({
  verification_type: z.enum([
    'IDENTITY',
    'BUSINESS_OWNERSHIP',
    'REVENUE',
    'TRAFFIC',
    'FINANCIAL',
    'ASSET',
    'TECHNOLOGY'
  ]),
  subject_type: z.enum(['USER', 'BUSINESS', 'LISTING']),
  subject_id: z.string().uuid()
});

// Profile Update Schemas
export const updateProfileSchema = z.object({
  full_name: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional()
});

// AI Schemas
export const aiSearchSchema = z.object({
  query: z.string().min(1, { message: 'Search query is required' }).max(500),
  context: z.record(z.string(), z.any()).optional()
});

export const aiValuationSchema = z.object({
  business_type: businessTypeSchema,
  monthly_revenue: z.number().min(0),
  monthly_profit: z.number().min(0),
  growth_rate: z.number().optional(),
  age_months: z.number().min(0).optional(),
  customer_count: z.number().min(0).optional(),
  churn_rate: z.number().min(0).max(100).optional()
});

// NDA Schema
export const ndaSignatureSchema = z.object({
  data_room_id: z.string().uuid(),
  signature: z.string().min(1),
  ip_address: z.string().optional()
});

// Payout Account Schema
export const payoutAccountSchema = z.object({
  account_holder_name: z.string().min(2),
  account_type: z.enum(['BANK_ACCOUNT', 'MOBILE_MONEY']),
  account_number: z.string().min(5),
  bank_name: z.string().optional(),
  bank_code: z.string().optional(),
  country: z.string().length(2),
  currency: currencySchema
});

// Helper function to validate data
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err: z.ZodIssue) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    throw error;
  }
}
