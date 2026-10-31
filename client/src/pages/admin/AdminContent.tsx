import React, { useState, useEffect } from 'react';
import { Save, Sparkles, AlertCircle, Building, Phone, MapPin, Globe, Image as ImageIcon } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { api } from '../../services/api';

export const AdminContent: React.FC = () => {
  const { company, hero, about, refreshContent } = useContent();

  const [companyForm, setCompanyForm] = useState(company);
  const [heroForm, setHeroForm] = useState(hero);
  const [aboutForm, setAboutForm] = useState(about);

  // Synchronize form states when ContentContext completes initial load or updates
  useEffect(() => {
    setCompanyForm(company);
  }, [company]);

  useEffect(() => {
    setHeroForm(hero);
  }, [hero]);

  useEffect(() => {
    setAboutForm(about);
  }, [about]);

  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'company' | 'hero' | 'about'>('company');

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSection('company');
    setFeedback(null);
    try {
      await api.updateContent('company_profile', companyForm);
      await refreshContent();
      setFeedback('Company branding & contact details updated successfully.');
    } catch {
      setFeedback('Error updating company profile.');
    } finally {
      setSavingSection(null);
    }
  };

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSection('hero');
    setFeedback(null);
    try {
      await api.updateContent('homepage_hero', heroForm);
      await refreshContent();
      setFeedback('Homepage hero content updated successfully.');
    } catch {
      setFeedback('Error updating homepage hero.');
    } finally {
      setSavingSection(null);
    }
  };

  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSection('about');
    setFeedback(null);
    try {
      await api.updateContent('about_page', aboutForm);
      await refreshContent();
      setFeedback('About page ethos and mission updated successfully.');
    } catch {
      setFeedback('Error updating about page.');
    } finally {
      setSavingSection(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-charcoal/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-burgundy uppercase tracking-tight">
            Website Content & Branding
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted">
            Update studio name, contact info, WhatsApp number, hero headings, and editorial copy.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1.5 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => { setActiveTab('company'); setFeedback(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'company' ? 'bg-burgundy text-cream shadow-sm' : 'text-charcoal hover:text-black'
            }`}
          >
            Studio Identity
          </button>
          <button
            onClick={() => { setActiveTab('hero'); setFeedback(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'hero' ? 'bg-burgundy text-cream shadow-sm' : 'text-charcoal hover:text-black'
            }`}
          >
            Homepage Hero
          </button>
          <button
            onClick={() => { setActiveTab('about'); setFeedback(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'about' ? 'bg-burgundy text-cream shadow-sm' : 'text-charcoal hover:text-black'
            }`}
          >
            About Story
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* =========================================================================
          TAB 1: STUDIO IDENTITY & CONTACT DETAILS
         ========================================================================= */}
      {activeTab === 'company' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-charcoal/10">
          <h2 className="font-display text-2xl text-burgundy uppercase tracking-tight mb-1">
            Studio Identity & Contact Information
          </h2>
          <p className="text-xs text-charcoal-muted mb-6">
            Changes reflect instantly across the navigation bar, footer, and contact desk.
          </p>

          <form onSubmit={handleSaveCompany} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-burgundy uppercase tracking-wider mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={companyForm.company_name}
                  onChange={(e) => setCompanyForm({ ...companyForm, company_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-charcoal/20 rounded-xl outline-none focus:border-burgundy"
                />
              </div>

              <div>
                <label className="block font-bold text-burgundy uppercase tracking-wider mb-1">
                  Company Tagline *
                </label>
                <input
                  type="text"
                  required
                  value={companyForm.tagline}
                  onChange={(e) => setCompanyForm({ ...companyForm, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-charcoal/20 rounded-xl outline-none focus:border-burgundy"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-burgundy uppercase tracking-wider mb-1">
                  Official Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={companyForm.phone}
                  onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-charcoal/20 rounded-xl outline-none focus:border-burgundy"
                />
              </div>

              <div>
                <label className="block font-bold text-burgundy uppercase tracking-wider mb-1">
                  WhatsApp Number (with country code, digits only) *
                </label>
                <input
                  type="text"
                  required
                  value={companyForm.whatsapp}
                  onChange={(e) => setCompanyForm({ ...companyForm, whatsapp: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-charcoal/20 rounded-xl outline-none focus:border-burgundy"
                />
              </div>

              <div>
                <label className="block font-bold text-burgundy uppercase tracking-wider mb-1">
                  Official Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={companyForm.email}
                  onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-charcoal/20 rounded-xl outline-none focus:border-burgundy"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-burgundy uppercase tracking-wider mb-1">
                Studio Physical Address
              </label>
              <input
                type="text"
                value={companyForm.address}
                onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-charcoal/20 rounded-xl outline-none focus:border-burgundy"
              />
            </div>

            <div>
              <label className="block font-bold text-burgundy uppercase tracking-wider mb-1">
                Operating Hours
              </label>
              <input
                type="text"
                value={companyForm.working_hours}
                onChange={(e) => setCompanyForm({ ...companyForm, working_hours: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-charcoal/20 rounded-xl outline-none focus:border-burgundy"
              />
            </div>

            <div className="pt-4 border-t border-charcoal/10 flex justify-end">
              <button
                type="submit"
                disabled={savingSection === 'company'}
                className="btn-primary py-2.5 px-6 uppercase tracking-wider font-bold"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingSection === 'company' ? 'Saving...' : 'Save Studio Details'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          TAB 2: HOMEPAGE HERO HEADLINES
         ========================================================================= */}
      {activeTab === 'hero' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-charcoal/10">
          <h2 className="font-display text-2xl text-burgundy uppercase tracking-tight mb-1">
            Homepage Hero Display Copy
          </h2>
          <p className="text-xs text-charcoal-muted mb-6">
            Configure the 4-line punchy Anton display typography and hero polaroid image.
          </p>

          <form onSubmit={handleSaveHero} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block font-bold text-burgundy uppercase tracking-wider mb-1">
                  Headline Line 1
                </label>
                <input
                  type="text"
                  value={heroForm.headline_line1}
                  onChange={(e) => setHeroForm({ ...heroForm, headline_line1: e.target.value })}
                  placeholder="Events"
                  className="w-full px-3 py-2 bg-gray-50 border border-charcoal/20 rounded-xl outline-none focus:border-burgundy font-display text-base"
                />
              </div>

              <div>
                <label className="block font-bold text-burgundy uppercase tracking-wider mb-1">
                  Headline Line 2
                </label>
                <input
                  type="text"
                  value={heroForm.headline_line2}
                  onChange={(e) => setHeroForm({ ...heroForm, headline_line2: e.target.value })}
                  placeholder="Captured."
                  className="w-full px-3 py-2 bg-gray-50 border border-charcoal/20 rounded-xl outline-none focus:border-burgundy font-display text-base"
                />
              </div>

              <div>
                <label className="block font-bold text-burgundy uppercase tracking-wider mb-1">
                  Headline Line 3
                </label>
                <input
                  type="text"
                  value={heroForm.headline_line3}
                  onChange={(e) => setHeroForm({ ...heroForm, headline_line3: e.target.value })}
                  placeholder="Stories"
                  className="w-full px-3 py-2 bg-gray-50 border border-charcoal/20 rounded-xl outline-none focus:border-burgundy font-display text-base"
                />
              </div>

              <div>
                <label className="block font-bold text-burgundy uppercase tracking-wider mb-1">
                  Headline Line 4
                </label>
                <input
                  type="text"
                  value={heroForm.headline_line4}
                  onChange={(e) => setHeroForm({ ...heroForm, headline_line4: e.target.value })}
                  placeholder="Created."
                  className="w-full px-3 py-2 bg-gray-50 border border-charcoal/20 rounded-xl outline-none focus:border-burgundy font-display text-base"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-burgundy uppercase tracking-wider mb-1">
                Editorial Subtitle Copy
              </label>
              <textarea
                rows={2}
                value={heroForm.subheading}
                onChange={(e) => setHeroForm({ ...heroForm, subheading: e.target.value })}
                className="w-full px-3.5 py-2 bg-gray-50 border border-charcoal/20 rounded-xl outline-none focus:border-burgundy font-editorial text-sm italic resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block font-bold text-burgundy uppercase tracking-wider mb-1">
                Hero Tilted Polaroid Image URL
              </label>
              <input
                type="url"
                value={heroForm.hero_image}
                onChange={(e) => setHeroForm({ ...heroForm, hero_image: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-charcoal/20 rounded-xl outline-none focus:border-burgundy"
              />
            </div>

            <div>
              <label className="block font-bold text-burgundy uppercase tracking-wider mb-1">
                Hero Pill Badge Text
              </label>
              <input
                type="text"
                value={heroForm.badge_text}
                onChange={(e) => setHeroForm({ ...heroForm, badge_text: e.target.value })}
                placeholder="Full-Service Creative Agency"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-charcoal/20 rounded-xl outline-none focus:border-burgundy"
              />
            </div>

            <div>
              <label className="block font-bold text-burgundy uppercase tracking-wider mb-2">
                Fast Stats Row (Studio Metrics & Benchmarks)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(heroForm.stats || []).map((st, sIdx) => (
                  <div key={sIdx} className="p-3 bg-gray-50 border border-charcoal/20 rounded-xl space-y-2">
                    <span className="text-[10px] uppercase font-bold text-charcoal-muted">Stat #{sIdx + 1}</span>
                    <input
                      type="text"
                      value={st.value}
                      onChange={(e) => {
                        const newStats = [...(heroForm.stats || [])];
                        newStats[sIdx] = { ...newStats[sIdx], value: e.target.value };
                        setHeroForm({ ...heroForm, stats: newStats });
                      }}
                      placeholder="e.g. 850+"
                      className="w-full px-2.5 py-1.5 bg-white border border-charcoal/20 rounded-lg font-bold"
                    />
                    <input
                      type="text"
                      value={st.label}
                      onChange={(e) => {
                        const newStats = [...(heroForm.stats || [])];
                        newStats[sIdx] = { ...newStats[sIdx], label: e.target.value };
                        setHeroForm({ ...heroForm, stats: newStats });
                      }}
                      placeholder="e.g. Events Documented"
                      className="w-full px-2.5 py-1.5 bg-white border border-charcoal/20 rounded-lg text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-charcoal/10 flex justify-end">
              <button
                type="submit"
                disabled={savingSection === 'hero'}
                className="btn-primary py-2.5 px-6 uppercase tracking-wider font-bold"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingSection === 'hero' ? 'Saving...' : 'Save Hero Copy'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          TAB 3: ABOUT PAGE STORY & MISSION
         ========================================================================= */}
      {activeTab === 'about' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-charcoal/10">
          <h2 className="font-display text-2xl text-burgundy uppercase tracking-tight mb-1">
            About Us Narrative & Ethos
          </h2>
          <p className="text-xs text-charcoal-muted mb-6">
            Update your studio story, mission statement, and technical standards copy.
          </p>

          <form onSubmit={handleSaveAbout} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-burgundy uppercase tracking-wider mb-1">
                Story Headline
              </label>
              <input
                type="text"
                value={aboutForm.story_headline}
                onChange={(e) => setAboutForm({ ...aboutForm, story_headline: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-charcoal/20 rounded-xl outline-none focus:border-burgundy"
              />
            </div>

            <div>
              <label className="block font-bold text-burgundy uppercase tracking-wider mb-1">
                Story Body Narrative
              </label>
              <textarea
                rows={3}
                value={aboutForm.story_body}
                onChange={(e) => setAboutForm({ ...aboutForm, story_body: e.target.value })}
                className="w-full px-3.5 py-2 bg-gray-50 border border-charcoal/20 rounded-xl outline-none focus:border-burgundy resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block font-bold text-burgundy uppercase tracking-wider mb-1">
                Mission Statement
              </label>
              <textarea
                rows={2}
                value={aboutForm.mission}
                onChange={(e) => setAboutForm({ ...aboutForm, mission: e.target.value })}
                className="w-full px-3.5 py-2 bg-gray-50 border border-charcoal/20 rounded-xl outline-none focus:border-burgundy resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block font-bold text-burgundy uppercase tracking-wider mb-1">
                Equipment Standards Summary
              </label>
              <textarea
                rows={2}
                value={aboutForm.equipment_standards}
                onChange={(e) => setAboutForm({ ...aboutForm, equipment_standards: e.target.value })}
                className="w-full px-3.5 py-2 bg-gray-50 border border-charcoal/20 rounded-xl outline-none focus:border-burgundy resize-none"
              ></textarea>
            </div>

            <div className="pt-4 border-t border-charcoal/10 flex justify-end">
              <button
                type="submit"
                disabled={savingSection === 'about'}
                className="btn-primary py-2.5 px-6 uppercase tracking-wider font-bold"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingSection === 'about' ? 'Saving...' : 'Save About Content'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
