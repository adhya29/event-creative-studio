import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Shield,
  Layers,
  Phone,
} from 'lucide-react';
import { api } from '../services/api';
import { useContent } from '../context/ContentContext';

export const ServiceDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { company } = useContent();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      if (!slug) return;
      try {
        const data = await api.getService(slug);
        setService(data);
      } catch (err) {
        console.error('Error fetching service:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-burgundy min-h-screen py-24 px-4 flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-electric border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="bg-burgundy min-h-screen py-24 px-4 text-center text-cream">
        <div className="max-w-md mx-auto cream-card p-10 text-charcoal">
          <h2 className="font-display text-3xl text-burgundy mb-4">Service Not Found</h2>
          <p className="text-sm text-charcoal-muted mb-6">
            The requested service may have moved or is currently unavailable.
          </p>
          <Link to="/services" className="btn-primary">
            <span>Browse All Services</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-burgundy min-h-screen text-charcoal py-8 sm:py-16 px-3 sm:px-6 lg:px-12">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Back Link */}
        <Link
          to="/services"
          className="inline-flex items-center gap-2 text-cream hover:text-electric text-xs font-bold uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Services</span>
        </Link>

        {/* Main Service Card */}
        <div className="cream-card p-8 sm:p-14 overflow-hidden shadow-2xl">
          
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <span className="inline-flex items-center gap-2 bg-burgundy/10 text-burgundy text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-electric"></span>
              <span>Category: {service.category.replace('_', ' ')}</span>
            </span>

            <div className="flex items-center gap-2 text-xs font-bold text-burgundy bg-burgundy/5 px-3 py-1.5 rounded-full">
              <Clock className="w-4 h-4 text-electric" />
              <span>Turnaround: {service.turnaround_time}</span>
            </div>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl text-burgundy uppercase tracking-tight leading-none mb-6">
            {service.title}
          </h1>

          <p className="font-editorial text-lg sm:text-2xl text-charcoal/90 italic leading-relaxed mb-8">
            "{service.short_description}"
          </p>

          {/* Featured Image Frame */}
          <div className="overflow-hidden aspect-[16/9] sm:aspect-[21/9] bg-charcoal rounded-2xl mb-10 shadow-lg relative">
            <img
              src={service.image_url}
              alt={service.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Detailed Narrative */}
          <div className="prose max-w-none text-charcoal leading-relaxed mb-10 text-sm sm:text-base">
            <h3 className="font-display text-2xl text-burgundy uppercase tracking-tight mb-3">
              Comprehensive Service Scope
            </h3>
            <p className="leading-relaxed whitespace-pre-line text-charcoal/90">
              {service.full_description}
            </p>
          </div>

          {/* Deliverables Box */}
          <div className="bg-white/70 p-6 sm:p-8 rounded-2xl border border-charcoal/10 mb-10">
            <h3 className="font-display text-xl text-burgundy uppercase tracking-tight mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-electric" />
              <span>What You Receive</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {(service.features || []).map((feat: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-charcoal">
                  <CheckCircle2 className="w-4 h-4 text-electric shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-8 border-t border-burgundy/15 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <span className="text-xs uppercase text-charcoal-muted tracking-wider block">
                Estimated Starting Price
              </span>
              <span className="font-display text-3xl text-burgundy">
                {service.starting_price}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to={`/quotation?service=${encodeURIComponent(service.title)}`}
                className="btn-primary text-xs uppercase tracking-wider py-3.5 px-6 font-bold"
              >
                <span>Request Quotation</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>

              <a
                href={`https://wa.me/${company.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Hello! I would like to enquire about your ${service.title} service.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline text-xs uppercase tracking-wider py-3 px-5 font-semibold"
              >
                <span>WhatsApp Query</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
