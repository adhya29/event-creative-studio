import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Upload,
  Check,
  X,
  Eye,
  EyeOff,
  Star,
  Sparkles,
  Calendar,
  User,
} from 'lucide-react';
import { api } from '../../services/api';

export const AdminPortfolio: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const initialForm = {
    title: '',
    category_slug: 'photography',
    description: '',
    client_name: '',
    event_date: new Date().toISOString().split('T')[0],
    image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
    is_featured: false,
    is_published: true,
    order_index: 0,
  };

  const [form, setForm] = useState(initialForm);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cats, port] = await Promise.all([
        api.getPortfolioCategories(),
        api.getAllPortfolioAdmin(),
      ]);
      setCategories(cats);
      setItems(port);
    } catch (err) {
      console.error('Error fetching admin portfolio data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(initialForm);
    setFeedback(null);
    setModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      category_slug: item.category_slug || 'photography',
      description: item.description || '',
      client_name: item.client_name || '',
      event_date: item.event_date || '',
      image_url: item.image_url,
      is_featured: Boolean(item.is_featured),
      is_published: item.is_published !== false,
      order_index: item.order_index || 0,
    });
    setFeedback(null);
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await api.uploadFile(file);
      if (res.success && res.url) {
        setForm((prev) => ({ ...prev, image_url: res.url }));
        setFeedback({ type: 'success', text: 'Image uploaded successfully.' });
      } else {
        setFeedback({ type: 'error', text: res.error || 'Failed to upload image.' });
      }
    } catch {
      setFeedback({ type: 'error', text: 'Error uploading image file.' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.image_url.trim()) {
      setFeedback({ type: 'error', text: 'Title and image URL are required.' });
      return;
    }

    const payload = {
      ...form,
      title: form.title.trim(),
      client_name: form.client_name.trim(),
      description: form.description.trim(),
      image_url: form.image_url.trim(),
      order_index: Number(form.order_index) || 0,
    };

    try {
      if (editingId) {
        await api.updatePortfolioItem(editingId, payload);
        setFeedback({ type: 'success', text: 'Portfolio item updated.' });
      } else {
        await api.createPortfolioItem(payload);
        setFeedback({ type: 'success', text: 'Portfolio item created.' });
      }
      setModalOpen(false);
      fetchData();
    } catch {
      setFeedback({ type: 'error', text: 'Failed to save portfolio item.' });
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete portfolio item '${title}'?`)) return;
    try {
      await api.deletePortfolioItem(id);
      fetchData();
    } catch {
      alert('Failed to delete item.');
    }
  };

  const togglePublish = async (item: any) => {
    try {
      await api.updatePortfolioItem(item.id, { is_published: !item.is_published });
      fetchData();
    } catch {
      alert('Failed to toggle status.');
    }
  };

  const toggleFeatured = async (item: any) => {
    try {
      await api.updatePortfolioItem(item.id, { is_featured: !item.is_featured });
      fetchData();
    } catch {
      alert('Failed to toggle featured status.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-charcoal/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-burgundy uppercase tracking-tight">
            Visual Portfolio Management
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted">
            Add, curate, and feature event photography cases and print samples.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn-primary text-xs uppercase tracking-wider py-2.5 px-5 font-bold self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Project</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Grid of Portfolio Cards in Admin */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <div className="w-8 h-8 border-3 border-burgundy border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-charcoal/10 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="overflow-hidden aspect-[4/3] bg-charcoal rounded-xl mb-3 relative group">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    <button
                      onClick={() => toggleFeatured(item)}
                      title={item.is_featured ? 'Featured on Homepage' : 'Mark as Featured'}
                      className={`p-1.5 rounded-full backdrop-blur-md transition-colors ${
                        item.is_featured
                          ? 'bg-amber-400 text-black shadow-md'
                          : 'bg-black/50 text-white/70 hover:text-white'
                      }`}
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-charcoal-muted mb-1">
                  <span>{item.category_slug}</span>
                  <span>{item.event_date || '2026'}</span>
                </div>

                <h3 className="font-display text-lg text-burgundy uppercase tracking-tight line-clamp-1 mb-1">
                  {item.title}
                </h3>

                <p className="text-xs text-charcoal-muted line-clamp-2 mb-3">
                  {item.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-3 border-t border-charcoal/10 flex items-center justify-between">
                <button
                  onClick={() => togglePublish(item)}
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    item.is_published
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-200 text-charcoal-muted'
                  }`}
                >
                  {item.is_published ? 'Live' : 'Draft'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg hover:bg-burgundy/10 text-burgundy transition-colors"
                    title="Edit Item"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors"
                    title="Delete Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          CREATE / EDIT PORTFOLIO MODAL
         ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-charcoal-muted hover:text-charcoal p-1.5 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-display text-2xl text-burgundy uppercase tracking-tight mb-1">
              {editingId ? 'Edit Portfolio Case' : 'Add New Portfolio Project'}
            </h2>
            <p className="text-xs text-charcoal-muted mb-6">
              Upload event photography, concert stages, or print samples with client credits.
            </p>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-burgundy uppercase tracking-wider mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Royal Heritage Palace Wedding"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-charcoal/20 rounded-xl outline-none focus:border-burgundy"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-burgundy uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={form.category_slug}
                    onChange={(e) => setForm({ ...form, category_slug: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-charcoal/20 rounded-xl outline-none focus:border-burgundy"
                  >
                    <option value="photography">Event Photography</option>
                    <option value="event-management">Event Management</option>
                    <option value="banners">Banners & Signage</option>
                    <option value="id-cards">ID Systems</option>
                    <option value="visiting-cards">Visiting Cards</option>
                    <option value="graphic-design">Graphic Design</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-burgundy uppercase tracking-wider mb-1">
                    Client or Host Name
                  </label>
                  <input
                    type="text"
                    value={form.client_name}
                    onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                    placeholder="e.g. Ananya & Kabir or TechVanguard"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-charcoal/20 rounded-xl outline-none focus:border-burgundy"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-burgundy uppercase tracking-wider mb-1">
                  Case Description & Brief
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Details about lighting, guest scale, venue, or materials used..."
                  className="w-full px-3.5 py-2 bg-gray-50 border border-charcoal/20 rounded-xl outline-none focus:border-burgundy resize-none"
                ></textarea>
              </div>

              {/* Image Input & Upload */}
              <div>
                <label className="block font-bold text-burgundy uppercase tracking-wider mb-1">
                  High-Resolution Image URL or Upload *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    required
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 px-3.5 py-2 bg-gray-50 border border-charcoal/20 rounded-xl outline-none focus:border-burgundy"
                  />
                  <label className="cursor-pointer bg-burgundy/10 hover:bg-burgundy/20 text-burgundy font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-burgundy">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                    className="w-4 h-4 rounded text-burgundy focus:ring-burgundy"
                  />
                  <span>Published in Gallery</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-700">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Featured on Homepage</span>
                </label>
              </div>

              <div className="pt-4 border-t border-charcoal/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-charcoal/20 text-charcoal font-semibold hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2.5 px-6 uppercase tracking-wider font-bold"
                >
                  {editingId ? 'Update Item' : 'Add to Portfolio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
