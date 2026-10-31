import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock, ArrowUpRight, ShieldCheck, Heart } from 'lucide-react';
import { useContent } from '../context/ContentContext';

export const Footer: React.FC = () => {
  const { company } = useContent();

  const servicesList = [
    { name: 'Event Photography', path: '/services/event-photography' },
    { name: 'Event Management', path: '/services/event-management' },
    { name: 'Banner Design & Printing', path: '/services/banner-design-and-printing' },
    { name: 'ID Card Printing Systems', path: '/services/id-card-design-and-printing' },
    { name: 'Tactile & NFC Visiting Cards', path: '/services/visiting-card-design-and-printing' },
    { name: 'Graphic Design & Branding', path: '/services/graphic-design-and-other-creative-services' },
  ];

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Studio', path: '/about' },
    { name: 'All Services', path: '/services' },
    { name: 'Visual Portfolio', path: '/portfolio' },
    { name: 'Request Quotation', path: '/quotation' },
    { name: 'Contact Us', path: '/contact' },
  ];

  const whatsappUrl = `https://wa.me/${company.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    'Hi! I would like to request an event consultation with Lumina Creative Studio.'
  )}`;

  return (
    <footer className="bg-burgundy-dark text-cream border-t border-burgundy-light/40 pt-16 pb-12 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-16">
          
          {/* Brand Identity & Mission */}
          <div className="lg:col-span-4">
            <Link to="/" className="inline-block mb-4">
              <span className="font-display text-3xl sm:text-4xl text-cream tracking-tight">
                {company.company_name}
              </span>
            </Link>
            <p className="font-editorial text-lg text-cream/90 italic mb-4 leading-relaxed">
              "{company.tagline}"
            </p>
            <p className="text-sm text-cream/70 leading-relaxed mb-6">
              A comprehensive creative agency specializing in cinematic event documentation, full-scale event coordination, and tactile, high-impact print media engineering.
            </p>
            
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-cream text-burgundy hover:bg-electric hover:text-black font-semibold text-xs tracking-wider uppercase px-4 py-2.5 rounded-full transition-all shadow-sm"
            >
              <span>Instant WhatsApp Desk</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

          {/* Core Services Links */}
          <div className="lg:col-span-3">
            <h4 className="font-display text-xl text-electric mb-5 tracking-wide uppercase">
              Creative Services
            </h4>
            <ul className="space-y-2.5 text-sm text-cream/80">
              {servicesList.map((srv) => (
                <li key={srv.path}>
                  <Link
                    to={srv.path}
                    className="hover:text-electric transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cream/40 group-hover:bg-electric transition-colors"></span>
                    <span>{srv.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Navigation */}
          <div className="lg:col-span-2">
            <h4 className="font-display text-xl text-electric mb-5 tracking-wide uppercase">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm text-cream/80">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="hover:text-electric transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Studio Contact Info */}
          <div className="lg:col-span-3">
            <h4 className="font-display text-xl text-electric mb-5 tracking-wide uppercase">
              Studio Details
            </h4>
            <ul className="space-y-3.5 text-xs text-cream/80">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-electric shrink-0 mt-0.5" />
                <span>{company.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-electric shrink-0" />
                <a href={`tel:${company.phone}`} className="hover:text-cream font-medium">
                  {company.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-electric shrink-0" />
                <a href={`mailto:${company.email}`} className="hover:text-cream font-medium">
                  {company.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-electric shrink-0 mt-0.5" />
                <span>{company.working_hours}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Admin Link */}
        <div className="border-t border-burgundy-light/30 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream/60">
          <p>
            &copy; {new Date().getFullYear()} {company.company_name}. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-cream/50">
              Crafted with <Heart className="w-3 h-3 text-red-500 inline fill-red-500" /> for creative excellence
            </span>
            <Link
              to="/admin"
              className="flex items-center gap-1 text-cream/70 hover:text-electric font-medium transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
