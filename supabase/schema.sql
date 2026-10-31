-- ============================================================================
-- EVENT PHOTOGRAPHY & CREATIVE SERVICES STUDIO — DATABASE SCHEMA (PostgreSQL)
-- Compatible with Supabase PostgreSQL & Standard PostgreSQL 14+
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. ADMINS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supabase_user_id UUID UNIQUE, -- Links to auth.users if Supabase Auth is active
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- Securely hashed credential fallback
    full_name VARCHAR(255) NOT NULL DEFAULT 'Studio Administrator',
    role VARCHAR(50) NOT NULL DEFAULT 'super_admin' CHECK (role IN ('super_admin', 'admin', 'editor')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. SERVICES TABLE (The 6 Core Creative Services)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    short_description TEXT NOT NULL,
    full_description TEXT NOT NULL,
    features JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of deliverables/features
    image_url TEXT NOT NULL,
    starting_price VARCHAR(100) DEFAULT 'On Consultation',
    turnaround_time VARCHAR(100) DEFAULT '3 - 7 Business Days',
    is_published BOOLEAN NOT NULL DEFAULT true,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. PORTFOLIO CATEGORIES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS portfolio_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. PORTFOLIO ITEMS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS portfolio_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES portfolio_categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    client_name VARCHAR(255),
    event_date DATE,
    image_url TEXT NOT NULL,
    gallery_images JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_published BOOLEAN NOT NULL DEFAULT true,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. ENQUIRIES TABLE (Customer Contact Inquiries)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    interested_service VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'contacted', 'closed')),
    internal_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 6. QUOTATION REQUESTS TABLE (Customer Event Quotation Inquiries)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quotation_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_date VARCHAR(100) NOT NULL,
    event_location VARCHAR(255) NOT NULL,
    required_services JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of selected services
    estimated_budget VARCHAR(100),
    additional_requirements TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'quoted', 'accepted', 'declined')),
    internal_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. WEBSITE CONTENT & SETTINGS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS website_content (
    id VARCHAR(100) PRIMARY KEY, -- e.g. 'company_profile', 'homepage_hero', 'contact_details'
    title VARCHAR(255),
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- INDEXES FOR PERFORMANCE & QUERY OPTIMIZATION
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_is_published ON services(is_published);
CREATE INDEX IF NOT EXISTS idx_services_order ON services(order_index);

CREATE INDEX IF NOT EXISTS idx_portfolio_category_id ON portfolio_items(category_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_is_published ON portfolio_items(is_published);
CREATE INDEX IF NOT EXISTS idx_portfolio_is_featured ON portfolio_items(is_featured);
CREATE INDEX IF NOT EXISTS idx_portfolio_order ON portfolio_items(order_index);

CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotation_requests(status);
CREATE INDEX IF NOT EXISTS idx_quotations_created_at ON quotation_requests(created_at DESC);

-- ----------------------------------------------------------------------------
-- AUTOMATIC UPDATED_AT TRIGGER FUNCTION
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_admins_timestamp ON admins;
CREATE TRIGGER trigger_update_admins_timestamp
    BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_services_timestamp ON services;
CREATE TRIGGER trigger_update_services_timestamp
    BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_portfolio_timestamp ON portfolio_items;
CREATE TRIGGER trigger_update_portfolio_timestamp
    BEFORE UPDATE ON portfolio_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_enquiries_timestamp ON enquiries;
CREATE TRIGGER trigger_update_enquiries_timestamp
    BEFORE UPDATE ON enquiries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_quotations_timestamp ON quotation_requests;
CREATE TRIGGER trigger_update_quotations_timestamp
    BEFORE UPDATE ON quotation_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_website_content_timestamp ON website_content;
CREATE TRIGGER trigger_update_website_content_timestamp
    BEFORE UPDATE ON website_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Public can read published services, categories, portfolio, and website content
CREATE POLICY "Public can view published services" ON services
    FOR SELECT USING (is_published = true);

CREATE POLICY "Public can view portfolio categories" ON portfolio_categories
    FOR SELECT USING (true);

CREATE POLICY "Public can view published portfolio items" ON portfolio_items
    FOR SELECT USING (is_published = true);

CREATE POLICY "Public can view website content" ON website_content
    FOR SELECT USING (true);

-- Public can insert new enquiries and quotation requests
CREATE POLICY "Public can submit enquiries" ON enquiries
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can submit quotation requests" ON quotation_requests
    FOR INSERT WITH CHECK (true);

-- Authenticated admins / service role have full access
CREATE POLICY "Admins full access to services" ON services
    FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Admins full access to portfolio categories" ON portfolio_categories
    FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Admins full access to portfolio items" ON portfolio_items
    FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Admins full access to enquiries" ON enquiries
    FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Admins full access to quotation requests" ON quotation_requests
    FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Admins full access to website content" ON website_content
    FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Admins full access to admins" ON admins
    FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- ----------------------------------------------------------------------------
-- SEED DATA (All 6 Mandatory Services, Categories, Real Work, Content)
-- ----------------------------------------------------------------------------

-- Seed Website Content (Company Profile, Hero, Contact)
INSERT INTO website_content (id, title, data) VALUES
(
    'company_profile',
    'General Studio Profile & Branding',
    '{
        "company_name": "Lumina Creative Studio",
        "tagline": "Events Captured. Stories Created.",
        "phone": "+91 98765 43210",
        "email": "contact@luminacreative.studio",
        "whatsapp": "919876543210",
        "address": "402, High Street Creative Enclave, Metro Boulevard, City Center",
        "working_hours": "Mon - Sat: 9:00 AM - 7:30 PM | Sun: Event Shoots by Appointment",
        "social_links": {
            "instagram": "https://instagram.com",
            "facebook": "https://facebook.com",
            "linkedin": "https://linkedin.com",
            "youtube": "https://youtube.com"
        }
    }'::jsonb
),
(
    'homepage_hero',
    'Homepage Hero Configuration',
    '{
        "headline_line1": "Events",
        "headline_line2": "Captured.",
        "headline_line3": "Stories",
        "headline_line4": "Created.",
        "subheading": "Event photography, event management and creative design services that turn your moments into lasting memories.",
        "hero_image": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop",
        "badge_text": "Full-Service Creative Agency",
        "stats": [
            {"value": "850+", "label": "Events Documented"},
            {"value": "12+", "label": "Years Industry Craft"},
            {"value": "100%", "label": "Deliverable Excellence"}
        ]
    }'::jsonb
),
(
    'about_page',
    'About Page Studio Ethos',
    '{
        "story_headline": "Crafting visual permanence for life''s grandest milestones.",
        "story_body": "Founded with a conviction that every celebration and brand milestone deserves cinematic documentation and cohesive visual identity, Lumina Creative Studio bridges high-end event photography with comprehensive print design and event execution under one master roof.",
        "mission": "To empower brands, couples, institutions and event organizers with unforgettable visual storytelling, flawless event coordination, and tactile print materials that inspire awe.",
        "equipment_standards": "Dual-card full-frame cinema cameras, prime master glass, calibrated profoto wireless strobes, and certified archival print production."
    }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();

