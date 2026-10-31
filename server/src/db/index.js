const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { createClient } = require('@supabase/supabase-js');
const config = require('../config');
const initialSeed = require('./initialSeed');

// Data storage directory for fallback offline / dev persistence
const dataDir = path.join(__dirname, '../../data');
const storePath = path.join(dataDir, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize persistent store if not exists
function getLocalStore() {
  try {
    if (!fs.existsSync(storePath)) {
      fs.writeFileSync(storePath, JSON.stringify(initialSeed, null, 2), 'utf-8');
      return JSON.parse(JSON.stringify(initialSeed));
    }
    const content = fs.readFileSync(storePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading local store:', err);
    return JSON.parse(JSON.stringify(initialSeed));
  }
}

function saveLocalStore(data) {
  try {
    fs.writeFileSync(storePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving local store:', err);
  }
}

// Initialize Supabase Client if credentials are provided
let supabase = null;
const isSupabaseConfigured = Boolean(
  config.supabase.url &&
  config.supabase.url.includes('supabase.co') &&
  (config.supabase.serviceRoleKey || config.supabase.anonKey)
);

if (isSupabaseConfigured) {
  const key = config.supabase.serviceRoleKey || config.supabase.anonKey;
  supabase = createClient(config.supabase.url, key, {
    auth: { persistSession: false },
  });
  console.log('✅ Supabase PostgreSQL Client initialized with:', config.supabase.url);
} else {
  console.log('ℹ️ Running with persistent local database engine (Supabase credentials not yet set).');
}

// Exported Database Layer
module.exports = {
  isSupabaseConfigured: () => isSupabaseConfigured,
  getSupabaseClient: () => supabase,

  // ==========================================
  // WEBSITE CONTENT
  // ==========================================
  async getAllWebsiteContent() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('website_content').select('*');
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase query failed, falling back to local store:', err.message);
      }
    }
    const store = getLocalStore();
    return store.website_content || [];
  },

  async getWebsiteContent(id) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('website_content').select('*').eq('id', id).single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase query failed, falling back to local store:', err.message);
      }
    }
    const store = getLocalStore();
    return store.website_content.find((item) => item.id === id) || null;
  },

  async updateWebsiteContent(id, dataPayload) {
    const updatedAt = new Date().toISOString();
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('website_content')
          .upsert({ id, data: dataPayload, updated_at: updatedAt })
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase upsert failed, updating local store:', err.message);
      }
    }
    const store = getLocalStore();
    const index = store.website_content.findIndex((item) => item.id === id);
    if (index >= 0) {
      store.website_content[index] = {
        ...store.website_content[index],
        data: dataPayload,
        updated_at: updatedAt,
      };
    } else {
      store.website_content.push({
        id,
        title: id,
        data: dataPayload,
        updated_at: updatedAt,
      });
    }
    saveLocalStore(store);
    return store.website_content.find((item) => item.id === id);
  },

  // ==========================================
  // SERVICES
  // ==========================================
  async getServices({ publishedOnly = true } = {}) {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('services').select('*').order('order_index', { ascending: true });
        if (publishedOnly) {
          query = query.eq('is_published', true);
        }
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase query failed, falling back to local store:', err.message);
      }
    }
    const store = getLocalStore();
    let items = store.services || [];
    if (publishedOnly) {
      items = items.filter((s) => s.is_published);
    }
    return items.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  },

  async getServiceBySlug(slug) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('services').select('*').eq('slug', slug).single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase query failed, falling back to local store:', err.message);
      }
    }
    const store = getLocalStore();
    return store.services.find((s) => s.slug === slug) || null;
  },

  async getServiceById(id) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('services').select('*').eq('id', id).single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase query failed, falling back to local store:', err.message);
      }
    }
    const store = getLocalStore();
    return store.services.find((s) => s.id === id) || null;
  },

  async createService(serviceData) {
    const newService = {
      id: uuidv4(),
      slug: serviceData.slug || serviceData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      title: serviceData.title,
      category: serviceData.category,
      short_description: serviceData.short_description,
      full_description: serviceData.full_description,
      features: Array.isArray(serviceData.features) ? serviceData.features : [],
      image_url: serviceData.image_url || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop',
      starting_price: serviceData.starting_price || 'On Consultation',
      turnaround_time: serviceData.turnaround_time || '3 - 5 Days',
      is_published: serviceData.is_published !== false,
      order_index: Number(serviceData.order_index) || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('services').insert([newService]).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase insert failed, saving to local store:', err.message);
      }
    }

    const store = getLocalStore();
    store.services.push(newService);
    saveLocalStore(store);
    return newService;
  },

  async updateService(id, updates) {
    const updatedAt = new Date().toISOString();
    const updatedPayload = { ...updates, updated_at: updatedAt };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('services').update(updatedPayload).eq('id', id).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase update failed, updating local store:', err.message);
      }
    }

    const store = getLocalStore();
    const index = store.services.findIndex((s) => s.id === id);
    if (index === -1) return null;

    store.services[index] = { ...store.services[index], ...updatedPayload };
    saveLocalStore(store);
    return store.services[index];
  },

  async deleteService(id) {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('services').delete().eq('id', id);
        if (!error) return true;
      } catch (err) {
        console.warn('Supabase delete failed, deleting from local store:', err.message);
      }
    }

    const store = getLocalStore();
    const index = store.services.findIndex((s) => s.id === id);
    if (index === -1) return false;

    store.services.splice(index, 1);
    saveLocalStore(store);
    return true;
  },

  // ==========================================
  // PORTFOLIO & CATEGORIES
  // ==========================================
  async getPortfolioCategories() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('portfolio_categories').select('*').order('order_index', { ascending: true });
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase query failed, falling back to local store:', err.message);
      }
    }
    const store = getLocalStore();
    return store.portfolio_categories || [];
  },

  async createPortfolioCategory(catData) {
    const newCat = {
      id: uuidv4(),
      name: catData.name,
      slug: catData.slug || catData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: catData.description || '',
      order_index: Number(catData.order_index) || 0,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('portfolio_categories').insert([newCat]).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase category insert failed:', err.message);
      }
    }

    const store = getLocalStore();
    store.portfolio_categories.push(newCat);
    saveLocalStore(store);
    return newCat;
  },

  async getPortfolioItems({ category, featuredOnly = false, publishedOnly = true } = {}) {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('portfolio_items').select('*').order('order_index', { ascending: true });
        if (publishedOnly) query = query.eq('is_published', true);
        if (featuredOnly) query = query.eq('is_featured', true);
        const { data, error } = await query;
        if (!error && data) {
          if (category && category !== 'all') {
            return data.filter((item) => item.category_slug === category || item.category_id === category);
          }
          return data;
        }
      } catch (err) {
        console.warn('Supabase query failed, falling back to local store:', err.message);
      }
    }

    const store = getLocalStore();
    let items = store.portfolio_items || [];
    if (publishedOnly) items = items.filter((p) => p.is_published);
    if (featuredOnly) items = items.filter((p) => p.is_featured);
    if (category && category !== 'all') {
      items = items.filter((p) => p.category_slug === category || p.category_id === category);
    }
    return items.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  },

  async getPortfolioItemById(id) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('portfolio_items').select('*').eq('id', id).single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase query failed:', err.message);
      }
    }
    const store = getLocalStore();
    return store.portfolio_items.find((p) => p.id === id) || null;
  },

  async createPortfolioItem(itemData) {
    const newItem = {
      id: uuidv4(),
      category_id: itemData.category_id || '',
      category_slug: itemData.category_slug || itemData.category || '',
      title: itemData.title,
      slug: itemData.slug || itemData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: itemData.description || '',
      client_name: itemData.client_name || '',
      event_date: itemData.event_date || new Date().toISOString().split('T')[0],
      image_url: itemData.image_url,
      gallery_images: Array.isArray(itemData.gallery_images) ? itemData.gallery_images : [],
      is_featured: Boolean(itemData.is_featured),
      is_published: itemData.is_published !== false,
      order_index: Number(itemData.order_index) || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('portfolio_items').insert([newItem]).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase portfolio item insert failed:', err.message);
      }
    }

    const store = getLocalStore();
    store.portfolio_items.push(newItem);
    saveLocalStore(store);
    return newItem;
  },

  async updatePortfolioItem(id, updates) {
    const updatedAt = new Date().toISOString();
    const updatedPayload = { ...updates, updated_at: updatedAt };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('portfolio_items').update(updatedPayload).eq('id', id).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase portfolio update failed:', err.message);
      }
    }

    const store = getLocalStore();
    const index = store.portfolio_items.findIndex((p) => p.id === id);
    if (index === -1) return null;

    store.portfolio_items[index] = { ...store.portfolio_items[index], ...updatedPayload };
    saveLocalStore(store);
    return store.portfolio_items[index];
  },

  async deletePortfolioItem(id) {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('portfolio_items').delete().eq('id', id);
        if (!error) return true;
      } catch (err) {
        console.warn('Supabase portfolio delete failed:', err.message);
      }
    }

    const store = getLocalStore();
    const index = store.portfolio_items.findIndex((p) => p.id === id);
    if (index === -1) return false;

    store.portfolio_items.splice(index, 1);
    saveLocalStore(store);
    return true;
  },

  // ==========================================
  // ENQUIRIES
  // ==========================================
  async getEnquiries({ status } = {}) {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('enquiries').select('*').order('created_at', { ascending: false });
        if (status && status !== 'all') query = query.eq('status', status);
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase enquiries query failed:', err.message);
      }
    }

    const store = getLocalStore();
    let items = store.enquiries || [];
    if (status && status !== 'all') {
      items = items.filter((e) => e.status === status);
    }
    return items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async getEnquiryById(id) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('enquiries').select('*').eq('id', id).single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase query failed:', err.message);
      }
    }
    const store = getLocalStore();
    return store.enquiries.find((e) => e.id === id) || null;
  },

  async createEnquiry(enquiryData) {
    const newEnquiry = {
      id: uuidv4(),
      full_name: enquiryData.full_name,
      email: enquiryData.email,
      phone: enquiryData.phone,
      interested_service: enquiryData.interested_service,
      message: enquiryData.message,
      status: 'new',
      internal_notes: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('enquiries').insert([newEnquiry]).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase enquiry insert failed:', err.message);
      }
    }

    const store = getLocalStore();
    store.enquiries.unshift(newEnquiry);
    saveLocalStore(store);
    return newEnquiry;
  },

  async updateEnquiry(id, { status, internal_notes }) {
    const updatedAt = new Date().toISOString();
    const payload = {};
    if (status) payload.status = status;
    if (internal_notes !== undefined) payload.internal_notes = internal_notes;
    payload.updated_at = updatedAt;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('enquiries').update(payload).eq('id', id).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase enquiry update failed:', err.message);
      }
    }

    const store = getLocalStore();
    const index = store.enquiries.findIndex((e) => e.id === id);
    if (index === -1) return null;

    store.enquiries[index] = { ...store.enquiries[index], ...payload };
    saveLocalStore(store);
    return store.enquiries[index];
  },

  async deleteEnquiry(id) {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('enquiries').delete().eq('id', id);
        if (!error) return true;
      } catch (err) {
        console.warn('Supabase enquiry delete failed:', err.message);
      }
    }

    const store = getLocalStore();
    const index = store.enquiries.findIndex((e) => e.id === id);
    if (index === -1) return false;

    store.enquiries.splice(index, 1);
    saveLocalStore(store);
    return true;
  },

  // ==========================================
  // QUOTATIONS
  // ==========================================
  async getQuotations({ status } = {}) {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('quotation_requests').select('*').order('created_at', { ascending: false });
        if (status && status !== 'all') query = query.eq('status', status);
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase quotations query failed:', err.message);
      }
    }

    const store = getLocalStore();
    let items = store.quotation_requests || [];
    if (status && status !== 'all') {
      items = items.filter((q) => q.status === status);
    }
    return items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async getQuotationById(id) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('quotation_requests').select('*').eq('id', id).single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase quotation query failed:', err.message);
      }
    }
    const store = getLocalStore();
    return store.quotation_requests.find((q) => q.id === id) || null;
  },

  async createQuotation(quotationData) {
    const newQuotation = {
      id: uuidv4(),
      full_name: quotationData.full_name,
      email: quotationData.email,
      phone: quotationData.phone,
      event_type: quotationData.event_type,
      event_date: quotationData.event_date,
      event_location: quotationData.event_location,
      required_services: Array.isArray(quotationData.required_services) ? quotationData.required_services : [],
      estimated_budget: quotationData.estimated_budget || 'Unspecified',
      additional_requirements: quotationData.additional_requirements || '',
      status: 'pending',
      internal_notes: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('quotation_requests').insert([newQuotation]).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase quotation insert failed:', err.message);
      }
    }

    const store = getLocalStore();
    store.quotation_requests.unshift(newQuotation);
    saveLocalStore(store);
    return newQuotation;
  },

  async updateQuotation(id, { status, internal_notes }) {
    const updatedAt = new Date().toISOString();
    const payload = {};
    if (status) payload.status = status;
    if (internal_notes !== undefined) payload.internal_notes = internal_notes;
    payload.updated_at = updatedAt;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('quotation_requests').update(payload).eq('id', id).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase quotation update failed:', err.message);
      }
    }

    const store = getLocalStore();
    const index = store.quotation_requests.findIndex((q) => q.id === id);
    if (index === -1) return null;

    store.quotation_requests[index] = { ...store.quotation_requests[index], ...payload };
    saveLocalStore(store);
    return store.quotation_requests[index];
  },

  async deleteQuotation(id) {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('quotation_requests').delete().eq('id', id);
        if (!error) return true;
      } catch (err) {
        console.warn('Supabase quotation delete failed:', err.message);
      }
    }

    const store = getLocalStore();
    const index = store.quotation_requests.findIndex((q) => q.id === id);
    if (index === -1) return false;

    store.quotation_requests.splice(index, 1);
    saveLocalStore(store);
    return true;
  },

  // ==========================================
  // DASHBOARD AGGREGATED METRICS
  // ==========================================
  async getDashboardStats() {
    const store = getLocalStore();
    const enquiries = store.enquiries || [];
    const quotations = store.quotation_requests || [];
    const services = store.services || [];
    const portfolio = store.portfolio_items || [];

    return {
      totalEnquiries: enquiries.length,
      pendingEnquiries: enquiries.filter((e) => e.status === 'new' || e.status === 'in_progress').length,
      totalQuotations: quotations.length,
      pendingQuotations: quotations.filter((q) => q.status === 'pending').length,
      totalServices: services.length,
      publishedServices: services.filter((s) => s.is_published).length,
      publishedPortfolio: portfolio.filter((p) => p.is_published).length,
      recentEnquiries: enquiries.slice(0, 5),
      recentQuotations: quotations.slice(0, 5),
    };
  },
};
