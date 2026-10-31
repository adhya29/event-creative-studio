import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  MessageSquare,
  Calendar,
  MapPin,
  Clock,
} from 'lucide-react';
import { api } from '../services/api';
import { useContent } from '../context/ContentContext';

export const Quotation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedService = searchParams.get('service');
  const { company } = useContent();

  const allAvailableServices = [
    'Event Photography',
    'Event Management',
    'Banner Design and Printing',
    'ID Card Design and Printing',
    'Visiting Card Design and Printing',
    'Graphic Design & Creative Services',
  ];

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    event_type: 'Wedding Celebration',
    event_date: '',
    event_location: '',
    required_services: preselectedService ? [preselectedService] : ['Event Photography'],
    estimated_budget: '₹50,000 - ₹1,50,000',
    additional_requirements: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync if query param changes
  useEffect(() => {
    if (preselectedService && !formData.required_services.includes(preselectedService)) {
      setFormData((prev) => ({
        ...prev,
        required_services: [...prev.required_services, preselectedService],
      }));
    }
  }, [preselectedService]);

  const handleServiceToggle = (serviceName: string) => {
    setFormData((prev) => {
      const exists = prev.required_services.includes(serviceName);
      if (exists) {
        if (prev.required_services.length === 1) return prev; // Keep at least one
        return {
          ...prev,
          required_services: prev.required_services.filter((s) => s !== serviceName),
        };
      } else {
        return {
          ...prev,
          required_services: [...prev.required_services, serviceName],
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.full_name.trim() || formData.full_name.trim().length < 2) {
      setError('Please provide your full name (minimum 2 characters).');
      return;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 6) {
      setError('Please provide a valid contact phone number.');
      return;
    }
    if (!formData.event_date.trim()) {
      setError('Please specify the expected event date or timeline.');
      return;
    }
    if (!formData.event_location.trim()) {
      setError('Please enter the event location, venue, or target city.');
      return;
    }
    if (formData.required_services.length === 0) {
      setError('Please select at least one required creative service.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.submitQuotation(formData);
      if (res.success) {
        setSuccess(
          res.message || 'Quotation request submitted! Our production desk will prepare a bespoke quotation for you.'
        );
        setFormData({
          full_name: '',
          email: '',
          phone: '',
          event_type: 'Wedding Celebration',
          event_date: '',
          event_location: '',
          required_services: ['Event Photography'],
          estimated_budget: '₹50,000 - ₹1,50,000',
          additional_requirements: '',
        });
      } else {
        setError(res.error || 'Failed to submit quotation request.');
      }
    } catch {
      setError('Network error: Unable to reach the server. Please try again or chat with us on WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  const prefilledWhatsappUrl = `https://wa.me/${company.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Hello ${company.company_name}! I would like to request a quotation for:
- Event: ${formData.event_type}
- Date: ${formData.event_date || 'Upcoming'}
- Location: ${formData.event_location || 'City'}
- Services: ${formData.required_services.join(', ')}`
  )}`;

  return (
    <div className="bg-burgundy min-h-screen text-charcoal py-8 sm:py-16 px-3 sm:px-6 lg:px-12">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Editorial Header */}
        <div className="cream-card p-8 sm:p-12 relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-burgundy text-xs font-bold uppercase tracking-widest bg-burgundy/10 px-3.5 py-1.5 rounded-full mb-4">
              <span className="w-2 h-2 rounded-full bg-electric"></span>
              <span>Bespoke Event Estimate</span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl text-burgundy uppercase tracking-tight leading-[0.95] mb-4">
              Request a Tailored Quotation.
            </h1>

            <p className="font-editorial text-base sm:text-xl text-charcoal/90 italic leading-relaxed">
              Tell us the scope of your upcoming celebration or creative print project. We'll engineer an all-inclusive estimate tailored to your exact timeline and requirements.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="cream-card p-8 sm:p-12 shadow-2xl">
          
          {success && (
            <div className="mb-8 p-5 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-950 flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-display text-xl text-emerald-900 uppercase tracking-wide">
                  Quotation Request Received!
                </h4>
                <p className="text-xs sm:text-sm text-emerald-800 mt-1">
                  {success}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href={prefilledWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-xs uppercase tracking-wider py-2.5 px-4 font-bold"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Also Send via WhatsApp</span>
                  </a>
                  <Link to="/portfolio" className="btn-outline text-xs uppercase tracking-wider py-2.5 px-4 font-semibold">
                    <span>Explore Visual Portfolio</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-8 p-4 rounded-xl bg-rose-100 border border-rose-300 text-rose-900 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <span className="font-bold block">Please Complete Required Information</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Step 1: Client Contact */}
            <div>
              <h3 className="font-display text-xl text-burgundy uppercase tracking-tight mb-4 pb-2 border-b border-burgundy/15 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-burgundy text-cream text-xs flex items-center justify-center font-bold">
                  1
                </span>
                <span>Your Contact Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-burgundy uppercase tracking-wider mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="e.g. Rohan & Priya"
                    className="w-full px-4 py-3 bg-white rounded-xl border border-charcoal/20 focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 outline-none text-sm"
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
                    placeholder="e.g. rohan@gmail.com"
                    className="w-full px-4 py-3 bg-white rounded-xl border border-charcoal/20 focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-burgundy uppercase tracking-wider mb-2">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 99887 66554"
                    className="w-full px-4 py-3 bg-white rounded-xl border border-charcoal/20 focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Event Specifics */}
            <div>
              <h3 className="font-display text-xl text-burgundy uppercase tracking-tight mb-4 pb-2 border-b border-burgundy/15 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-burgundy text-cream text-xs flex items-center justify-center font-bold">
                  2
                </span>
                <span>Event Logistics</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-burgundy uppercase tracking-wider mb-2">
                    Event Type *
                  </label>
                  <select
                    value={formData.event_type}
                    onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                    className="w-full px-4 py-3 bg-white rounded-xl border border-charcoal/20 focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 outline-none text-sm"
                  >
                    <option value="Wedding Celebration">Wedding Celebration</option>
                    <option value="Corporate Global Summit">Corporate Global Summit</option>
                    <option value="Concert / Music Festival">Concert / Music Festival</option>
                    <option value="Exhibition / Trade Expo">Exhibition / Trade Expo</option>
                    <option value="College Cultural Fest">College Cultural Fest</option>
                    <option value="Milestone Birthday / Gala">Milestone Birthday / Gala</option>
                    <option value="Commercial Print & ID System">Commercial Print & ID System</option>
                    <option value="Other Bespoke Event">Other Bespoke Event</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-burgundy uppercase tracking-wider mb-2">
                    Event Date or Timeline *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    placeholder="e.g. 15-18 Dec 2026 or Spring 2026"
                    className="w-full px-4 py-3 bg-white rounded-xl border border-charcoal/20 focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-burgundy uppercase tracking-wider mb-2">
                    Event Venue / City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.event_location}
                    onChange={(e) => setFormData({ ...formData, event_location: e.target.value })}
                    placeholder="e.g. The Oberoi, Jaipur"
                    className="w-full px-4 py-3 bg-white rounded-xl border border-charcoal/20 focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Required Services (Checkboxes) */}
            <div>
              <h3 className="font-display text-xl text-burgundy uppercase tracking-tight mb-2 pb-2 border-b border-burgundy/15 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-burgundy text-cream text-xs flex items-center justify-center font-bold">
                  3
                </span>
                <span>Select Required Creative Services *</span>
              </h3>
              <p className="text-xs text-charcoal-muted mb-4">
                Choose all services you want incorporated into your consolidated studio proposal:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {allAvailableServices.map((srv) => {
                  const selected = formData.required_services.includes(srv);
                  return (
                    <button
                      type="button"
                      key={srv}
                      onClick={() => handleServiceToggle(srv)}
                      className={`p-4 rounded-xl border text-left transition-all flex items-start justify-between gap-2 ${
                        selected
                          ? 'bg-burgundy text-cream border-burgundy shadow-md'
                          : 'bg-white text-charcoal border-charcoal/15 hover:border-burgundy/50'
                      }`}
                    >
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {srv}
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          selected ? 'bg-electric text-burgundy' : 'border border-charcoal/30'
                        }`}
                      >
                        {selected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Budget & Additional Notes */}
            <div>
              <h3 className="font-display text-xl text-burgundy uppercase tracking-tight mb-4 pb-2 border-b border-burgundy/15 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-burgundy text-cream text-xs flex items-center justify-center font-bold">
                  4
                </span>
                <span>Budget & Specific Deliverables</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-burgundy uppercase tracking-wider mb-2">
                    Estimated Budget Range (Optional)
                  </label>
                  <select
                    value={formData.estimated_budget}
                    onChange={(e) => setFormData({ ...formData, estimated_budget: e.target.value })}
                    className="w-full px-4 py-3 bg-white rounded-xl border border-charcoal/20 focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 outline-none text-sm"
                  >
                    <option value="Under ₹50,000">Under ₹50,000</option>
                    <option value="₹50,000 - ₹1,50,000">₹50,000 - ₹1,50,000</option>
                    <option value="₹1,50,000 - ₹3,50,000">₹1,50,000 - ₹3,50,000</option>
                    <option value="₹3,50,000 - ₹7,00,000">₹3,50,000 - ₹7,00,000</option>
                    <option value="₹7,00,000+ Premium Milestone">₹7,00,000+ Premium Milestone</option>
                    <option value="Flexible / Need Recommendation">Flexible / Need Recommendation</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-burgundy uppercase tracking-wider mb-2">
                    Additional Requirements or Special Notes
                  </label>
                  <textarea
                    rows={3}
                    value={formData.additional_requirements}
                    onChange={(e) => setFormData({ ...formData, additional_requirements: e.target.value })}
                    placeholder="e.g. Drone aerial shots required for sangeet, 500 satin lanyards needed by Thursday, stage dimensions 30x12 ft..."
                    className="w-full px-4 py-3 bg-white rounded-xl border border-charcoal/20 focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 outline-none text-sm resize-y"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Submission Action */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full sm:w-auto text-xs uppercase tracking-wider py-4 px-8 font-bold disabled:opacity-50"
              >
                {loading ? (
                  <span>Generating Proposal Request...</span>
                ) : (
                  <>
                    <span>Submit Quotation Request</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>

              <a
                href={prefilledWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline w-full sm:w-auto text-xs uppercase tracking-wider py-3.5 px-6 font-semibold flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Instant WhatsApp Quote</span>
              </a>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
};