-- Seed the 6 Mandatory Services
INSERT INTO services (title, slug, category, short_description, full_description, features, image_url, starting_price, turnaround_time, order_index) VALUES
(
    'Event Photography',
    'event-photography',
    'photography',
    'Cinematic candid documentation, grand stage coverage, and timeless celebration portraiture.',
    'Our event photography unit captures the raw emotions, electric atmospheres, and spontaneous joys of your gathering. Equipped with dual-slot cinema sensors, fast prime lenses, and discreet low-light flashcraft, we ensure every pivotal speech, candid glance, and festive dance is preserved in heirloom clarity.',
    '["Multi-camera full-frame coverage", "Candid documentary & formal family portraiture", "Color-graded high-resolution digital master gallery", "Highlight reel for instant social media sharing", "Archival physical photo book design option"]'::jsonb,
    'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
    '₹25,000 / day',
    '5 - 7 Days',
    1
),
(
    'Event Management',
    'event-management',
    'event_management',
    'End-to-end event conceptualization, stage architecture, audiovisuals, and seamless coordination.',
    'From intimate corporate summits to lavish wedding receptions and college festivals, we orchestrate every operational detail. Our dedicated floor managers oversee vendor synergy, acoustic balance, intelligent mood lighting, guest hospitality, and strict timeline adherence so you can enjoy your event stress-free.',
    '["3D stage concept and layout visualization", "Professional sound engineering and dynamic intelligent lighting", "Artist, emcee, and performer booking coordination", "Vendor hospitality & logistics orchestration", "On-ground crowd control and timeline management"]'::jsonb,
    'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop',
    'Custom Quotation',
    'Planning: 2 - 4 Weeks',
    2
),
(
    'Banner Design and Printing',
    'banner-design-and-printing',
    'banners',
    'High-impact flex banners, roll-up standees, backdrop media, and vinyl graphics with vivid ink fidelity.',
    'Make a grand visual statement at entrances, stages, and expo booths. We engineer striking graphic layouts tailored for large-format visibility and output them on heavy-duty star flex, anti-glare vinyl, and durable aluminum pull-up mechanisms engineered for weather resilience and crisp legibility.',
    '["Custom high-resolution graphic layout creation", "Star flex, frontlit, and backlit vinyl substrates", "Heavy-gauge roll-up standees with carrying cases", "Stage backdrop truss mounting & on-site installation", "Fast 24-hour turnaround for urgent press deadlines"]'::jsonb,
    'https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=1200&auto=format&fit=crop',
    '₹1,200 onwards',
    '24 - 48 Hours',
    3
),
(
    'ID Card Design and Printing',
    'id-card-design-and-printing',
    'id_cards',
    'Tamper-resistant employee badges, student IDs, visitor passes, and custom branded satin lanyards.',
    'Secure, sleek, and durable identification systems for corporate offices, symposiums, schools, and private gatherings. We supply thermally-transferred PVC cards featuring barcode/QR encoding, NFC chip integration, and custom heat-sublimated satin lanyards matching your brand guidelines.',
    '["Heavyweight 800-micron thermal gloss/matte PVC", "Single & double-sided CMYK edge-to-edge printing", "Custom satin lanyards with metal lobster clasps", "QR code, barcode, and magnetic stripe encoding", "Bulk corporate fulfillment with individual employee variable data"]'::jsonb,
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1200&auto=format&fit=crop',
    '₹45 / card (Min order 50)',
    '2 - 4 Days',
    4
),
(
    'Visiting Card Design and Printing',
    'visiting-card-design-and-printing',
    'visiting_cards',
    'Tactile business cards in velvet matte, spot UV, gold foil, letterpress, and smart NFC tap technology.',
    'Your introductory handshake distilled into exquisite tactile papercraft. Choose between ultra-thick 450 GSM cotton stocks, sleek velvet laminates, raised 3D metallic foil highlights, and embedded contactless NFC smart cards that wirelessly beam your contact info directly into client smartphones.',
    '["400 - 600 GSM premium cotton, kraft, and linen stocks", "Velvet soft-touch lamination with raised Spot UV", "Metalic hot foil stamping (Gold, Rose Gold, Silver, Holographic)", "Contactless NFC Smart Card integration", "Dual-sided bespoke graphic typography"]'::jsonb,
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=1200&auto=format&fit=crop',
    '₹650 / 100 cards',
    '2 - 3 Days',
    5
),
(
    'Graphic Design & Creative Services',
    'graphic-design-and-other-creative-services',
    'graphic_design',
    'Brand identity design, editorial brochures, social media campaign kits, and bespoke print collateral.',
    'Elevate your brand aesthetic with thoughtful typography, disciplined layouts, and compelling artistic direction. Whether launching a new venture, revamping marketing brochures, or deploying cohesive digital campaigns, our design studio delivers vector perfection ready for screen and press.',
    '["Logo and brand identity style guidelines", "Multi-page corporate brochures and annual reports", "Social media templates and campaign banners", "Event invitation suites (Digital & Physical press)", "Packaging and marketing collateral illustration"]'::jsonb,
    'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=1200&auto=format&fit=crop',
    '₹5,000 / project',
    '3 - 5 Days',
    6
)
ON CONFLICT (slug) DO UPDATE SET 
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    short_description = EXCLUDED.short_description,
    full_description = EXCLUDED.full_description,
    features = EXCLUDED.features,
    image_url = EXCLUDED.image_url,
    starting_price = EXCLUDED.starting_price,
    turnaround_time = EXCLUDED.turnaround_time,
    order_index = EXCLUDED.order_index;

