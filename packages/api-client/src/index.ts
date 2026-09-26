// Use a global variable for window check
declare const window: any;

// Define types locally to avoid import issues during build
type User = any;
type Profile = any;
type Business = any;
type Listing = any;
type BuyerProfile = any;
type BuyerMandate = any;
type SellerProfile = any;
type Conversation = any;
type Message = any;
type Offer = any;
type Deal = any;
type Transaction = any;
type Document = any;
type DataRoom = any;
type DataRoomAccess = any;
type VerificationCase = any;
type Notification = any;
type SearchFilters = any;
type PaginatedResponse<T> = { data: T[]; total: number; page: number; limit: number; total_pages: number };
type Review = any;
type Currency = 'USD' | 'GHS' | 'GBP' | 'EUR' | 'CAD' | 'AUD';
type BusinessType = 'SAAS' | 'ECOMMERCE' | 'WEBSITE' | 'MOBILE_APP' | 'AGENCY' | 'CONTENT_SITE' | 'NEWSLETTER' | 'AMAZON_BUSINESS' | 'SHOPIFY_STORE' | 'MARKETPLACE' | 'COMMUNITY' | 'PLUGIN' | 'AI_BUSINESS' | 'DIGITAL_PRODUCT' | 'DOMAIN' | 'OTHER';
type ListingStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'SOLD' | 'ARCHIVED' | 'REJECTED';

