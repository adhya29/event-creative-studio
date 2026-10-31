// API client for communicating with the Express backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('lumina_admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const api = {
  // Website Content & Profile
  async getContent() {
    const res = await fetch(`${API_BASE_URL}/content`);
    const data = await res.json();
    return data.data || {};
  },

  async updateContent(id: string, payload: any) {
    const res = await fetch(`${API_BASE_URL}/content/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Services
  async getServices() {
    const res = await fetch(`${API_BASE_URL}/services`);
    const data = await res.json();
    return data.data || [];
  },

  async getAllServicesAdmin() {
    const res = await fetch(`${API_BASE_URL}/services/all`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.data || [];
  },

  async getService(slugOrId: string) {
    const res = await fetch(`${API_BASE_URL}/services/${slugOrId}`);
    const data = await res.json();
    return data.data || null;
  },

  async createService(serviceData: any) {
    const res = await fetch(`${API_BASE_URL}/services`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(serviceData),
    });
    return res.json();
  },

  async updateService(id: string, serviceData: any) {
    const res = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(serviceData),
    });
    return res.json();
  },

  async deleteService(id: string) {
    const res = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Portfolio
  async getPortfolioCategories() {
    const res = await fetch(`${API_BASE_URL}/portfolio/categories`);
    const data = await res.json();
    return data.data || [];
  },

  async getPortfolio(category?: string, featured?: boolean) {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (featured) params.append('featured', 'true');
    const url = `${API_BASE_URL}/portfolio?${params.toString()}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.data || [];
  },

  async getAllPortfolioAdmin() {
    const res = await fetch(`${API_BASE_URL}/portfolio/all`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.data || [];
  },

  async createPortfolioItem(itemData: any) {
    const res = await fetch(`${API_BASE_URL}/portfolio`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(itemData),
    });
    return res.json();
  },

  async updatePortfolioItem(id: string, itemData: any) {
    const res = await fetch(`${API_BASE_URL}/portfolio/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(itemData),
    });
    return res.json();
  },

  async deletePortfolioItem(id: string) {
    const res = await fetch(`${API_BASE_URL}/portfolio/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Enquiries
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
    return res.json();
  },

  async getEnquiriesAdmin(status?: string) {
    const url = status && status !== 'all' ? `${API_BASE_URL}/enquiries?status=${status}` : `${API_BASE_URL}/enquiries`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    const data = await res.json();
    return data.data || [];
  },

  async updateEnquiryStatus(id: string, status: string, internal_notes?: string) {
    const res = await fetch(`${API_BASE_URL}/enquiries/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, internal_notes }),
    });
    return res.json();
  },

  async deleteEnquiry(id: string) {
    const res = await fetch(`${API_BASE_URL}/enquiries/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Quotations
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
    return res.json();
  },

  async getQuotationsAdmin(status?: string) {
    const url = status && status !== 'all' ? `${API_BASE_URL}/quotations?status=${status}` : `${API_BASE_URL}/quotations`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    const data = await res.json();
    return data.data || [];
  },

  async updateQuotationStatus(id: string, status: string, internal_notes?: string) {
    const res = await fetch(`${API_BASE_URL}/quotations/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, internal_notes }),
    });
    return res.json();
  },

  async deleteQuotation(id: string) {
    const res = await fetch(`${API_BASE_URL}/quotations/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // File Upload
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
    return res.json();
  },

  // Authentication & Admin Dashboard Stats
  async loginAdmin(credentials: { email: string; password: string }) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return res.json();
  },

  async verifyAuth() {
    const res = await fetch(`${API_BASE_URL}/auth/verify`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getAdminStats() {
    const res = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.data || null;
  },
};
