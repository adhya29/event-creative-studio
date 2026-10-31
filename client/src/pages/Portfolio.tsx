import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  X,
  Calendar,
  User,
  ArrowUpRight,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';

export const Portfolio: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, port] = await Promise.all([
          api.getPortfolioCategories(),
          api.getPortfolio(),
        ]);
        setCategories(cats);
        setItems(port);
      } catch (err) {
        console.error('Error fetching portfolio data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter items
  const filteredItems =
    selectedCategory === 'all'
      ? items
      : items.filter(
          (item) =>
            item.category_slug === selectedCategory ||
            item.category_id === selectedCategory
        );

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveItem(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="bg-burgundy min-h-screen text-charcoal py-8 sm:py-16 px-3 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Editorial Header */}
        <div className="cream-card p-8 sm:p-14 lg:p-16 relative overflow-hidden shadow-2xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-burgundy text-xs font-bold uppercase tracking-widest bg-burgundy/10 px-3.5 py-1.5 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-electric"></span>
              <span>Our Work</span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl text-burgundy uppercase tracking-tight leading-[0.95] mb-6">
              Event Documentation & Tactile Print Showcase.
            </h1>

            <p className="font-editorial text-lg sm:text-2xl text-charcoal/90 italic leading-relaxed">
              Browse through our authentic event commissions, concert stages, corporate identification systems, and tactile business stationery.
            </p>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-electric text-burgundy shadow-md scale-105'
                : 'bg-cream-light/10 text-cream border border-cream/20 hover:bg-cream/20'
            }`}
          >
            All Works ({items.length})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id || cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-electric text-burgundy shadow-md scale-105'
                  : 'bg-cream-light/10 text-cream border border-cream/20 hover:bg-cream/20'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="polaroid-frame h-96 animate-pulse"></div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="cream-card p-12 text-center text-charcoal max-w-lg mx-auto">
            <h3 className="font-display text-2xl text-burgundy mb-2">No Projects in this Category</h3>
            <p className="text-xs text-charcoal-muted mb-4">
              Select another category or view all works.
            </p>
            <button onClick={() => setSelectedCategory('all')} className="btn-primary text-xs">
              View All Projects
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item, idx) => (
              <div
                key={item.id || idx}
                onClick={() => setActiveItem(item)}
                className={`polaroid-frame rounded-sm flex flex-col justify-between cursor-pointer group hover:scale-[1.02] transition-all duration-300 ${
                  idx % 3 === 0 ? '-rotate-1' : idx % 3 === 1 ? 'rotate-1' : 'rotate-0'
                } hover:rotate-0`}
              >
                <div>
                  <div className="overflow-hidden aspect-[4/3] bg-charcoal mb-4 rounded-xs relative">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-burgundy/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="btn-primary text-xs uppercase tracking-wider py-2 px-4 shadow-lg">
                        <Eye className="w-4 h-4" />
                        <span>Inspect Case</span>
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] uppercase font-bold text-charcoal-muted tracking-widest block mb-1">
                    {item.client_name || 'Client Commission'}
                  </span>

                  <h3 className="font-display text-xl text-burgundy uppercase tracking-tight mb-1.5 group-hover:text-burgundy-light">
                    {item.title}
                  </h3>

                  <p className="font-editorial text-xs text-charcoal/80 italic line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 mt-4 border-t border-charcoal/10 flex items-center justify-between text-[11px] text-charcoal-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-burgundy" />
                    {item.event_date || '2026'}
                  </span>
                  <span className="font-bold text-burgundy uppercase tracking-wider">
                    View Lightbox
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Quote Banner */}
        <div className="cream-card p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-xl">
          <h3 className="font-display text-3xl sm:text-4xl text-burgundy uppercase tracking-tight mb-3">
            Want Similar Results For Your Celebration or Brand?
          </h3>
          <p className="font-editorial text-charcoal/90 text-base italic mb-6 max-w-xl mx-auto">
            Every project in our portfolio began with a simple conversation. Let's design your event experience.
          </p>
          <Link to="/quotation" className="btn-primary text-xs uppercase tracking-wider py-3.5 px-7 font-bold">
            <span>Request Quotation</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

      </div>

      {/* =========================================================================
          LIGHTBOX MODAL
         ========================================================================= */}
      {activeItem && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          onClick={() => setActiveItem(null)}
        >
          <div
            className="bg-cream max-w-4xl w-full rounded-2xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setActiveItem(null)}
              className="absolute top-4 right-4 z-20 bg-burgundy text-cream hover:bg-black p-2 rounded-full transition-colors shadow-md"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Lightbox Image Preview */}
            <div className="md:w-3/5 bg-charcoal-dark flex items-center justify-center overflow-hidden">
              <img
                src={activeItem.image_url}
                alt={activeItem.title}
                className="w-full h-full object-contain max-h-[60vh] md:max-h-[85vh]"
              />
            </div>

            {/* Lightbox Details Panel */}
            <div className="md:w-2/5 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="inline-block bg-burgundy/10 text-burgundy text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                  Commissioned Case
                </div>

                <h2 className="font-display text-2xl sm:text-3xl text-burgundy uppercase tracking-tight mb-3">
                  {activeItem.title}
                </h2>

                <p className="font-editorial text-sm sm:text-base text-charcoal italic mb-6 leading-relaxed">
                  "{activeItem.description}"
                </p>

                <div className="space-y-3 py-4 border-y border-burgundy/15 text-xs text-charcoal">
                  <div className="flex items-center justify-between">
                    <span className="text-charcoal-muted uppercase tracking-wider">Client / Host:</span>
                    <span className="font-bold text-burgundy">{activeItem.client_name || 'Commissioned Project'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-charcoal-muted uppercase tracking-wider">Date Documented:</span>
                    <span className="font-bold text-burgundy">{activeItem.event_date || '2026 Season'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 space-y-3">
                <Link
                  to={`/quotation?service=${encodeURIComponent(activeItem.title)}`}
                  onClick={() => setActiveItem(null)}
                  className="btn-primary w-full justify-center text-xs uppercase tracking-wider py-3"
                >
                  <span>Request Similar Quote</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => setActiveItem(null)}
                  className="w-full text-center text-xs text-charcoal-muted hover:text-burgundy uppercase font-semibold py-1"
                >
                  Close Lightbox (Esc)
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