const API_BASE = (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || process.env.API_URL || 'http://localhost:8000';

class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      this.accessToken = window.localStorage.getItem('access_token');
    }
  }

  setToken(token: string | null) {
    this.accessToken = token;
    if (typeof window !== 'undefined') {
      if (token) {
        window.localStorage.setItem('access_token', token);
      } else {
        window.localStorage.removeItem('access_token');
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Request failed' } })) as { error?: { message?: string } };
      const errorMessage = errorData.error?.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    const data = await response.json();
    return data as T;
  }

  // Auth endpoints
  async register(data: { email: string; password: string; full_name: string; role: string }) {
    return this.request<{ user: User; access_token: string; refresh_token: string }>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request<{ user: User; access_token: string; refresh_token: string }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout() {
    return this.request<void>('/api/v1/auth/logout', { method: 'POST' });
  }

  async refreshToken(refreshToken: string) {
    return this.request<{ access_token: string }>('/api/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  async requestPasswordReset(email: string) {
    return this.request<void>('/api/v1/auth/request-password-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string) {
    return this.request<void>('/api/v1/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  async verifyEmail(token: string) {
    return this.request<void>('/api/v1/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  // User endpoints
  async getCurrentUser(): Promise<User> {
    return this.request<User>('/api/v1/users/me');
  }

  async getProfile(): Promise<Profile> {
    return this.request<Profile>('/api/v1/users/me/profile');
  }

  async updateProfile(data: Partial<Profile>): Promise<Profile> {
    return this.request<Profile>('/api/v1/users/me/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async uploadAvatar(file: File): Promise<{ avatar_url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.request<{ avatar_url: string }>('/api/v1/users/me/avatar', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  // Buyer endpoints
  async getBuyerProfile(): Promise<BuyerProfile> {
    return this.request<BuyerProfile>('/api/v1/buyers/me');
  }

  async createBuyerProfile(data: Partial<BuyerProfile>): Promise<BuyerProfile> {
    return this.request<BuyerProfile>('/api/v1/buyers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBuyerProfile(data: Partial<BuyerProfile>): Promise<BuyerProfile> {
    return this.request<BuyerProfile>('/api/v1/buyers/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getBuyerMandate(): Promise<BuyerMandate | null> {
    try {
      return await this.request<BuyerMandate>('/api/v1/buyers/me/mandate');
    } catch {
      return null;
    }
  }

  async createBuyerMandate(data: Partial<BuyerMandate>): Promise<BuyerMandate> {
    return this.request<BuyerMandate>('/api/v1/buyers/me/mandate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBuyerMandate(data: Partial<BuyerMandate>): Promise<BuyerMandate> {
    return this.request<BuyerMandate>('/api/v1/buyers/me/mandate', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getSavedListings(page = 1, limit = 20): Promise<PaginatedResponse<Listing>> {
    return this.request<PaginatedResponse<Listing>>(`/api/v1/buyers/me/saved?page=${page}&limit=${limit}`);
  }

  async saveListing(listingId: string): Promise<void> {
    return this.request<void>(`/api/v1/buyers/me/saved/${listingId}`, { method: 'POST' });
  }

  async unsaveListing(listingId: string): Promise<void> {
    return this.request<void>(`/api/v1/buyers/me/saved/${listingId}`, { method: 'DELETE' });
  }

  // Seller endpoints
  async getSellerProfile(): Promise<SellerProfile> {
    return this.request<SellerProfile>('/api/v1/sellers/me');
  }

  async createSellerProfile(data: Partial<SellerProfile>): Promise<SellerProfile> {
    return this.request<SellerProfile>('/api/v1/sellers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSellerProfile(data: Partial<SellerProfile>): Promise<SellerProfile> {
    return this.request<SellerProfile>('/api/v1/sellers/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getMyListings(status?: ListingStatus, page = 1, limit = 20): Promise<PaginatedResponse<Listing>> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append('status', status);
    return this.request<PaginatedResponse<Listing>>(`/api/v1/sellers/me/listings?${params}`);
  }

  // Listing endpoints
  async getListings(filters: SearchFilters = {}): Promise<PaginatedResponse<Listing>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, String(v)));
        } else {
          params.append(key, String(value));
        }
      }
    });
    return this.request<PaginatedResponse<Listing>>(`/api/v1/listings?${params}`);
  }

  async getFeaturedListings(limit = 10): Promise<Listing[]> {
    return this.request<Listing[]>(`/api/v1/marketplace/featured?limit=${limit}`);
  }

  async getListing(slug: string): Promise<Listing & { business: Business }> {
    return this.request<Listing & { business: Business }>(`/api/v1/listings/${slug}`);
  }

  async getListingById(id: string): Promise<Listing & { business: Business }> {
    return this.request<Listing & { business: Business }>(`/api/v1/listings/id/${id}`);
  }

  async createListing(data: Partial<Listing>): Promise<Listing> {
    return this.request<Listing>('/api/v1/listings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateListing(id: string, data: Partial<Listing>): Promise<Listing> {
    return this.request<Listing>(`/api/v1/listings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async publishListing(id: string): Promise<Listing> {
    return this.request<Listing>(`/api/v1/listings/${id}/publish`, { method: 'POST' });
  }

  async deleteListing(id: string): Promise<void> {
    return this.request<void>(`/api/v1/listings/${id}`, { method: 'DELETE' });
  }

  async getListingMedia(listingId: string): Promise<{ id: string; url: string; type: string }[]> {
    return this.request(`/api/v1/listings/${listingId}/media`);
  }

  async uploadListingMedia(listingId: string, files: File[]): Promise<{ id: string; url: string }[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return this.request(`/api/v1/listings/${listingId}/media`, {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  // Category/Industry endpoints
  async getCategories(): Promise<{ id: string; name: string; slug: string; count: number }[]> {
    return this.request('/api/v1/categories');
  }

  async getIndustries(): Promise<{ id: string; name: string; slug: string; count: number }[]> {
    return this.request('/api/v1/industries');
  }

  // Offer endpoints
  async createOffer(data: { listing_id: string; amount: number; currency: Currency; conditions?: string; financing_info?: string }): Promise<Offer> {
    return this.request<Offer>('/api/v1/offers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyOffers(page = 1, limit = 20): Promise<PaginatedResponse<Offer>> {
    return this.request<PaginatedResponse<Offer>>(`/api/v1/offers/me?page=${page}&limit=${limit}`);
  }

  async getOffersForListing(listingId: string): Promise<Offer[]> {
    return this.request<Offer[]>(`/api/v1/offers/listing/${listingId}`);
  }

  async acceptOffer(offerId: string): Promise<Offer> {
    return this.request<Offer>(`/api/v1/offers/${offerId}/accept`, { method: 'POST' });
  }

  async rejectOffer(offerId: string): Promise<Offer> {
    return this.request<Offer>(`/api/v1/offers/${offerId}/reject`, { method: 'POST' });
  }

  async withdrawOffer(offerId: string): Promise<Offer> {
    return this.request<Offer>(`/api/v1/offers/${offerId}/withdraw`, { method: 'POST' });
  }

  async createCounteroffer(data: { parent_offer_id: string; amount: number; currency: Currency; conditions?: string }): Promise<Offer> {
    return this.request<Offer>('/api/v1/offers/counteroffer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Message endpoints
  async getConversations(page = 1, limit = 20): Promise<PaginatedResponse<Conversation>> {
    return this.request<PaginatedResponse<Conversation>>(`/api/v1/messages/conversations?page=${page}&limit=${limit}`);
  }

  async getConversation(id: string): Promise<Conversation & { messages: Message[] }> {
    return this.request(`/api/v1/messages/conversations/${id}`);
  }

  async createConversation(data: { listing_id?: string; offer_id?: string; initial_message: string }): Promise<Conversation> {
    return this.request<Conversation>('/api/v1/messages/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async sendMessage(data: { conversation_id: string; content: string }): Promise<Message> {
    return this.request<Message>('/api/v1/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async markMessagesRead(conversationId: string): Promise<void> {
    return this.request<void>(`/api/v1/messages/conversations/${conversationId}/read`, { method: 'POST' });
  }

  // Deal endpoints
  async getDeals(page = 1, limit = 20): Promise<PaginatedResponse<Deal>> {
    return this.request<PaginatedResponse<Deal>>(`/api/v1/deals?page=${page}&limit=${limit}`);
  }

  async getDeal(id: string): Promise<Deal & { listing: Listing; buyer: User; seller: User }> {
    return this.request(`/api/v1/deals/${id}`);
  }

  async createDeal(data: { listing_id: string; offer_id: string }): Promise<Deal> {
    return this.request<Deal>('/api/v1/deals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDeal(id: string, data: Partial<Deal>): Promise<Deal> {
    return this.request<Deal>(`/api/v1/deals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Transaction endpoints
  async getTransactions(page = 1, limit = 20): Promise<PaginatedResponse<Transaction>> {
    return this.request<PaginatedResponse<Transaction>>(`/api/v1/transactions?page=${page}&limit=${limit}`);
  }

  async getTransaction(id: string): Promise<Transaction> {
    return this.request<Transaction>(`/api/v1/transactions/${id}`);
  }

  async initiatePayment(transactionId: string): Promise<{ checkout_url: string }> {
    return this.request<{ checkout_url: string }>(`/api/v1/transactions/${transactionId}/pay`, { method: 'POST' });
  }

  // Document endpoints
  async getDocuments(listingId?: string, dealId?: string): Promise<Document[]> {
    const params = new URLSearchParams();
    if (listingId) params.append('listing_id', listingId);
    if (dealId) params.append('deal_id', dealId);
    return this.request<Document[]>(`/api/v1/documents?${params}`);
  }

  async uploadDocument(data: { listing_id?: string; deal_id?: string; category: string; file: File }): Promise<Document> {
    const formData = new FormData();
    if (data.listing_id) formData.append('listing_id', data.listing_id);
    if (data.deal_id) formData.append('deal_id', data.deal_id);
    formData.append('category', data.category);
    formData.append('file', data.file);
    return this.request<Document>('/api/v1/documents', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  async downloadDocument(id: string): Promise<{ download_url: string }> {
    return this.request<{ download_url: string }>(`/api/v1/documents/${id}/download`);
  }

  async deleteDocument(id: string): Promise<void> {
    return this.request<void>(`/api/v1/documents/${id}`, { method: 'DELETE' });
  }

  // Data Room endpoints
  async getDataRoom(listingId: string): Promise<DataRoom> {
    return this.request<DataRoom>(`/api/v1/data-rooms/${listingId}`);
  }

  async requestDataRoomAccess(listingId: string): Promise<DataRoomAccess> {
    return this.request<DataRoomAccess>(`/api/v1/data-rooms/${listingId}/request-access`, { method: 'POST' });
  }

  async getDataRoomDocuments(dataRoomId: string): Promise<Document[]> {
    return this.request<Document[]>(`/api/v1/data-rooms/${dataRoomId}/documents`);
  }

  // Verification endpoints
  async getVerificationCases(): Promise<VerificationCase[]> {
    return this.request<VerificationCase[]>('/api/v1/verification/cases');
  }

  async requestVerification(data: { verification_type: string; subject_type: string; subject_id: string }): Promise<VerificationCase> {
    return this.request<VerificationCase>('/api/v1/verification/cases', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async uploadVerificationDocument(caseId: string, file: File): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);
    return this.request<Document>(`/api/v1/verification/cases/${caseId}/documents`, {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  // Notification endpoints
  async getNotifications(page = 1, limit = 20): Promise<PaginatedResponse<Notification>> {
    return this.request<PaginatedResponse<Notification>>(`/api/v1/notifications?page=${page}&limit=${limit}`);
  }

  async markNotificationRead(id: string): Promise<void> {
    return this.request<void>(`/api/v1/notifications/${id}/read`, { method: 'POST' });
  }

  async markAllNotificationsRead(): Promise<void> {
    return this.request<void>('/api/v1/notifications/read-all', { method: 'POST' });
  }

  // Review endpoints
  async createReview(data: { transaction_id: string; rating: number; communication_rating: number; professionalism_rating: number; accuracy_rating: number; comment?: string }): Promise<Review> {
    return this.request<Review>('/api/v1/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getReviewsForUser(userId: string): Promise<Review[]> {
    return this.request<Review[]>(`/api/v1/reviews/user/${userId}`);
  }

  // AI endpoints
  async aiSearch(query: string, context?: Record<string, any>): Promise<{ results: Listing[]; explanation: string }> {
    return this.request('/api/v1/ai/search', {
      method: 'POST',
      body: JSON.stringify({ query, context }),
    });
  }

  async aiGenerateListing(data: { business_type: BusinessType; description: string; highlights?: string[] }): Promise<{ title: string; description: string; highlights: string[]; seo_description: string }> {
    return this.request('/api/v1/ai/generate-listing', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async aiValuation(data: { business_type: BusinessType; monthly_revenue: number; monthly_profit: number; growth_rate?: number; age_months?: number; customer_count?: number; churn_rate?: number }): Promise<{ valuation: number; explanation: string; comparables: any[] }> {
    return this.request('/api/v1/ai/valuation', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async aiAnalyzeFinancials(documents: string[]): Promise<{ analysis: string; key_metrics: any; risks: string[] }> {
    return this.request('/api/v1/ai/analyze-financials', {
      method: 'POST',
      body: JSON.stringify({ documents }),
    });
  }

  // Admin endpoints
  async adminGetUsers(page = 1, limit = 20): Promise<PaginatedResponse<User>> {
    return this.request<PaginatedResponse<User>>(`/api/v1/admin/users?page=${page}&limit=${limit}`);
  }

  async adminGetListings(page = 1, limit = 20): Promise<PaginatedResponse<Listing>> {
    return this.request<PaginatedResponse<Listing>>(`/api/v1/admin/listings?page=${page}&limit=${limit}`);
  }

  async adminApproveListing(id: string): Promise<Listing> {
    return this.request<Listing>(`/api/v1/admin/listings/${id}/approve`, { method: 'POST' });
  }

  async adminRejectListing(id: string, reason: string): Promise<Listing> {
    return this.request<Listing>(`/api/v1/admin/listings/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async adminGetVerificationQueue(page = 1, limit = 20): Promise<PaginatedResponse<VerificationCase>> {
    return this.request<PaginatedResponse<VerificationCase>>(`/api/v1/admin/verification?page=${page}&limit=${limit}`);
  }

  async adminApproveVerification(caseId: string): Promise<VerificationCase> {
    return this.request<VerificationCase>(`/api/v1/admin/verification/${caseId}/approve`, { method: 'POST' });
  }

  async adminRejectVerification(caseId: string, reason: string): Promise<VerificationCase> {
    return this.request<VerificationCase>(`/api/v1/admin/verification/${caseId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async adminGetTransactions(page = 1, limit = 20): Promise<PaginatedResponse<Transaction>> {
    return this.request<PaginatedResponse<Transaction>>(`/api/v1/admin/transactions?page=${page}&limit=${limit}`);
  }

  // Payment endpoints
  async createPaymentIntent(transactionId: string, provider: string): Promise<{ client_secret: string }> {
    return this.request('/api/v1/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ transaction_id: transactionId, provider }),
    });
  }

  async confirmPayment(paymentIntentId: string): Promise<Transaction> {
    return this.request<Transaction>('/api/v1/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({ payment_intent_id: paymentIntentId }),
    });
  }

  // Payout endpoints
  async getPayoutAccount(): Promise<{ id: string; account_holder_name: string; bank_name?: string; country: string; currency: Currency } | null> {
    try {
      return await this.request('/api/v1/payouts/account');
    } catch {
      return null;
    }
  }

  async createPayoutAccount(data: { account_holder_name: string; account_type: string; account_number: string; bank_name?: string; bank_code?: string; country: string; currency: Currency }): Promise<void> {
    return this.request('/api/v1/payouts/account', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPayouts(page = 1, limit = 20): Promise<PaginatedResponse<{ id: string; amount: number; currency: Currency; status: string; created_at: string }>> {
    return this.request(`/api/v1/payouts?page=${page}&limit=${limit}`);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health');
  }
}

// Export singleton instance
export const api = new ApiClient();

// Export class for testing
export { ApiClient };