// User & Authentication Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'BUYER' | 'SELLER' | 'BROKER' | 'INSTITUTIONAL_BUYER' | 'ADMIN' | 'SUPER_ADMIN' | 'SUPPORT' | 'REVIEWER' | 'COMPLIANCE';

export interface Profile {
  id: string;
  user_id: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  country?: string;
  timezone?: string;
  language?: string;
  created_at: string;
  updated_at: string;
}

// Business & Listing Types
export interface Business {
  id: string;
  seller_id: string;
  title: string;
  slug: string;
  description: string;
  business_type: BusinessType;
  industry: string;
  website_url?: string;
  established_date?: string;
  asking_price: number;
  currency: Currency;
  is_verified: boolean;
  verification_level?: VerificationLevel;
  created_at: string;
  updated_at: string;
}

export type BusinessType = 'SAAS' | 'ECOMMERCE' | 'WEBSITE' | 'MOBILE_APP' | 'AGENCY' | 'CONTENT_SITE' | 'NEWSLETTER' | 'AMAZON_BUSINESS' | 'SHOPIFY_STORE' | 'MARKETPLACE' | 'COMMUNITY' | 'PLUGIN' | 'AI_BUSINESS' | 'DIGITAL_PRODUCT' | 'DOMAIN' | 'OTHER';

export type VerificationLevel = 'UNVERIFIED' | 'BASIC' | 'VERIFIED' | 'PREMIUM';

