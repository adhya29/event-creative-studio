import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Trash2,
  Phone,
  Mail,
  MessageSquare,
  X,
  Sparkles,
  Save,
} from 'lucide-react';
import { api } from '../../services/api';

export const AdminEnquiries: React.FC = () => {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEnquiry, setSelectedEnquiry] = useState<any | null>(null);
  const [internalNotes, setInternalNotes] = useState('');
  const [statusDraft, setStatusDraft] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const data = await api.getEnquiriesAdmin(statusFilter);
      setEnquiries(data);
    } catch (err) {
      console.error('Failed to load enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter]);

  const openDetailModal = (enquiry: any) => {
    setSelectedEnquiry(enquiry);
    setInternalNotes(enquiry.internal_notes || '');
    setStatusDraft(enquiry.status);
    setFeedback(null);
  };

  const handleUpdate = async () => {
    if (!selectedEnquiry) return;
    setSavingNotes(true);
    try {
      const res = await api.updateEnquiryStatus(selectedEnquiry.id, statusDraft, internalNotes);
      if (res.success) {
        setFeedback('Enquiry updated successfully.');
        setSelectedEnquiry(res.data);
        fetchEnquiries();
      }
    } catch {
      setFeedback('Error updating enquiry status.');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete enquiry from '${name}'?`)) return;
    try {
      await api.deleteEnquiry(id);
      if (selectedEnquiry?.id === id) setSelectedEnquiry(null);
      fetchEnquiries();
    } catch {
      alert('Failed to delete enquiry.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">New Lead</span>;
      case 'in_progress':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">In Progress</span>;
      case 'contacted':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">Contacted</span>;
      case 'closed':
        return <span className="bg-gray-200 text-charcoal text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">Closed</span>;
      default:
        return <span className="bg-gray-100 text-charcoal text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-charcoal/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-burgundy uppercase tracking-tight">
            Customer Inquiries & Messages
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted">
            Track inquiries submitted through the contact page and public channels.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['all', 'new', 'in_progress', 'contacted', 'closed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                statusFilter === st
                  ? 'bg-burgundy text-cream shadow-sm'
                  : 'bg-gray-100 text-charcoal hover:bg-gray-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Enquiries Table */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <div className="w-8 h-8 border-3 border-burgundy border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : enquiries.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-charcoal-muted">
          <Inbox className="w-12 h-12 text-charcoal/30 mx-auto mb-3" />
          <h3 className="font-display text-xl text-burgundy uppercase">No Inquiries Found</h3>
          <p className="text-xs">There are no inquiries matching status '{statusFilter}'.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-charcoal/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-charcoal/10 text-charcoal-muted uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Interested Service</th>
                  <th className="py-3 px-4">Received</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/10">
                {enquiries.map((enq) => (
                  <tr
                    key={enq.id}
                    onClick={() => openDetailModal(enq)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-burgundy text-sm block">
                        {enq.full_name}
                      </span>
                      <span className="text-[11px] text-charcoal-muted block">
                        {enq.email} &bull; {enq.phone}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-charcoal">
                      {enq.interested_service}
                    </td>

                    <td className="py-3.5 px-4 text-charcoal-muted text-[11px]">
                      {new Date(enq.created_at).toLocaleDateString()} {new Date(enq.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(enq.status)}
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDelete(enq.id, enq.full_name)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors"
                        title="Delete Enquiry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          ENQUIRY DETAIL & NOTES MODAL
         ========================================================================= */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setSelectedEnquiry(null)}
              className="absolute top-4 right-4 text-charcoal-muted hover:text-charcoal p-1.5 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              {getStatusBadge(selectedEnquiry.status)}
              <span className="text-[11px] text-charcoal-muted">
                Received: {new Date(selectedEnquiry.created_at).toLocaleString()}
              </span>
            </div>

            <h2 className="font-display text-2xl text-burgundy uppercase tracking-tight mb-1">
              {selectedEnquiry.full_name}
            </h2>

            <div className="flex flex-wrap items-center gap-4 py-3 border-y border-charcoal/10 text-xs text-charcoal mb-4">
              <a
                href={`mailto:${selectedEnquiry.email}`}
                className="flex items-center gap-1.5 text-burgundy font-semibold hover:underline"
              >
                <Mail className="w-4 h-4" />
                <span>{selectedEnquiry.email}</span>
              </a>

              <a
                href={`tel:${selectedEnquiry.phone}`}
                className="flex items-center gap-1.5 text-burgundy font-semibold hover:underline"
              >
                <Phone className="w-4 h-4" />
                <span>{selectedEnquiry.phone}</span>
              </a>

              <a
                href={`https://wa.me/${selectedEnquiry.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Hello ${selectedEnquiry.full_name}, thank you for contacting Lumina Creative Studio!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-emerald-700 font-bold hover:underline"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>

            <div className="mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted block mb-1">
                Interested Service
              </span>
              <span className="font-bold text-sm text-burgundy">
                {selectedEnquiry.interested_service}
              </span>
            </div>

            <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-charcoal/5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted block mb-1">
                Customer Message
              </span>
              <p className="text-xs text-charcoal leading-relaxed whitespace-pre-line">
                {selectedEnquiry.message}
              </p>
            </div>

            {/* Status Update & Internal Notes Form */}
            <div className="space-y-4 pt-4 border-t border-charcoal/10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-burgundy mb-1">
                    Enquiry Status
                  </label>
                  <select
                    value={statusDraft}
                    onChange={(e) => setStatusDraft(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-charcoal/20 rounded-xl text-xs outline-none focus:border-burgundy"
                  >
                    <option value="new">New Lead</option>
                    <option value="in_progress">In Progress</option>
                    <option value="contacted">Contacted</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                {feedback && (
                  <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 sm:mt-5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{feedback}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-burgundy mb-1">
                  Internal Staff Notes
                </label>
                <textarea
                  rows={2}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Record quote sent, call summary, or follow-up instructions..."
                  className="w-full px-3.5 py-2 bg-gray-50 border border-charcoal/20 rounded-xl text-xs outline-none focus:border-burgundy resize-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => handleDelete(selectedEnquiry.id, selectedEnquiry.full_name)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                >
                  Delete Record
                </button>

                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={savingNotes}
                  className="btn-primary text-xs uppercase tracking-wider py-2 px-5 font-bold disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingNotes ? 'Saving...' : 'Save Updates'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