-- Seed Portfolio Categories
INSERT INTO portfolio_categories (name, slug, description, order_index) VALUES
('Event Photography', 'photography', 'Weddings, conferences, concerts, and milestone celebrations', 1),
('Event Management', 'event-management', 'Stage architecture, lighting, and festival production', 2),
('Banners & Signage', 'banners', 'Large format flex, backdrop setups, and roll-up standees', 3),
('Corporate ID Systems', 'id-cards', 'Employee badges, visitor passes, and premium lanyards', 4),
('Visiting Cards', 'visiting-cards', 'Tactile business stationery, foil, spot UV, and NFC cards', 5),
('Brand & Graphic Design', 'graphic-design', 'Brochures, identity suites, and promotional collateral', 6)
ON CONFLICT (slug) DO NOTHING;

-- Seed Portfolio Items (Realistic projects with editorial photography)
DO $$
DECLARE
    cat_photo UUID;
    cat_event UUID;
    cat_banner UUID;
    cat_id UUID;
    cat_card UUID;
    cat_design UUID;
BEGIN
    SELECT id INTO cat_photo FROM portfolio_categories WHERE slug = 'photography' LIMIT 1;
    SELECT id INTO cat_event FROM portfolio_categories WHERE slug = 'event-management' LIMIT 1;
    SELECT id INTO cat_banner FROM portfolio_categories WHERE slug = 'banners' LIMIT 1;
    SELECT id INTO cat_id FROM portfolio_categories WHERE slug = 'id-cards' LIMIT 1;
    SELECT id INTO cat_card FROM portfolio_categories WHERE slug = 'visiting-cards' LIMIT 1;
    SELECT id INTO cat_design FROM portfolio_categories WHERE slug = 'graphic-design' LIMIT 1;

    INSERT INTO portfolio_items (category_id, title, slug, description, client_name, event_date, image_url, is_featured, order_index) VALUES
    (cat_photo, 'The Grand Heritage Royal Wedding', 'grand-heritage-royal-wedding', 'Full 3-day multi-camera royal wedding coverage, capturing traditional ceremonies, royal palace architecture, and candid emotional moments.', 'Ananya & Kabir', '2026-02-14', 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop', true, 1),
    (cat_photo, 'TechVanguard Annual Global Summit', 'techvanguard-annual-global-summit', 'Comprehensive keynote documentation, executive panel sessions, and networking reception photography across 4 auditorium halls.', 'TechVanguard Global', '2026-03-22', 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1200&auto=format&fit=crop', true, 2),
    (cat_photo, 'Electric Beats Music Festival', 'electric-beats-music-festival', 'High-energy concert stage photography, dynamic laser lighting capture, and energetic crowd atmosphere documentation.', 'LiveNation Waves', '2026-04-10', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop', true, 3),
    (cat_event, 'Aura Corporate Excellence Awards', 'aura-corporate-excellence-awards', 'Complete stage construction, curved LED wall integration, intelligent beam lighting, and synchronised audio engineering for 800 executives.', 'Aura Group', '2026-01-20', 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop', true, 4),
    (cat_event, 'Botanical Garden Gala & Fundraiser', 'botanical-garden-gala', 'Enchanting outdoor canopy lighting, acoustic live jazz setup, floral arch design, and VIP table concierge.', 'GreenEarth Trust', '2026-05-05', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1200&auto=format&fit=crop', false, 5),
    (cat_banner, 'AutoExpo 2026 Massive Truss Backdrops', 'autoexpo-2026-massive-backdrops', 'Design and large-format installation of 40x15 ft seamless star flex exhibition backdrops and dual-sided directional roll-up standees.', 'Apex Mobility', '2026-02-28', 'https://images.unsplash.com/photo-1542744094-3a31f272c490?q=80&w=1200&auto=format&fit=crop', true, 6),
    (cat_banner, 'University Fest Entrance Arch & Signage', 'university-fest-entrance-signage', 'Weather-resistant vinyl gate wrap, stage podium branding, and sponsor display pull-up standees.', 'National Institute of Tech', '2026-03-15', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop', false, 7),
    (cat_id, 'FinCorp National Staff Badge Ecosystem', 'fincorp-national-staff-badge-ecosystem', 'Design, thermal encoding, and dispatch of 1,200 secure employee PVC badges with customized silk-screened lanyards and cardholders.', 'FinCorp Financial', '2026-01-10', 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1200&auto=format&fit=crop', true, 8),
    (cat_id, 'Global MedTech Symposium Delegate Passes', 'global-medtech-symposium-passes', 'Quick-scan QR delegate badges with high-speed onsite lamination and color-coded access tiers for international physicians.', 'MedTech Council', '2026-04-18', 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?q=80&w=1200&auto=format&fit=crop', false, 9),
    (cat_card, 'Velvet Gold Foil Executive Cards', 'velvet-gold-foil-executive-cards', '450 GSM velvet matte business cards with hand-stamped gold foil typography and emerald painted edges.', 'Maison Architecture', '2026-03-01', 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=1200&auto=format&fit=crop', true, 10),
    (cat_card, 'TapSmart NFC Executive Smart Card', 'tapsmart-nfc-executive-smart-card', 'Matte black metal hybrid card with integrated NTAG216 chip, allowing instant vCard download upon tapping any iOS or Android phone.', 'Venture Pulse Capital', '2026-02-11', 'https://images.unsplash.com/photo-1616469829941-c7200edec809?q=80&w=1200&auto=format&fit=crop', false, 11),
    (cat_design, 'Serenity Resorts Brand Identity Suite', 'serenity-resorts-brand-identity-suite', 'Complete luxury brand guidelines, brochure catalog design, menu press layouts, and staff presentation templates.', 'Serenity Escapes', '2026-04-02', 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=1200&auto=format&fit=crop', true, 12)
    ON CONFLICT (slug) DO NOTHING;
END $$;
