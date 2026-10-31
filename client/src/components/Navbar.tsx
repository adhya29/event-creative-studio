import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowUpRight, Phone, MessageSquare } from 'lucide-react';
import { useContent } from '../context/ContentContext';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { company } = useContent();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const whatsappUrl = `https://wa.me/${company.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    'Hello Lumina Creative Studio! I would like to enquire about your event and design services.'
  )}`;

  return (
    <header className="sticky top-0 z-50 px-4 sm:px-6 lg:px-12 py-3 bg-burgundy/95 backdrop-blur-md transition-all duration-300 border-b border-burgundy-light/30">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-full bg-electric flex items-center justify-center font-display text-xl text-burgundy shadow-sm group-hover:rotate-12 transition-transform">
            L
          </div>
          <div className="flex flex-col">
            <span className="font-display text-2xl lg:text-3xl text-cream tracking-tight leading-none">
              {company.company_name}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-cream/70 font-sans font-medium">
              Creative & Events
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links in Editorial Pill */}
        <nav className="hidden md:flex items-center gap-1 bg-cream-light/10 border border-cream/20 px-4 py-1.5 rounded-full backdrop-blur-sm">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-electric text-burgundy font-bold shadow-sm'
                    : 'text-cream hover:text-white hover:bg-white/10'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Chat on WhatsApp"
            className="w-10 h-10 rounded-full border border-cream/30 text-cream flex items-center justify-center hover:bg-cream/15 hover:border-cream transition-all"
          >
            <MessageSquare className="w-4 h-4 text-electric" />
          </a>

          <Link
            to="/quotation"
            className="btn-primary text-xs uppercase tracking-wider py-2.5 px-5 font-bold flex items-center gap-1.5"
          >
            <span>Get a Quote</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-cream p-2 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="w-6 h-6 text-electric" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden mt-3 pt-3 pb-5 px-4 bg-cream text-burgundy rounded-2xl border border-cream shadow-2xl transition-all">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-2.5 rounded-xl font-medium text-base transition-colors ${
                    active
                      ? 'bg-burgundy text-cream font-bold'
                      : 'text-charcoal hover:bg-burgundy/10'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <hr className="my-2 border-charcoal/15" />
            <Link
              to="/quotation"
              onClick={() => setIsOpen(false)}
              className="btn-primary justify-center text-sm uppercase tracking-wider py-3"
            >
              <span>Get a Quotation</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <div className="flex items-center justify-between pt-2 px-2 text-xs text-charcoal-muted">
              <span>Need quick assistance?</span>
              <a
                href={`tel:${company.phone}`}
                className="font-bold text-burgundy flex items-center gap-1 underline"
              >
                <Phone className="w-3.5 h-3.5" />
                {company.phone}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
