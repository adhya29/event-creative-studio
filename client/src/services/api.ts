// API client for communicating with the Express backend
// Production-hardened with HTTP status validation, safe error handling, and robust headers

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE_URL = rawApiUrl.replace(/\/$/, '');

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('lumina_admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Safely parse HTTP response and handle error statuses
 */
async function handleResponse<T = any>(res: Response): Promise<T> {
  const text = await res.text();
  let json: any = null;

  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { error: text || `HTTP ${res.status}: ${res.statusText}` };
  }

  if (!res.ok) {
    const message = json?.error || json?.message || `Request failed with HTTP status ${res.status}`;
    const error: any = new Error(message);
    error.status = res.status;
    error.data = json;
    throw error;
  }

  return json as T;
}

/**
 * Helper for endpoints that return { success: boolean, ... } where callers
 * inspect the result object directly for error messages.
 */
async function handleStructuredResponse(res: Response): Promise<any> {
  const text = await res.text();
  let json: any = null;

  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { success: false, error: text || `HTTP ${res.status}: ${res.statusText}` };
  }

  if (!res.ok && json.success !== false) {
    json.success = false;
    json.error = json.error || json.message || `Request failed with status ${res.status}`;
  }

  return json;
}

export const api = {
  // Website Content & Profile
  async getContent() {
    const res = await fetch(`${API_BASE_URL}/content`);
    const json = await handleResponse<{ success: boolean; data: any }>(res);
    return json.data || {};
  },

  async updateContent(id: string, payload: any) {
    const res = await fetch(`${API_BASE_URL}/content/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Services
  async getServices() {
    const res = await fetch(`${API_BASE_URL}/services`);
    const json = await handleResponse<{ success: boolean; data: any[] }>(res);
    return json.data || [];
  },

  async getAllServicesAdmin() {
    const res = await fetch(`${API_BASE_URL}/services/all`, {
      headers: getAuthHeaders(),
    });
    const json = await handleResponse<{ success: boolean; data: any[] }>(res);
    return json.data || [];
  },

  async getService(slugOrId: string) {
    const res = await fetch(`${API_BASE_URL}/services/${slugOrId}`);
    const json = await handleResponse<{ success: boolean; data: any }>(res);
    return json.data || null;
  },

  async createService(serviceData: any) {
    const res = await fetch(`${API_BASE_URL}/services`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(serviceData),
    });
    return handleResponse(res);
  },

  async updateService(id: string, serviceData: any) {
    const res = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(serviceData),
    });
    return handleResponse(res);
  },

  async deleteService(id: string) {
    const res = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Portfolio
  async getPortfolioCategories() {
    const res = await fetch(`${API_BASE_URL}/portfolio/categories`);
    const json = await handleResponse<{ success: boolean; data: any[] }>(res);
    return json.data || [];
  },

  async getPortfolio(category?: string, featured?: boolean) {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (featured) params.append('featured', 'true');
    const url = `${API_BASE_URL}/portfolio${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url);
    const json = await handleResponse<{ success: boolean; data: any[] }>(res);
    return json.data || [];
  },

  async getAllPortfolioAdmin() {
    const res = await fetch(`${API_BASE_URL}/portfolio/all`, {
      headers: getAuthHeaders(),
    });
    const json = await handleResponse<{ success: boolean; data: any[] }>(res);
    return json.data || [];
  },

  async createPortfolioItem(itemData: any) {
    const res = await fetch(`${API_BASE_URL}/portfolio`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(itemData),
    });
    return handleResponse(res);
  },

  async updatePortfolioItem(id: string, itemData: any) {
    const res = await fetch(`${API_BASE_URL}/portfolio/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(itemData),
    });
    return handleResponse(res);
  },

  async deletePortfolioItem(id: string) {
    const res = await fetch(`${API_BASE_URL}/portfolio/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Customer Enquiries
  async submitEnquiry(enquiry: {
    full_name: string;
    email: string;
    phone: string;
    interested_service: string;
    message: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enquiry),
    });
    return handleStructuredResponse(res);
  },

  async getEnquiriesAdmin(status?: string) {
    const url = status && status !== 'all' ? `${API_BASE_URL}/enquiries?status=${status}` : `${API_BASE_URL}/enquiries`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    const json = await handleResponse<{ success: boolean; data: any[] }>(res);
    return json.data || [];
  },

  async updateEnquiryStatus(id: string, status: string, internal_notes?: string) {
    const res = await fetch(`${API_BASE_URL}/enquiries/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, internal_notes }),
    });
    return handleResponse(res);
  },

  async deleteEnquiry(id: string) {
    const res = await fetch(`${API_BASE_URL}/enquiries/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Customer Quotations
  async submitQuotation(quotation: {
    full_name: string;
    email: string;
    phone: string;
    event_type: string;
    event_date: string;
    event_location: string;
    required_services: string[];
    estimated_budget?: string;
    additional_requirements?: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/quotations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quotation),
    });
    return handleStructuredResponse(res);
  },

  async getQuotationsAdmin(status?: string) {
    const url = status && status !== 'all' ? `${API_BASE_URL}/quotations?status=${status}` : `${API_BASE_URL}/quotations`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    const json = await handleResponse<{ success: boolean; data: any[] }>(res);
    return json.data || [];
  },

  async updateQuotationStatus(id: string, status: string, internal_notes?: string) {
    const res = await fetch(`${API_BASE_URL}/quotations/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, internal_notes }),
    });
    return handleResponse(res);
  },

  async deleteQuotation(id: string) {
    const res = await fetch(`${API_BASE_URL}/quotations/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // File Upload (Never sets Content-Type for FormData, lets browser set boundary)
  async uploadFile(file: File) {
    const token = localStorage.getItem('lumina_admin_token');
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    return handleStructuredResponse(res);
  },

  // Authentication & Admin Dashboard Stats
  async loginAdmin(credentials: { email: string; password: string }) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleStructuredResponse(res);
  },

  async verifyAuth() {
    const res = await fetch(`${API_BASE_URL}/auth/verify`, {
      headers: getAuthHeaders(),
    });
    return handleStructuredResponse(res);
  },

  async getAdminStats() {
    const res = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: getAuthHeaders(),
    });
    const json = await handleResponse<{ success: boolean; data: any }>(res);
    return json.data || null;
  },
};
