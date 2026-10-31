import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { api } from '../services/api';

export const Contact: React.FC = () => {
  const { company } = useContent();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    interested_service: 'Event Photography',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const servicesOptions = [
    'Event Photography',
    'Event Management',
    'Banner Design and Printing',
    'ID Card Design and Printing',
    'Visiting Card Design and Printing',
    'Graphic Design and Other Creative Services',
    'Full-Package Event Coordination',
    'Other Custom Creative Inquiry',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (!formData.full_name.trim() || formData.full_name.trim().length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters).');
      return;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 6) {
      setErrorMessage('Please enter a valid contact phone number.');
      return;
    }
    if (!formData.message.trim() || formData.message.trim().length < 5) {
      setErrorMessage('Please enter a message of at least 5 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.submitEnquiry(formData);
      if (res.success) {
        setSuccessMessage(
          res.message || 'Thank you! Your enquiry has been received. We will contact you shortly.'
        );
        setFormData({
          full_name: '',
          email: '',
          phone: '',
          interested_service: 'Event Photography',
          message: '',
        });
      } else {
        setErrorMessage(res.error || 'Failed to submit enquiry. Please try again.');
      }
    } catch {
      setErrorMessage('Could not connect to the server. Please check your internet or reach us via WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  const whatsappUrl = `https://wa.me/${company.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Hello ${company.company_name}! I would like to get in touch regarding creative services.`
  )}`;

  return (
    <div className="bg-burgundy min-h-screen text-charcoal py-8 sm:py-16 px-3 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Hero */}
        <div className="cream-card p-8 sm:p-14 lg:p-16 relative overflow-hidden shadow-2xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-burgundy text-xs font-bold uppercase tracking-widest bg-burgundy/10 px-3.5 py-1.5 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-electric"></span>
              <span>Direct Studio Access</span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl text-burgundy uppercase tracking-tight leading-[0.95] mb-6">
              Let's Discuss Your Event, Stage or Print Requirement.
            </h1>

            <p className="font-editorial text-lg sm:text-2xl text-charcoal/90 italic leading-relaxed">
              Reach out for event bookings, bulk corporate ID systems, banner proofs, or tactile business card consultations.
            </p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Contact Form */}
          <div className="lg:col-span-7 cream-card p-8 sm:p-12 shadow-xl">
            <div className="mb-8">
              <h2 className="font-display text-3xl text-burgundy uppercase tracking-tight mb-2">
                Send a General Enquiry
              </h2>
              <p className="font-editorial text-sm text-charcoal/80 italic">
                Fill in the details below and our production desk will reply within 24 hours.
              </p>
            </div>

            {successMessage && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <span className="font-bold block">Enquiry Submitted Successfully!</span>
                  <span>{successMessage}</span>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-rose-100 border border-rose-300 text-rose-900 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <span className="font-bold block">Submission Error</span>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-burgundy uppercase tracking-wider mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="e.g. Vikramaditya Singhania"
                    className="w-full px-4 py-3 bg-white rounded-xl border border-charcoal/20 focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 outline-none text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-burgundy uppercase tracking-wider mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. vikram@domain.com"
                    className="w-full px-4 py-3 bg-white rounded-xl border border-charcoal/20 focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-burgundy uppercase tracking-wider mb-2">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 98200 11223"
                    className="w-full px-4 py-3 bg-white rounded-xl border border-charcoal/20 focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 outline-none text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-burgundy uppercase tracking-wider mb-2">
                    Interested Service *
                  </label>
                  <select
                    value={formData.interested_service}
                    onChange={(e) => setFormData({ ...formData, interested_service: e.target.value })}
                    className="w-full px-4 py-3 bg-white rounded-xl border border-charcoal/20 focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 outline-none text-sm transition-all"
                  >
                    {servicesOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-burgundy uppercase tracking-wider mb-2">
                  Your Message or Requirement *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your event dates, venue city, print volume, or creative brief..."
                  className="w-full px-4 py-3 bg-white rounded-xl border border-charcoal/20 focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 outline-none text-sm transition-all resize-y"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center text-xs uppercase tracking-wider py-4 font-bold disabled:opacity-50"
              >
                {loading ? (
                  <span>Submitting to Studio Desk...</span>
                ) : (
                  <>
                    <span>Submit Enquiry</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Studio Info & WhatsApp */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* WhatsApp Quick Chat Card */}
            <div className="bg-burgundy-dark border-2 border-electric/40 rounded-3xl p-8 text-cream shadow-xl relative overflow-hidden">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-electric flex items-center justify-center text-burgundy">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-2xl text-cream uppercase tracking-tight">
                    Instant WhatsApp Desk
                  </h3>
                  <span className="text-xs text-electric font-semibold uppercase">
                    Typical response: under 15 mins
                  </span>
                </div>
              </div>

              <p className="font-editorial text-cream/80 text-sm italic mb-6">
                Need urgent event date confirmation, expedited banner printing proofs, or direct pricing?
              </p>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full justify-center text-xs uppercase tracking-wider py-3.5 font-bold"
              >
                <span>Chat On WhatsApp Now</span>
                <Send className="w-4 h-4" />
              </a>
            </div>

            {/* Studio Info Card */}
            <div className="cream-card p-8 shadow-xl">
              <h3 className="font-display text-2xl text-burgundy uppercase tracking-tight mb-6">
                Studio Headquarters
              </h3>

              <ul className="space-y-4 text-xs sm:text-sm text-charcoal">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-burgundy shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-burgundy block">Address</span>
                    <span>{company.address}</span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-burgundy shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-burgundy block">Direct Phone</span>
                    <a href={`tel:${company.phone}`} className="hover:underline">
                      {company.phone}
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-burgundy shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-burgundy block">Official Email</span>
                    <a href={`mailto:${company.email}`} className="hover:underline">
                      {company.email}
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-burgundy shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-burgundy block">Operating Hours</span>
                    <span>{company.working_hours}</span>
                  </div>
                </li>
              </ul>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