export interface Listing {
  id: string;
  business_id: string;
  status: ListingStatus;
  sale_type: SaleType;
  highlights?: string[];
  growth_opportunities?: string;
  risks?: string;
  asking_price: number;
  currency: Currency;
  monthly_revenue?: number;
  monthly_profit?: number;
  monthly_expenses?: number;
  profit_margin?: number;
  revenue_multiple?: number;
  profit_multiple?: number;
  traffic_monthly?: number;
  customers_count?: number;
  customer_churn_rate?: number;
  owner_involvement?: OwnerInvolvement;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export type ListingStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'SOLD' | 'ARCHIVED' | 'REJECTED';
export type SaleType = 'FULL_SALE' | 'PARTIAL_SALE' | 'PARTNERSHIP' | 'AUCTION';
export type OwnerInvolvement = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'FULL_TIME';

// Financial Types
export type Currency = 'USD' | 'GHS' | 'GBP' | 'EUR' | 'CAD' | 'AUD';

export interface FinancialMetrics {
  monthly_revenue: number;
  monthly_profit: number;
  monthly_expenses: number;
  profit_margin: number;
  annual_revenue?: number;
  annual_profit?: number;
  growth_rate?: number;
  currency: Currency;
}

// Buyer Types
export interface BuyerProfile {
  id: string;
  user_id: string;
  budget_min?: number;
  budget_max?: number;
  currency: Currency;
  preferred_industries?: string[];
  preferred_business_types?: BusinessType[];
  investment_timeline?: string;
  experience_level?: ExperienceLevel;
  is_qualified: boolean;
  qualification_status?: QualificationStatus;
  created_at: string;
  updated_at: string;
}

export type ExperienceLevel = 'FIRST_TIME' | 'SOME_EXPERIENCE' | 'EXPERIENCED' | 'PROFESSIONAL';
export type QualificationStatus = 'UNQUALIFIED' | 'PENDING' | 'QUALIFIED' | 'ACCREDITED';

export interface BuyerMandate {
  id: string;
  buyer_id: string;
  business_types: BusinessType[];
  industries: string[];
  budget_min: number;
  budget_max: number;
  currency: Currency;
  min_revenue?: number;
  min_profit?: number;
  max_owner_involvement?: OwnerInvolvement;
  preferred_geographies?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Seller Types
export interface SellerProfile {
  id: string;
  user_id: string;
  business_count: number;
  total_sales: number;
  verification_status: VerificationStatus;
  payout_account_configured: boolean;
  created_at: string;
  updated_at: string;
}

export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

// Message Types
export interface Conversation {
  id: string;
  listing_id?: string;
  offer_id?: string;
  deal_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

// Offer Types
export interface Offer {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  currency: Currency;
  status: OfferStatus;
  conditions?: string;
  financing_info?: string;
  expiry_date?: string;
  parent_offer_id?: string; // For counteroffers
  created_at: string;
  updated_at: string;
}

export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN' | 'EXPIRED' | 'COUNTERED';

// Deal & Transaction Types
export interface Deal {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  offer_id: string;
  status: DealStatus;
  agreed_amount: number;
  currency: Currency;
  created_at: string;
  updated_at: string;
}

export type DealStatus = 'NEGOTIATION' | 'AGREEMENT_PENDING' | 'DUE_DILIGENCE' | 'PAYMENT_PENDING' | 'TRANSFER_PENDING' | 'INSPECTION' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';

export interface Transaction {
  id: string;
  deal_id: string;
  status: TransactionStatus;
  amount: number;
  currency: Currency;
  commission_amount: number;
  seller_proceeds: number;
  payment_provider?: string;
  payment_reference?: string;
  payout_reference?: string;
  created_at: string;
  updated_at: string;
}

export type TransactionStatus =
  | 'DRAFT'
  | 'OFFER_PENDING'
  | 'OFFER_ACCEPTED'
  | 'AGREEMENT_PENDING'
  | 'AGREEMENT_SIGNED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_PROCESSING'
  | 'PAYMENT_CONFIRMED'
  | 'TRANSFER_PENDING'
  | 'TRANSFER_IN_PROGRESS'
  | 'INSPECTION'
  | 'ACCEPTED'
  | 'DISPUTED'
  | 'PAYOUT_PENDING'
  | 'PAYOUT_PROCESSING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED';

// Document Types
export interface Document {
  id: string;
  listing_id?: string;
  deal_id?: string;
  uploader_id: string;
  category: DocumentCategory;
  filename: string;
  file_size: number;
  mime_type: string;
  storage_path: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export type DocumentCategory =
  | 'FINANCIAL'
  | 'LEGAL'
  | 'OPERATIONAL'
  | 'TECHNICAL'
  | 'IDENTITY'
  | 'VERIFICATION'
  | 'CONTRACT'
  | 'NDA'
  | 'OTHER';

// Data Room Types
export interface DataRoom {
  id: string;
  listing_id: string;
  requires_nda: boolean;
  created_at: string;
  updated_at: string;
}

export interface DataRoomAccess {
  id: string;
  data_room_id: string;
  user_id: string;
  granted_by: string;
  nda_signed: boolean;
  nda_signed_at?: string;
  access_expires_at?: string;
  created_at: string;
}

// Verification Types
export interface VerificationCase {
  id: string;
  subject_type: 'USER' | 'BUSINESS' | 'LISTING';
  subject_id: string;
  verification_type: VerificationType;
  status: VerificationStatus;
  result?: string;
  verified_by?: string;
  created_at: string;
  updated_at: string;
}

export type VerificationType =
  | 'IDENTITY'
  | 'BUSINESS_OWNERSHIP'
  | 'REVENUE'
  | 'TRAFFIC'
  | 'FINANCIAL'
  | 'ASSET'
  | 'TECHNOLOGY';

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export type NotificationType =
  | 'NEW_LISTING'
  | 'NEW_MATCH'
  | 'NEW_MESSAGE'
  | 'NEW_OFFER'
  | 'COUNTEROFFER'
  | 'OFFER_ACCEPTED'
  | 'OFFER_REJECTED'
  | 'VERIFICATION_UPDATE'
  | 'DOCUMENT_REQUEST'
  | 'PAYMENT_UPDATE'
  | 'PAYOUT_UPDATE'
  | 'DEAL_DEADLINE'
  | 'LISTING_APPROVED'
  | 'LISTING_REJECTED'
  | 'DISPUTE_UPDATE';

// Search & Filter Types
export interface SearchFilters {
  query?: string;
  business_types?: BusinessType[];
  industries?: string[];
  price_min?: number;
  price_max?: number;
  revenue_min?: number;
  revenue_max?: number;
  profit_min?: number;
  profit_max?: number;
  verified_only?: boolean;
  sale_types?: SaleType[];
  owner_involvement?: OwnerInvolvement[];
  countries?: string[];
  sort_by?: SortOption;
  page?: number;
  limit?: number;
}

export type SortOption =
  | 'price_asc'
  | 'price_desc'
  | 'revenue_desc'
  | 'profit_desc'
  | 'newest'
  | 'oldest';

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    request_id?: string;
  };
}

// AI Types
export interface AIConversation {
  id: string;
  user_id: string;
  type: AIConversationType;
  context?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type AIConversationType =
  | 'SEARCH'
  | 'LISTING_GENERATION'
  | 'VALUATION'
  | 'FINANCIAL_ANALYSIS'
  | 'DUE_DILIGENCE'
  | 'DOCUMENT_ASSISTANT'
  | 'MATCHING'
  | 'BROKER';

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tool_calls?: Record<string, any>[];
  created_at: string;
}

// Review Types
export interface Review {
  id: string;
  transaction_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  communication_rating: number;
  professionalism_rating: number;
  accuracy_rating: number;
  comment?: string;
  created_at: string;
}

// Broker Types
export interface BrokerProfile {
  id: string;
  user_id: string;
  company_name?: string;
  license_number?: string;
  is_verified: boolean;
  deals_completed: number;
  total_volume: number;
  commission_rate: number;
  created_at: string;
  updated_at: string;
}

// Organization Types (Institutional)
export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type OrganizationType = 'INVESTMENT_FIRM' | 'PRIVATE_EQUITY' | 'HOLDING_COMPANY' | 'FAMILY_OFFICE' | 'BROKER_FIRM';

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrgMemberRole;
  permissions: string[];
  created_at: string;
}

export type OrgMemberRole = 'OWNER' | 'ADMIN' | 'ANALYST' | 'VIEWER';
