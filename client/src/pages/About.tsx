import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, ShieldCheck, Award, Sparkles, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useContent } from '../context/ContentContext';

export const About: React.FC = () => {
  const { company, about } = useContent();

  return (
    <div className="bg-burgundy min-h-screen text-charcoal py-8 sm:py-16 px-3 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16">
        
        {/* Editorial Header */}
        <div className="cream-card p-8 sm:p-14 lg:p-16 relative overflow-hidden shadow-2xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-burgundy text-xs font-bold uppercase tracking-widest bg-burgundy/10 px-3.5 py-1.5 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-electric"></span>
              <span>About {company.company_name}</span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl text-burgundy uppercase tracking-tight leading-[0.95] mb-6">
              {about.story_headline || "Crafting visual permanence for life's grandest milestones."}
            </h1>

            <p className="font-editorial text-lg sm:text-2xl text-charcoal/90 italic leading-relaxed">
              "{about.story_body ||
                'Founded with a conviction that every celebration and brand milestone deserves cinematic documentation and cohesive visual identity under one master roof.'}"
            </p>
          </div>
        </div>

        {/* Narrative & Capabilities Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Mission & Purpose */}
          <div className="lg:col-span-6 cream-card p-8 sm:p-12 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-electric font-black text-xl select-none">\ | /</span>
                <span className="text-xs uppercase font-bold text-burgundy tracking-widest">
                  Our Mission
                </span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl text-burgundy uppercase tracking-tight mb-4">
                Harmonizing Digital Imagery with Tactile Print Craft
              </h2>
              <p className="text-sm text-charcoal leading-relaxed mb-6">
                {about.mission ||
                  'To empower brands, couples, institutions and event organizers with unforgettable visual storytelling, flawless event coordination, and tactile print materials that inspire awe.'}
              </p>
              <p className="text-sm text-charcoal leading-relaxed">
                When you hire separate photographers, stage decorators, and printing presses, your brand aesthetic fractures. At {company.company_name}, our colorists, stage coordinators, and print technicians calibrate under the same unified creative direction.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-burgundy/15 grid grid-cols-2 gap-4">
              <div>
                <span className="font-display text-3xl text-burgundy block">100%</span>
                <span className="text-xs text-charcoal-muted uppercase font-medium">In-House QA Review</span>
              </div>
              <div>
                <span className="font-display text-3xl text-burgundy block">24/7</span>
                <span className="text-xs text-charcoal-muted uppercase font-medium">Event Coordination</span>
              </div>
            </div>
          </div>

          {/* Technical Standards Card */}
          <div className="lg:col-span-6 bg-burgundy-dark border border-burgundy-light/40 rounded-3xl p-8 sm:p-12 flex flex-col justify-between text-cream">
            <div>
              <div className="inline-block bg-electric text-burgundy text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-6">
                Technical Caliber
              </div>
              <h2 className="font-display text-3xl sm:text-4xl text-cream uppercase tracking-tight mb-4">
                Professional Equipment & Materials
              </h2>
              <p className="font-editorial text-cream/80 text-base italic mb-6">
                {about.equipment_standards ||
                  'Dual-card full-frame cinema cameras, prime master glass, calibrated profoto wireless strobes, and certified archival print production.'}
              </p>

              <div className="space-y-3 mb-8">
                {[
                  'Dual-Card Redundancy: Every shutter click written simultaneously to dual CFexpress cards to eliminate data loss risk.',
                  'Archival Inks: Pigment-based fade-resistant inks engineered for 50+ year color permanence.',
                  'Precision Substrates: 450 GSM cotton boards, 800-micron thermal gloss PVC, and anti-glare exhibition star flex.',
                  'Calibrated Color Workflows: Standardized CMYK press profiles matching Adobe RGB master digital files.',
                ].map((spec, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-cream/80">
                    <CheckCircle2 className="w-4 h-4 text-electric shrink-0 mt-0.5" />
                    <span>{spec}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              to="/services"
              className="btn-primary justify-center text-xs uppercase tracking-wider py-3.5 font-bold"
            >
              <span>Explore Our Service Catalog</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};
