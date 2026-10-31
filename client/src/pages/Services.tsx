import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Camera,
  Calendar,
  Image as ImageIcon,
  CreditCard,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { api } from '../services/api';

export const Services: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await api.getServices();
        setServices(data);
      } catch (err) {
        console.error('Error fetching services:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const categories = [
    { label: 'All Services', value: 'all' },
    { label: 'Photography', value: 'photography' },
    { label: 'Event Management', value: 'event_management' },
    { label: 'Banners & Print', value: 'banners' },
    { label: 'ID Systems', value: 'id_cards' },
    { label: 'Visiting Cards', value: 'visiting_cards' },
    { label: 'Graphic Design', value: 'graphic_design' },
  ];

  const filteredServices =
    selectedCategory === 'all'
      ? services
      : services.filter((s) => s.category === selectedCategory);

  const getServiceIcon = (category: string) => {
    switch (category) {
      case 'photography':
        return <Camera className="w-6 h-6 text-burgundy" />;
      case 'event_management':
        return <Calendar className="w-6 h-6 text-burgundy" />;
      case 'banners':
        return <ImageIcon className="w-6 h-6 text-burgundy" />;
      case 'id_cards':
        return <CreditCard className="w-6 h-6 text-burgundy" />;
      case 'visiting_cards':
        return <Layers className="w-6 h-6 text-burgundy" />;
      default:
        return <Sparkles className="w-6 h-6 text-burgundy" />;
    }
  };

  return (
    <div className="bg-burgundy min-h-screen text-charcoal py-8 sm:py-16 px-3 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Hero Banner */}
        <div className="cream-card p-8 sm:p-14 lg:p-16 relative overflow-hidden shadow-2xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-burgundy text-xs font-bold uppercase tracking-widest bg-burgundy/10 px-3.5 py-1.5 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-electric"></span>
              <span>Our Capabilities</span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl text-burgundy uppercase tracking-tight leading-[0.95] mb-6">
              Six Specialized Creative Disciplines. One Flawless Standard.
            </h1>

            <p className="font-editorial text-lg sm:text-2xl text-charcoal/90 italic leading-relaxed">
              Explore our full suite of event capture, festival management, and tactile high-precision printing solutions.
            </p>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                selectedCategory === cat.value
                  ? 'bg-electric text-burgundy shadow-md scale-105'
                  : 'bg-cream-light/10 text-cream border border-cream/20 hover:bg-cream/20'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Services List / Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="cream-card p-8 h-96 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service, idx) => (
              <div
                key={service.id || idx}
                className="cream-card p-7 flex flex-col justify-between group hover:shadow-2xl transition-all duration-300 border border-cream/40 hover:-translate-y-1.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-charcoal/10 group-hover:bg-electric transition-colors">
                      {getServiceIcon(service.category)}
                    </div>
                    <span className="text-[11px] font-bold text-burgundy uppercase tracking-wider bg-burgundy/10 px-2.5 py-1 rounded-full">
                      {service.turnaround_time}
                    </span>
                  </div>

                  <div className="overflow-hidden aspect-video bg-charcoal rounded-xl mb-4 relative shadow-inner">
                    <img
                      src={service.image_url}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <h2 className="font-display text-2xl text-burgundy uppercase tracking-tight mb-2">
                    {service.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-charcoal leading-relaxed mb-4">
                    {service.short_description}
                  </p>

                  {/* Deliverables checklist */}
                  <div className="space-y-2 mb-6 bg-white/60 p-4 rounded-xl border border-charcoal/5">
                    <span className="text-[10px] uppercase font-bold text-charcoal-muted tracking-widest block mb-1">
                      Key Deliverables
                    </span>
                    {(service.features || []).map((feat: string, fIdx: number) => (
                      <div key={fIdx} className="flex items-start gap-2 text-xs text-charcoal/90">
                        <CheckCircle2 className="w-3.5 h-3.5 text-electric shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-burgundy/15 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase text-charcoal-muted tracking-wider block">
                      Starting Investment
                    </span>
                    <span className="font-bold text-sm text-burgundy">
                      {service.starting_price}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/services/${service.slug}`}
                      className="btn-outline text-xs uppercase tracking-wider py-2 px-3.5"
                    >
                      <span>Details</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      to={`/quotation?service=${encodeURIComponent(service.title)}`}
                      className="btn-primary text-xs uppercase tracking-wider py-2 px-3.5 font-bold"
                    >
                      <span>Quote</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
