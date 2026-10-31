import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Trash2,
  Phone,
  Mail,
  MessageSquare,
  X,
  Sparkles,
  Save,
  MapPin,
  Calendar,
  Layers,
} from 'lucide-react';
import { api } from '../../services/api';

export const AdminQuotations: React.FC = () => {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedQuot, setSelectedQuot] = useState<any | null>(null);
  const [internalNotes, setInternalNotes] = useState('');
  const [statusDraft, setStatusDraft] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const data = await api.getQuotationsAdmin(statusFilter);
      setQuotations(data);
    } catch (err) {
      console.error('Failed to load quotations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [statusFilter]);

  const openDetailModal = (quot: any) => {
    setSelectedQuot(quot);
    setInternalNotes(quot.internal_notes || '');
    setStatusDraft(quot.status);
    setFeedback(null);
  };

  const handleUpdate = async () => {
    if (!selectedQuot) return;
    setSavingNotes(true);
    try {
      const res = await api.updateQuotationStatus(selectedQuot.id, statusDraft, internalNotes);
      if (res.success) {
        setFeedback('Quotation status & notes saved.');
        setSelectedQuot(res.data);
        fetchQuotations();
      }
    } catch {
      setFeedback('Error updating quotation record.');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete quotation request from '${name}'?`)) return;
    try {
      await api.deleteQuotation(id);
      if (selectedQuot?.id === id) setSelectedQuot(null);
      fetchQuotations();
    } catch {
      alert('Failed to delete quotation.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">Pending Review</span>;
      case 'reviewed':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">Reviewed</span>;
      case 'quoted':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">Estimate Sent</span>;
      case 'accepted':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">Accepted / Booked</span>;
      case 'declined':
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">Declined</span>;
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
            Event Quotation Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted">
            Manage bespoke multi-service event estimates, dates, locations, and client budgets.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['all', 'pending', 'reviewed', 'quoted', 'accepted', 'declined'].map((st) => (
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

      {/* Quotations Table */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <div className="w-8 h-8 border-3 border-burgundy border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : quotations.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-charcoal-muted">
          <FileSpreadsheet className="w-12 h-12 text-charcoal/30 mx-auto mb-3" />
          <h3 className="font-display text-xl text-burgundy uppercase">No Quotations Found</h3>
          <p className="text-xs">There are no quotation requests matching status '{statusFilter}'.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-charcoal/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-charcoal/10 text-charcoal-muted uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Timeline & Venue</th>
                  <th className="py-3 px-4">Services Scope</th>
                  <th className="py-3 px-4">Budget</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/10">
                {quotations.map((quot) => (
                  <tr
                    key={quot.id}
                    onClick={() => openDetailModal(quot)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-burgundy text-sm block">
                        {quot.full_name}
                      </span>
                      <span className="text-[11px] text-charcoal-muted block">
                        {quot.email} &bull; {quot.phone}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-charcoal">
                      {quot.event_type}
                    </td>

                    <td className="py-3.5 px-4 text-charcoal-muted text-[11px]">
                      <div>{quot.event_date}</div>
                      <div className="text-[10px] text-charcoal">{quot.event_location}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(quot.required_services || []).map((srv: string, sIdx: number) => (
                          <span
                            key={sIdx}
                            className="bg-burgundy/10 text-burgundy text-[9px] font-bold px-2 py-0.5 rounded"
                          >
                            {srv}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-charcoal">
                      {quot.estimated_budget || 'Unspecified'}
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(quot.status)}
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDelete(quot.id, quot.full_name)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors"
                        title="Delete Quotation"
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
          QUOTATION DETAIL & PROPOSAL MODAL
         ========================================================================= */}
      {selectedQuot && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setSelectedQuot(null)}
              className="absolute top-4 right-4 text-charcoal-muted hover:text-charcoal p-1.5 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              {getStatusBadge(selectedQuot.status)}
              <span className="text-[11px] text-charcoal-muted">
                Submitted: {new Date(selectedQuot.created_at).toLocaleString()}
              </span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl text-burgundy uppercase tracking-tight mb-1">
              {selectedQuot.full_name}
            </h2>

            {/* Direct Contact Bar */}
            <div className="flex flex-wrap items-center gap-4 py-3 border-y border-charcoal/10 text-xs text-charcoal mb-4">
              <a
                href={`mailto:${selectedQuot.email}`}
                className="flex items-center gap-1.5 text-burgundy font-semibold hover:underline"
              >
                <Mail className="w-4 h-4" />
                <span>{selectedQuot.email}</span>
              </a>

              <a
                href={`tel:${selectedQuot.phone}`}
                className="flex items-center gap-1.5 text-burgundy font-semibold hover:underline"
              >
                <Phone className="w-4 h-4" />
                <span>{selectedQuot.phone}</span>
              </a>

              <a
                href={`https://wa.me/${selectedQuot.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Hello ${selectedQuot.full_name}! Regarding your quotation for ${selectedQuot.event_type} on ${selectedQuot.event_date}...`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-emerald-700 font-bold hover:underline"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Quote</span>
              </a>
            </div>

            {/* Event Specifics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 text-xs">
              <div className="bg-gray-50 p-3 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-charcoal-muted block">Event Type</span>
                <span className="font-bold text-burgundy">{selectedQuot.event_type}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-charcoal-muted block">Date / Timeline</span>
                <span className="font-bold text-burgundy">{selectedQuot.event_date}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-charcoal-muted block">Venue / City</span>
                <span className="font-bold text-burgundy">{selectedQuot.event_location}</span>
              </div>
            </div>

            {/* Required Services */}
            <div className="mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted block mb-2">
                Selected Creative Services
              </span>
              <div className="flex flex-wrap gap-2">
                {(selectedQuot.required_services || []).map((srv: string, idx: number) => (
                  <span
                    key={idx}
                    className="bg-burgundy text-cream text-xs font-semibold px-3 py-1 rounded-lg flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-electric" />
                    <span>{srv}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Budget & Additional Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-xs">
              <div className="bg-gray-50 p-3.5 rounded-xl border border-charcoal/5">
                <span className="text-[10px] uppercase font-bold text-charcoal-muted block mb-1">
                  Budget Expectation
                </span>
                <span className="font-bold text-sm text-burgundy">
                  {selectedQuot.estimated_budget || 'Unspecified'}
                </span>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-xl border border-charcoal/5">
                <span className="text-[10px] uppercase font-bold text-charcoal-muted block mb-1">
                  Client Notes / Deliverables
                </span>
                <p className="text-xs text-charcoal leading-relaxed whitespace-pre-line">
                  {selectedQuot.additional_requirements || 'None specified.'}
                </p>
              </div>
            </div>

            {/* Status & Staff Notes */}
            <div className="space-y-4 pt-4 border-t border-charcoal/10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-burgundy mb-1">
                    Quotation Pipeline Status
                  </label>
                  <select
                    value={statusDraft}
                    onChange={(e) => setStatusDraft(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-charcoal/20 rounded-xl text-xs outline-none focus:border-burgundy"
                  >
                    <option value="pending">Pending Review</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="quoted">Estimate Sent</option>
                    <option value="accepted">Accepted / Booked</option>
                    <option value="declined">Declined</option>
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
                  Internal Production Notes
                </label>
                <textarea
                  rows={2}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Record estimate details, camera team assigned, stage contractor notes..."
                  className="w-full px-3.5 py-2 bg-gray-50 border border-charcoal/20 rounded-xl text-xs outline-none focus:border-burgundy resize-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => handleDelete(selectedQuot.id, selectedQuot.full_name)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                >
                  Delete Quotation
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
