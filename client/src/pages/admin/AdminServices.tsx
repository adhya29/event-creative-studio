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
  Sparkles,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { api } from '../../services/api';

export const AdminServices: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const initialForm = {
    title: '',
    slug: '',
    category: 'photography',
    short_description: '',
    full_description: '',
    featuresText: '', // newline separated features for easy editing
    image_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop',
    starting_price: '₹25,000 / day',
    turnaround_time: '5 - 7 Days',
    is_published: true,
    order_index: 0,
  };

  const [form, setForm] = useState(initialForm);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await api.getAllServicesAdmin();
      setServices(data);
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(initialForm);
    setFeedback(null);
    setModalOpen(true);
  };

  const openEditModal = (service: any) => {
    setEditingId(service.id);
    setForm({
      title: service.title,
      slug: service.slug,
      category: service.category,
      short_description: service.short_description,
      full_description: service.full_description,
      featuresText: Array.isArray(service.features) ? service.features.join('\n') : '',
      image_url: service.image_url,
      starting_price: service.starting_price || '',
      turnaround_time: service.turnaround_time || '',
      is_published: service.is_published !== false,
      order_index: service.order_index || 0,
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
      setFeedback({ type: 'error', text: 'Error uploading image.' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setFeedback({ type: 'error', text: 'Service title is required.' });
      return;
    }

    const features = form.featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: form.category,
      short_description: form.short_description.trim(),
      full_description: form.full_description.trim(),
      features,
      image_url: form.image_url.trim(),
      starting_price: form.starting_price.trim(),
      turnaround_time: form.turnaround_time.trim(),
      is_published: form.is_published,
      order_index: Number(form.order_index) || 0,
    };

    try {
      if (editingId) {
        await api.updateService(editingId, payload);
        setFeedback({ type: 'success', text: 'Service updated successfully.' });
      } else {
        await api.createService(payload);
        setFeedback({ type: 'success', text: 'Service created successfully.' });
      }
      setModalOpen(false);
      fetchServices();
    } catch {
      setFeedback({ type: 'error', text: 'Failed to save service.' });
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete service '${title}'?`)) return;
    try {
      await api.deleteService(id);
      fetchServices();
    } catch (err) {
      alert('Failed to delete service.');
    }
  };

  const togglePublish = async (service: any) => {
    try {
      await api.updateService(service.id, { is_published: !service.is_published });
      fetchServices();
    } catch {
      alert('Failed to toggle publish status.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-charcoal/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-burgundy uppercase tracking-tight">
            Service Catalog Management
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted">
            Configure the 6 core creative disciplines, deliverables, turnaround periods, and pricing.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn-primary text-xs uppercase tracking-wider py-2.5 px-5 font-bold self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
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

      {/* Services List Table */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <div className="w-8 h-8 border-3 border-burgundy border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-charcoal/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-charcoal/10 text-charcoal-muted uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Investment</th>
                  <th className="py-3 px-4">Turnaround</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/10">
                {services.map((srv) => (
                  <tr key={srv.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={srv.image_url}
                          alt={srv.title}
                          className="w-12 h-9 object-cover rounded-md bg-charcoal"
                        />
                        <div>
                          <span className="font-bold text-burgundy text-sm block">
                            {srv.title}
                          </span>
                          <span className="text-[11px] text-charcoal-muted truncate max-w-xs block">
                            {srv.short_description}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-charcoal uppercase text-[11px]">
                      {srv.category}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-burgundy">
                      {srv.starting_price}
                    </td>

                    <td className="py-3.5 px-4 text-charcoal-muted">
                      {srv.turnaround_time}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => togglePublish(srv)}
                        title={srv.is_published ? 'Click to Unpublish' : 'Click to Publish'}
                        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full transition-colors ${
                          srv.is_published
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-gray-200 text-charcoal-muted hover:bg-gray-300'
                        }`}
                      >
                        {srv.is_published ? (
                          <>
                            <Eye className="w-3 h-3 text-emerald-600" />
                            <span>Live</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(srv)}
                          className="p-1.5 rounded-lg hover:bg-burgundy/10 text-burgundy transition-colors"
                          title="Edit Service"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(srv.id, srv.title)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors"
                          title="Delete Service"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          CREATE / EDIT SERVICE MODAL
         ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-charcoal-muted hover:text-charcoal p-1.5 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-display text-2xl text-burgundy uppercase tracking-tight mb-1">
              {editingId ? 'Edit Service Details' : 'Add New Creative Service'}
            </h2>
            <p className="text-xs text-charcoal-muted mb-6">
              Configure public deliverables, pricing guidelines, and featured photography.
            </p>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-burgundy uppercase tracking-wider mb-1">
                    Service Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Event Photography"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-charcoal/20 rounded-xl outline-none focus:border-burgundy"
                  />
                </div>

                <div>
                  <label className="block font-bold text-burgundy uppercase tracking-wider mb-1">
                    Category Key *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-charcoal/20 rounded-xl outline-none focus:border-burgundy"
                  >
                    <option value="photography">Photography</option>
                    <option value="event_management">Event Management</option>
                    <option value="banners">Banner Design & Printing</option>
                    <option value="id_cards">ID Card Systems</option>
                    <option value="visiting_cards">Visiting Cards</option>
                    <option value="graphic_design">Graphic Design</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-burgundy uppercase tracking-wider mb-1">
                  Short Hook Description *
                </label>
                <textarea
                  required
                  rows={2}
                  value={form.short_description}
                  onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                  placeholder="Appears on cards and homepage..."
                  className="w-full px-3.5 py-2 bg-gray-50 border border-charcoal/20 rounded-xl outline-none focus:border-burgundy resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-burgundy uppercase tracking-wider mb-1">
                  Full Service Scope & Technical Narrative
                </label>
                <textarea
                  rows={4}
                  value={form.full_description}
                  onChange={(e) => setForm({ ...form, full_description: e.target.value })}
                  placeholder="Detailed breakdown shown on dedicated service detail page..."
                  className="w-full px-3.5 py-2 bg-gray-50 border border-charcoal/20 rounded-xl outline-none focus:border-burgundy resize-y"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-burgundy uppercase tracking-wider mb-1">
                  Key Deliverables (One per line)
                </label>
                <textarea
                  rows={3}
                  value={form.featuresText}
                  onChange={(e) => setForm({ ...form, featuresText: e.target.value })}
                  placeholder="Multi-camera coverage&#10;Color-graded digital master album&#10;Drone aerial capture"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-charcoal/20 rounded-xl outline-none focus:border-burgundy resize-y font-mono text-[11px]"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-burgundy uppercase tracking-wider mb-1">
                    Starting Price / Investment
                  </label>
                  <input
                    type="text"
                    value={form.starting_price}
                    onChange={(e) => setForm({ ...form, starting_price: e.target.value })}
                    placeholder="e.g. ₹25,000 / day"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-charcoal/20 rounded-xl outline-none focus:border-burgundy"
                  />
                </div>

                <div>
                  <label className="block font-bold text-burgundy uppercase tracking-wider mb-1">
                    Turnaround Time
                  </label>
                  <input
                    type="text"
                    value={form.turnaround_time}
                    onChange={(e) => setForm({ ...form, turnaround_time: e.target.value })}
                    placeholder="e.g. 5 - 7 Days"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-charcoal/20 rounded-xl outline-none focus:border-burgundy"
                  />
                </div>
              </div>

              {/* Image Input & Uploader */}
              <div>
                <label className="block font-bold text-burgundy uppercase tracking-wider mb-1">
                  Featured Image URL or Upload File
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
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
                  <span>Published on Public Website</span>
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
                  {editingId ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
