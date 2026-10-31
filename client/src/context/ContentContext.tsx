import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface CompanyProfile {
  company_name: string;
  tagline: string;
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  working_hours: string;
  social_links: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    youtube?: string;
  };
}

interface HomepageHero {
  headline_line1: string;
  headline_line2: string;
  headline_line3: string;
  headline_line4: string;
  subheading: string;
  hero_image: string;
  badge_text: string;
  stats: Array<{ value: string; label: string }>;
}

interface AboutPageContent {
  story_headline: string;
  story_body: string;
  mission: string;
  equipment_standards: string;
}

interface ContentContextType {
  company: CompanyProfile;
  hero: HomepageHero;
  about: AboutPageContent;
  loading: boolean;
  refreshContent: () => Promise<void>;
}

const defaultCompany: CompanyProfile = {
  company_name: 'Lumina Creative Studio',
  tagline: 'Events Captured. Stories Created.',
  phone: '+91 98765 43210',
  email: 'contact@luminacreative.studio',
  whatsapp: '919876543210',
  address: '402, High Street Creative Enclave, Metro Boulevard, City Center',
  working_hours: 'Mon - Sat: 9:00 AM - 7:30 PM | Sun: Event Shoots by Appointment',
  social_links: {
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
    linkedin: 'https://linkedin.com',
    youtube: 'https://youtube.com',
  },
};

const defaultHero: HomepageHero = {
  headline_line1: 'Events',
  headline_line2: 'Captured.',
  headline_line3: 'Stories',
  headline_line4: 'Created.',
  subheading: 'Event photography, event management and creative design services that turn your moments into lasting memories.',
  hero_image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop',
  badge_text: 'Full-Service Creative Agency',
  stats: [
    { value: '850+', label: 'Events Documented' },
    { value: '12+', label: 'Years Industry Craft' },
    { value: '100%', label: 'Deliverable Excellence' },
  ],
};

const defaultAbout: AboutPageContent = {
  story_headline: "Crafting visual permanence for life's grandest milestones.",
  story_body: "Founded with a conviction that every celebration and brand milestone deserves cinematic documentation and cohesive visual identity, Lumina Creative Studio bridges high-end event photography with comprehensive print design and event execution under one master roof.",
  mission: "To empower brands, couples, institutions and event organizers with unforgettable visual storytelling, flawless event coordination, and tactile print materials that inspire awe.",
  equipment_standards: "Dual-card full-frame cinema cameras, prime master glass, calibrated profoto wireless strobes, and certified archival print production.",
};

const ContentContext = createContext<ContentContextType>({
  company: defaultCompany,
  hero: defaultHero,
  about: defaultAbout,
  loading: true,
  refreshContent: async () => {},
});

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [company, setCompany] = useState<CompanyProfile>(defaultCompany);
  const [hero, setHero] = useState<HomepageHero>(defaultHero);
  const [about, setAbout] = useState<AboutPageContent>(defaultAbout);
  const [loading, setLoading] = useState(true);

  const refreshContent = async () => {
    try {
      const content = await api.getContent();
      if (content.company_profile) setCompany({ ...defaultCompany, ...content.company_profile });
      if (content.homepage_hero) setHero({ ...defaultHero, ...content.homepage_hero });
      if (content.about_page) setAbout({ ...defaultAbout, ...content.about_page });
    } catch (err) {
      console.warn('Failed to load dynamic content, using defaults:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshContent();
  }, []);

  return (
    <ContentContext.Provider value={{ company, hero, about, loading, refreshContent }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => useContext(ContentContext);
