const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { createClient } = require('@supabase/supabase-js');
const config = require('../config');
const initialSeed = require('./initialSeed');

// UUID format validation regex (RFC 4122)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function sanitizeUUID(id) {
  if (!id) return null;
  const str = String(id).trim();
  if (str === '') return null;
  if (UUID_REGEX.test(str)) return str;
  return null;
}

// Data storage directory for fallback development offline persistence
const dataDir = path.join(__dirname, '../../data');
const storePath = path.join(dataDir, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function getLocalStore() {
  if (config.isProduction) {
    throw new Error('FATAL: Reading from local store.json is strictly forbidden in production mode.');
  }
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
  if (config.isProduction) {
    throw new Error('FATAL: Writing to local store.json is strictly forbidden in production mode.');
  }
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
  config.supabase.serviceRoleKey
);

if (isSupabaseConfigured) {
  supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  console.log('✅ Supabase PostgreSQL Client initialized with:', config.supabase.url);
} else {
  if (config.isProduction) {
    console.error('❌ FATAL: Production mode requires valid Supabase credentials (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY).');
  } else {
    console.log('ℹ️ Running in DEVELOPMENT mode with persistent local JSON database (Supabase not configured).');
  }
}

function assertDatabaseAvailable() {
  if (config.isProduction && !isSupabaseConfigured) {
    throw new Error('Production database error: Supabase is not configured. Live PostgreSQL connection is required.');
  }
}

module.exports = {
  isSupabaseConfigured: () => isSupabaseConfigured,
  getSupabaseClient: () => supabase,
  sanitizeUUID,

  // ==========================================
  // WEBSITE CONTENT
  // ==========================================
  async getAllWebsiteContent() {
    assertDatabaseAvailable();
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('website_content').select('*');
      if (error) {
        throw new Error(`Failed to fetch website content from Supabase: ${error.message}`);
      }
      return data || [];
    }

    const store = getLocalStore();
    return store.website_content || [];
  },

  async getWebsiteContent(id) {
    assertDatabaseAvailable();
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('website_content').select('*').eq('id', id).maybeSingle();
      if (error) {
        throw new Error(`Failed to fetch website content "${id}" from Supabase: ${error.message}`);
      }
      return data || null;
    }

    const store = getLocalStore();
    return store.website_content?.find((item) => item.id === id) || null;
  },

  async updateWebsiteContent(id, dataPayload) {
    assertDatabaseAvailable();
    const updatedAt = new Date().toISOString();

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('website_content')
        .upsert({ id, data: dataPayload, updated_at: updatedAt })
        .select()
        .single();
      if (error) {
        throw new Error(`Failed to update website content "${id}" in Supabase: ${error.message}`);
      }
      return data;
    }

    const store = getLocalStore();
    const index = (store.website_content || []).findIndex((item) => item.id === id);
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
    assertDatabaseAvailable();
    if (isSupabaseConfigured) {
      let query = supabase.from('services').select('*').order('order_index', { ascending: true });
      if (publishedOnly) {
        query = query.eq('is_published', true);
      }
      const { data, error } = await query;
      if (error) {
        throw new Error(`Failed to fetch services from Supabase: ${error.message}`);
      }
      return data || [];
    }

    const store = getLocalStore();
    let items = store.services || [];
    if (publishedOnly) {
      items = items.filter((s) => s.is_published);
    }
    return items.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  },

  async getServiceBySlug(slug) {
    assertDatabaseAvailable();
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('services').select('*').eq('slug', slug).maybeSingle();
      if (error) {
        throw new Error(`Failed to fetch service by slug "${slug}" from Supabase: ${error.message}`);
      }
      return data || null;
    }

    const store = getLocalStore();
    return store.services?.find((s) => s.slug === slug) || null;
  },

  async getServiceById(id) {
    assertDatabaseAvailable();
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('services').select('*').eq('id', id).maybeSingle();
      if (error) {
        throw new Error(`Failed to fetch service by ID from Supabase: ${error.message}`);
      }
      return data || null;
    }

    const store = getLocalStore();
    return store.services?.find((s) => s.id === id) || null;
  },

  async createService(serviceData) {
    assertDatabaseAvailable();
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
      const { data, error } = await supabase.from('services').insert([newService]).select().single();
      if (error) {
        throw new Error(`Failed to create service in Supabase: ${error.message}`);
      }
      return data;
    }

    const store = getLocalStore();
    store.services.push(newService);
    saveLocalStore(store);
    return newService;
  },

  async updateService(id, updates) {
    assertDatabaseAvailable();
    const updatedAt = new Date().toISOString();
    const updatedPayload = { ...updates, updated_at: updatedAt };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('services').update(updatedPayload).eq('id', id).select().maybeSingle();
      if (error) {
        throw new Error(`Failed to update service in Supabase: ${error.message}`);
      }
      return data || null;
    }

    const store = getLocalStore();
    const index = store.services.findIndex((s) => s.id === id);
    if (index === -1) return null;

    store.services[index] = { ...store.services[index], ...updatedPayload };
    saveLocalStore(store);
    return store.services[index];
  },

  async deleteService(id) {
    assertDatabaseAvailable();
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) {
        throw new Error(`Failed to delete service from Supabase: ${error.message}`);
      }
      return true;
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
    assertDatabaseAvailable();
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('portfolio_categories').select('*').order('order_index', { ascending: true });
      if (error) {
        throw new Error(`Failed to fetch portfolio categories from Supabase: ${error.message}`);
      }
      return data || [];
    }

    const store = getLocalStore();
    return store.portfolio_categories || [];
  },

  async createPortfolioCategory(catData) {
    assertDatabaseAvailable();
    const newCat = {
      id: uuidv4(),
      name: catData.name,
      slug: catData.slug || catData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: catData.description || '',
      order_index: Number(catData.order_index) || 0,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('portfolio_categories').insert([newCat]).select().single();
      if (error) {
        throw new Error(`Failed to create portfolio category in Supabase: ${error.message}`);
      }
      return data;
    }

    const store = getLocalStore();
    store.portfolio_categories.push(newCat);
    saveLocalStore(store);
    return newCat;
  },

  async getPortfolioItems({ category, featuredOnly = false, publishedOnly = true } = {}) {
    assertDatabaseAvailable();
    if (isSupabaseConfigured) {
      let query = supabase.from('portfolio_items').select('*').order('order_index', { ascending: true });
      if (publishedOnly) query = query.eq('is_published', true);
      if (featuredOnly) query = query.eq('is_featured', true);
      const { data, error } = await query;
      if (error) {
        throw new Error(`Failed to fetch portfolio items from Supabase: ${error.message}`);
      }
      let items = data || [];
      if (category && category !== 'all') {
        items = items.filter((item) => item.category_slug === category || item.category_id === category);
      }
      return items;
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
    assertDatabaseAvailable();
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('portfolio_items').select('*').eq('id', id).maybeSingle();
      if (error) {
        throw new Error(`Failed to fetch portfolio item by ID from Supabase: ${error.message}`);
      }
      return data || null;
    }

    const store = getLocalStore();
    return store.portfolio_items?.find((p) => p.id === id) || null;
  },

  async createPortfolioItem(itemData) {
    assertDatabaseAvailable();
    // CRITICAL: Ensure category_id is either a valid UUID or null, NEVER empty string
    const validCategoryId = sanitizeUUID(itemData.category_id);

    const newItem = {
      id: uuidv4(),
      category_id: validCategoryId,
      category_slug: itemData.category_slug || itemData.category || '',
      title: itemData.title,
      slug: itemData.slug || itemData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
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
      const { data, error } = await supabase.from('portfolio_items').insert([newItem]).select().single();
      if (error) {
        throw new Error(`Failed to create portfolio item in Supabase: ${error.message}`);
      }
      return data;
    }

    const store = getLocalStore();
    store.portfolio_items.push(newItem);
    saveLocalStore(store);
    return newItem;
  },

  async updatePortfolioItem(id, updates) {
    assertDatabaseAvailable();
    const updatedAt = new Date().toISOString();
    const updatedPayload = { ...updates, updated_at: updatedAt };

    // CRITICAL: Ensure category_id is valid UUID or null if provided
    if ('category_id' in updatedPayload) {
      updatedPayload.category_id = sanitizeUUID(updatedPayload.category_id);
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('portfolio_items').update(updatedPayload).eq('id', id).select().maybeSingle();
      if (error) {
        throw new Error(`Failed to update portfolio item in Supabase: ${error.message}`);
      }
      return data || null;
    }

    const store = getLocalStore();
    const index = store.portfolio_items.findIndex((p) => p.id === id);
    if (index === -1) return null;

    store.portfolio_items[index] = { ...store.portfolio_items[index], ...updatedPayload };
    saveLocalStore(store);
    return store.portfolio_items[index];
  },

  async deletePortfolioItem(id) {
    assertDatabaseAvailable();
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('portfolio_items').delete().eq('id', id);
      if (error) {
        throw new Error(`Failed to delete portfolio item from Supabase: ${error.message}`);
      }
      return true;
    }

    const store = getLocalStore();
    const index = store.portfolio_items.findIndex((p) => p.id === id);
    if (index === -1) return false;

    store.portfolio_items.splice(index, 1);
    saveLocalStore(store);
    return true;
  },

  // ==========================================
  // ENQUIRIES (Private Customer Leads)
  // ==========================================
  async getEnquiries({ status } = {}) {
    assertDatabaseAvailable();
    if (isSupabaseConfigured) {
      let query = supabase.from('enquiries').select('*').order('created_at', { ascending: false });
      if (status && status !== 'all') query = query.eq('status', status);
      const { data, error } = await query;
      if (error) {
        throw new Error(`Failed to fetch enquiries from Supabase: ${error.message}`);
      }
      return data || [];
    }

    const store = getLocalStore();
    let items = store.enquiries || [];
    if (status && status !== 'all') {
      items = items.filter((e) => e.status === status);
    }
    return items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async getEnquiryById(id) {
    assertDatabaseAvailable();
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('enquiries').select('*').eq('id', id).maybeSingle();
      if (error) {
        throw new Error(`Failed to fetch enquiry by ID from Supabase: ${error.message}`);
      }
      return data || null;
    }

    const store = getLocalStore();
    return store.enquiries?.find((e) => e.id === id) || null;
  },

  async createEnquiry(enquiryData) {
    assertDatabaseAvailable();
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
      const { data, error } = await supabase.from('enquiries').insert([newEnquiry]).select().single();
      if (error) {
        throw new Error(`Failed to insert enquiry in Supabase: ${error.message}`);
      }
      return data;
    }

    const store = getLocalStore();
    store.enquiries.unshift(newEnquiry);
    saveLocalStore(store);
    return newEnquiry;
  },

  async updateEnquiry(id, { status, internal_notes }) {
    assertDatabaseAvailable();
    const updatedAt = new Date().toISOString();
    const payload = {};
    if (status) payload.status = status;
    if (internal_notes !== undefined) payload.internal_notes = internal_notes;
    payload.updated_at = updatedAt;

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('enquiries').update(payload).eq('id', id).select().maybeSingle();
      if (error) {
        throw new Error(`Failed to update enquiry in Supabase: ${error.message}`);
      }
      return data || null;
    }

    const store = getLocalStore();
    const index = store.enquiries.findIndex((e) => e.id === id);
    if (index === -1) return null;

    store.enquiries[index] = { ...store.enquiries[index], ...payload };
    saveLocalStore(store);
    return store.enquiries[index];
  },

  async deleteEnquiry(id) {
    assertDatabaseAvailable();
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('enquiries').delete().eq('id', id);
      if (error) {
        throw new Error(`Failed to delete enquiry from Supabase: ${error.message}`);
      }
      return true;
    }

    const store = getLocalStore();
    const index = store.enquiries.findIndex((e) => e.id === id);
    if (index === -1) return false;

    store.enquiries.splice(index, 1);
    saveLocalStore(store);
    return true;
  },

  // ==========================================
  // QUOTATIONS (Private Customer Requests)
  // ==========================================
  async getQuotations({ status } = {}) {
    assertDatabaseAvailable();
    if (isSupabaseConfigured) {
      let query = supabase.from('quotation_requests').select('*').order('created_at', { ascending: false });
      if (status && status !== 'all') query = query.eq('status', status);
      const { data, error } = await query;
      if (error) {
        throw new Error(`Failed to fetch quotations from Supabase: ${error.message}`);
      }
      return data || [];
    }

    const store = getLocalStore();
    let items = store.quotation_requests || [];
    if (status && status !== 'all') {
      items = items.filter((q) => q.status === status);
    }
    return items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async getQuotationById(id) {
    assertDatabaseAvailable();
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('quotation_requests').select('*').eq('id', id).maybeSingle();
      if (error) {
        throw new Error(`Failed to fetch quotation by ID from Supabase: ${error.message}`);
      }
      return data || null;
    }

    const store = getLocalStore();
    return store.quotation_requests?.find((q) => q.id === id) || null;
  },

  async createQuotation(quotationData) {
    assertDatabaseAvailable();
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
      const { data, error } = await supabase.from('quotation_requests').insert([newQuotation]).select().single();
      if (error) {
        throw new Error(`Failed to create quotation request in Supabase: ${error.message}`);
      }
      return data;
    }

    const store = getLocalStore();
    store.quotation_requests.unshift(newQuotation);
    saveLocalStore(store);
    return newQuotation;
  },

  async updateQuotation(id, { status, internal_notes }) {
    assertDatabaseAvailable();
    const updatedAt = new Date().toISOString();
    const payload = {};
    if (status) payload.status = status;
    if (internal_notes !== undefined) payload.internal_notes = internal_notes;
    payload.updated_at = updatedAt;

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('quotation_requests').update(payload).eq('id', id).select().maybeSingle();
      if (error) {
        throw new Error(`Failed to update quotation in Supabase: ${error.message}`);
      }
      return data || null;
    }

    const store = getLocalStore();
    const index = store.quotation_requests.findIndex((q) => q.id === id);
    if (index === -1) return null;

    store.quotation_requests[index] = { ...store.quotation_requests[index], ...payload };
    saveLocalStore(store);
    return store.quotation_requests[index];
  },

  async deleteQuotation(id) {
    assertDatabaseAvailable();
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('quotation_requests').delete().eq('id', id);
      if (error) {
        throw new Error(`Failed to delete quotation from Supabase: ${error.message}`);
      }
      return true;
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
    assertDatabaseAvailable();
    if (isSupabaseConfigured) {
      // Execute parallel count and recent records queries on Supabase
      const [
        totalEnqRes,
        pendingEnqRes,
        totalQuotRes,
        pendingQuotRes,
        totalSrvRes,
        pubSrvRes,
        pubPortRes,
        recentEnqRes,
        recentQuotRes,
      ] = await Promise.all([
        supabase.from('enquiries').select('*', { count: 'exact', head: true }),
        supabase.from('enquiries').select('*', { count: 'exact', head: true }).in('status', ['new', 'in_progress']),
        supabase.from('quotation_requests').select('*', { count: 'exact', head: true }),
        supabase.from('quotation_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('services').select('*', { count: 'exact', head: true }),
        supabase.from('services').select('*', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('portfolio_items').select('*', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('enquiries').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('quotation_requests').select('*').order('created_at', { ascending: false }).limit(5),
      ]);

      if (totalEnqRes.error) throw new Error(`Supabase dashboard count error: ${totalEnqRes.error.message}`);
      if (totalQuotRes.error) throw new Error(`Supabase dashboard count error: ${totalQuotRes.error.message}`);

      return {
        totalEnquiries: totalEnqRes.count || 0,
        pendingEnquiries: pendingEnqRes.count || 0,
        totalQuotations: totalQuotRes.count || 0,
        pendingQuotations: pendingQuotRes.count || 0,
        totalServices: totalSrvRes.count || 0,
        publishedServices: pubSrvRes.count || 0,
        publishedPortfolio: pubPortRes.count || 0,
        recentEnquiries: recentEnqRes.data || [],
        recentQuotations: recentQuotRes.data || [],
      };
    }

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

  // ==========================================
  // ADMINS HELPER QUERIES
  // ==========================================
  async getAdminBySupabaseId(supabaseUserId) {
    assertDatabaseAvailable();
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('supabase_user_id', supabaseUserId)
        .eq('is_active', true)
        .maybeSingle();
      if (error) {
        throw new Error(`Failed to query admin by Supabase Auth UUID: ${error.message}`);
      }
      return data || null;
    }

    const store = getLocalStore();
    return (store.admins || []).find((a) => a.supabase_user_id === supabaseUserId && a.is_active) || null;
  },

  async getAdminByEmail(email) {
    assertDatabaseAvailable();
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('is_active', true)
        .maybeSingle();
      if (error) {
        throw new Error(`Failed to query admin by email: ${error.message}`);
      }
      return data || null;
    }

    const store = getLocalStore();
    return (store.admins || []).find((a) => a.email && a.email.toLowerCase() === email.toLowerCase() && a.is_active) || null;
  },
};
