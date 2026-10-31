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
  Shield,
  Award,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { api } from '../services/api';

export const Home: React.FC = () => {
  const { company, hero } = useContent();
  const [services, setServices] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [srvData, portData] = await Promise.all([
          api.getServices(),
          api.getPortfolio(undefined, true),
        ]);
        setServices(srvData);
        setPortfolio(portData.slice(0, 4));
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoadingServices(false);
      }
    };
    fetchData();
  }, []);

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
    <div className="bg-burgundy min-h-screen text-charcoal">
      
      {/* =========================================================================
          HERO SECTION (Editorial Board Aesthetic: Cream Container on Burgundy Canvas)
         ========================================================================= */}
      <section className="px-3 sm:px-6 lg:px-12 pt-4 pb-12 sm:pb-20">
        <div className="max-w-7xl mx-auto cream-card p-6 sm:p-10 lg:p-16 relative overflow-hidden shadow-2xl">
          
          {/* Subtle background grid pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#650A08_1px,transparent_1px)] [background-size:16px_16px]"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center relative z-10">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7">
              {/* Category Pill Badge */}
              <div className="inline-flex items-center gap-2 bg-burgundy/10 text-burgundy text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-6">
                <span className="w-2 h-2 rounded-full bg-electric animate-pulse"></span>
                <span>{hero.badge_text || 'Full-Service Creative Agency'}</span>
              </div>

              {/* Expressive Headline with Playful Spark Icon */}
              <div className="relative mb-6">
                <div className="absolute -top-7 -right-2 sm:-top-8 sm:right-12 text-electric font-black text-2xl sm:text-3xl select-none hidden sm:block">
                  \ | /
                </div>
                <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl text-burgundy tracking-tight leading-[0.92] uppercase">
                  {hero.headline_line1 || 'Events'}<br />
                  {hero.headline_line2 || 'Captured.'}<br />
                  <span className="text-burgundy-light">{hero.headline_line3 || 'Stories'}</span><br />
                  {hero.headline_line4 || 'Created.'}
                </h1>
              </div>

              {/* Editorial Subtitle */}
              <p className="font-editorial text-lg sm:text-2xl text-charcoal/90 mb-8 max-w-xl leading-relaxed italic">
                {hero.subheading ||
                  'Event photography, event management and creative design services that turn your moments into lasting memories.'}
              </p>

              {/* Action Buttons matching visual design reference */}
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/services"
                  className="btn-primary text-sm uppercase tracking-wider py-3.5 px-7 font-bold group"
                >
                  <span>Explore Services</span>
                  <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>

                <Link
                  to="/portfolio"
                  className="btn-outline text-sm uppercase tracking-wider py-3.5 px-7 font-semibold"
                >
                  <span>View Portfolio</span>
                </Link>

                <Link
                  to="/quotation"
                  className="btn-secondary text-sm uppercase tracking-wider py-3.5 px-7 font-semibold ml-auto sm:ml-0"
                >
                  <span>Get a Quote</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Fast Stats Row */}
              <div className="grid grid-cols-3 gap-4 pt-10 mt-10 border-t border-burgundy/15">
                {(hero.stats || []).map((stat, idx) => (
                  <div key={idx}>
                    <div className="font-display text-2xl sm:text-3xl text-burgundy leading-none mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs text-charcoal-muted uppercase tracking-wider font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Hero Visual Column: Tilted Polaroid Composition */}
            <div className="lg:col-span-5 flex justify-center items-center relative">
              
              {/* Backing accent geometric card */}
              <div className="absolute w-64 h-80 sm:w-80 sm:h-96 bg-burgundy rounded-2xl rotate-6 translate-x-4 translate-y-3 opacity-90 hidden sm:block"></div>

              {/* Foreground Tilted Polaroid Frame */}
              <div className="relative z-10 polaroid-frame -rotate-2 max-w-sm sm:max-w-md w-full rounded-sm">
                <div className="overflow-hidden aspect-[4/3] bg-charcoal-dark mb-3 rounded-xs">
                  <img
                    src={hero.hero_image || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop'}
                    alt="Event documentation in action"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="flex items-center justify-between px-1">
                  <div>
                    <p className="font-display text-burgundy text-lg tracking-wide uppercase">
                      Live Stage & Ceremony Coverage
                    </p>
                    <p className="font-editorial text-xs text-charcoal-muted italic">
                      Multi-camera precision by {company.company_name}
                    </p>
                  </div>
                  <span className="w-3 h-3 rounded-full bg-electric"></span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: COMPANY INTRODUCTION & VALUES (Burgundy on Warm Cream)
         ========================================================================= */}
      <section className="px-3 sm:px-6 lg:px-12 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          <div className="lg:col-span-7 cream-card p-8 sm:p-12 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-electric font-bold text-lg select-none">\ | /</span>
                <span className="text-xs font-bold text-burgundy uppercase tracking-widest">
                  Our Creative Philosophy
                </span>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl text-burgundy uppercase tracking-tight mb-6 leading-tight">
                One Master Agency. Zero Compromises on Craft.
              </h2>
              <p className="font-editorial text-lg text-charcoal/90 italic mb-6 leading-relaxed">
                Most agencies do only photos, or only stage coordination, or only print orders. We built {company.company_name} so you never have to reconcile competing vendors.
              </p>
              <p className="text-sm text-charcoal leading-relaxed mb-6">
                From capturing candid emotional tears during grand wedding vows, to coordinating concert stage acoustics and printing heavy-duty weather-sealed exhibition standees — our specialized team delivers harmonized creative excellence across digital and tactile mediums.
              </p>
            </div>

            <div className="pt-6 border-t border-burgundy/15 flex flex-wrap items-center gap-6 text-xs text-burgundy font-bold uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-electric" /> On-Time Guaranteed Delivery
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-electric" /> Full-Frame Cinema Gear
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-electric" /> Archival Print Materials
              </span>
            </div>
          </div>

          {/* Quick Quote Promo Card */}
          <div className="lg:col-span-5 bg-burgundy-dark border border-burgundy-light/40 rounded-3xl p-8 sm:p-12 flex flex-col justify-between text-cream relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-36 h-36 bg-electric/15 rounded-full blur-2xl pointer-events-none"></div>

            <div>
              <div className="inline-block bg-electric text-burgundy text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-6">
                Instant Event Consultation
              </div>
              <h3 className="font-display text-3xl sm:text-4xl text-cream uppercase tracking-tight mb-4 leading-tight">
                Have An Upcoming Event or Print Project?
              </h3>
              <p className="font-editorial text-cream/80 text-base italic mb-6">
                Tell us your event date, city, and required creative services. We prepare a tailored package with transparent pricing within 24 hours.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                to="/quotation"
                className="btn-primary w-full justify-center text-sm uppercase tracking-wider py-3.5"
              >
                <span>Request Custom Quotation</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <p className="text-center text-xs text-cream/50">
                Direct WhatsApp assistance also available 24/7
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 3: THE 6 CORE SERVICES (Dynamic from Database)
         ========================================================================= */}
      <section className="px-3 sm:px-6 lg:px-12 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-electric font-black text-xl select-none">\ | /</span>
                <span className="text-xs uppercase font-bold text-cream tracking-widest">
                  Comprehensive Offerings
                </span>
              </div>
              <h2 className="font-display text-4xl sm:text-6xl text-cream uppercase tracking-tight">
                Our Creative Services
              </h2>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-cream hover:text-electric text-sm font-semibold uppercase tracking-wider group"
            >
              <span>View All 6 Service Specifications</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loadingServices ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="cream-card p-6 h-80 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, idx) => (
                <div
                  key={service.id || idx}
                  className="cream-card p-6 sm:p-7 flex flex-col justify-between group hover:shadow-2xl transition-all duration-300 border border-cream/50 hover:-translate-y-1"
                >
                  <div>
                    {/* Header with Icon and Order Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-charcoal/10 group-hover:bg-electric transition-colors">
                        {getServiceIcon(service.category)}
                      </div>
                      <span className="font-display text-xl text-burgundy/40">
                        0{idx + 1}
                      </span>
                    </div>

                    {/* Image Preview with polaroid styling */}
                    <div className="overflow-hidden aspect-video bg-charcoal rounded-xl mb-4 relative shadow-inner">
                      <img
                        src={service.image_url}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute bottom-2 right-2 bg-burgundy/90 text-cream text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full">
                        {service.turnaround_time || 'Fast Turnaround'}
                      </div>
                    </div>

                    <h3 className="font-display text-2xl text-burgundy uppercase tracking-tight mb-2 group-hover:text-burgundy-light transition-colors">
                      {service.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-charcoal leading-relaxed mb-4 line-clamp-2">
                      {service.short_description}
                    </p>

                    {/* Deliverables snippet */}
                    <div className="space-y-1 mb-6">
                      {(service.features || []).slice(0, 2).map((feat: string, fIdx: number) => (
                        <div key={fIdx} className="flex items-center gap-2 text-xs text-charcoal/80">
                          <CheckCircle2 className="w-3.5 h-3.5 text-electric shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-burgundy/15 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase text-charcoal-muted tracking-wider block">
                        Investment
                      </span>
                      <span className="font-bold text-xs text-burgundy">
                        {service.starting_price}
                      </span>
                    </div>
                    <Link
                      to={`/services/${service.slug}`}
                      className="btn-outline text-xs uppercase tracking-wider py-2 px-4"
                    >
                      <span>Explore</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* =========================================================================
          SECTION 4: FEATURED PORTFOLIO HIGHLIGHTS (Asymmetric Editorial Grid)
         ========================================================================= */}
      <section className="px-3 sm:px-6 lg:px-12 py-12 sm:py-20 bg-burgundy-dark/60 border-y border-burgundy-light/20">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-electric font-black text-xl select-none">\ | /</span>
                <span className="text-xs uppercase font-bold text-cream tracking-widest">
                  Visual Mastery
                </span>
              </div>
              <h2 className="font-display text-4xl sm:text-6xl text-cream uppercase tracking-tight">
                Selected Portfolio
              </h2>
            </div>
            <Link
              to="/portfolio"
              className="btn-primary text-xs uppercase tracking-wider py-3 px-6 font-bold"
            >
              <span>View Full Gallery ({portfolio.length}+ Projects)</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Grid layout with photo cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {portfolio.map((item, idx) => (
              <div
                key={item.id || idx}
                className={`polaroid-frame rounded-sm flex flex-col justify-between ${
                  idx % 2 === 0 ? '-rotate-1' : 'rotate-1'
                } hover:rotate-0 transition-transform`}
              >
                <div>
                  <div className="overflow-hidden aspect-[4/5] bg-charcoal mb-3 rounded-xs relative group">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-burgundy/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Link
                        to="/portfolio"
                        className="bg-cream text-burgundy p-3 rounded-full hover:bg-electric hover:text-black transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>

                  <span className="text-[10px] uppercase font-bold text-charcoal-muted tracking-wider block mb-1">
                    {item.client_name || 'Client Commission'}
                  </span>
                  <h4 className="font-display text-lg text-burgundy uppercase tracking-tight line-clamp-1 mb-1">
                    {item.title}
                  </h4>
                  <p className="font-editorial text-xs text-charcoal/80 italic line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-charcoal/10 flex items-center justify-between text-[11px] text-charcoal-muted">
                  <span>{item.event_date || '2026 Season'}</span>
                  <span className="font-bold text-burgundy uppercase">Project Case</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 5: OUR CREATIVE 4-STEP PROCESS
         ========================================================================= */}
      <section className="px-3 sm:px-6 lg:px-12 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto cream-card p-8 sm:p-14 lg:p-16">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-electric font-black text-2xl select-none block mb-2">\ | /</span>
            <span className="text-xs uppercase font-bold text-burgundy tracking-widest block mb-2">
              Disciplined Execution
            </span>
            <h2 className="font-display text-4xl sm:text-5xl text-burgundy uppercase tracking-tight">
              Our 4-Stage Creative Process
            </h2>
            <p className="font-editorial text-charcoal/90 text-base italic mt-3">
              How we transform abstract event visions into flawless physical and visual reality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {[
              {
                step: '01',
                title: 'Creative Discovery',
                desc: 'We examine your event itinerary, venue acoustics, lighting conditions, and brand aesthetics to map exact technical deliverables.',
                icon: Clock,
              },
              {
                step: '02',
                title: 'Design & Pre-Press',
                desc: 'Our design unit crafts 3D stage previews, banner artwork proofs, and tactile visiting card samples with CMYK calibrated color profiles.',
                icon: Layers,
              },
              {
                step: '03',
                title: 'On-Ground Execution',
                desc: 'Our multi-camera cinema crews document the celebration while stage managers handle audiovisual cues, truss backdrops, and badge distribution.',
                icon: Shield,
              },
              {
                step: '04',
                title: 'Archival Delivery',
                desc: 'Color-graded high-resolution master galleries, cinema highlight edits, and archival print albums delivered punctually to your door.',
                icon: Award,
              },
            ].map((p, idx) => (
              <div key={idx} className="bg-white p-7 rounded-2xl border border-charcoal/10 shadow-sm relative group hover:border-burgundy transition-colors">
                <div className="font-display text-4xl text-burgundy/20 group-hover:text-electric transition-colors mb-4">
                  {p.step}
                </div>
                <h3 className="font-display text-xl text-burgundy uppercase tracking-tight mb-2">
                  {p.title}
                </h3>
                <p className="text-xs text-charcoal leading-relaxed">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 6: ENQUIRY BANNER CTA
         ========================================================================= */}
      <section className="px-3 sm:px-6 lg:px-12 pb-20">
        <div className="max-w-7xl mx-auto bg-gradient-to-r from-burgundy-dark to-burgundy border-2 border-electric/40 rounded-3xl p-8 sm:p-14 lg:p-16 text-center relative overflow-hidden shadow-2xl">
          <div className="max-w-3xl mx-auto relative z-10">
            <span className="text-electric font-black text-3xl select-none block mb-3">\ | /</span>
            <h2 className="font-display text-4xl sm:text-6xl text-cream uppercase tracking-tight mb-6 leading-tight">
              Ready to Capture Your Next Grand Milestone?
            </h2>
            <p className="font-editorial text-cream/90 text-lg sm:text-xl italic mb-8 max-w-xl mx-auto leading-relaxed">
              Book your event coverage date or request custom print design quotes before our monthly production calendar fills up.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/quotation"
                className="btn-primary text-sm uppercase tracking-wider py-4 px-8 font-bold"
              >
                <span>Request Quotation</span>
                <ArrowUpRight className="w-5 h-5" />
              </Link>

              <Link
                to="/contact"
                className="bg-cream text-burgundy hover:bg-white font-bold text-sm uppercase tracking-wider py-4 px-8 rounded-full transition-all"
              >
                <span>General Enquiry</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
