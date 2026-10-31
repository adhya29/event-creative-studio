import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox,
  FileSpreadsheet,
  Briefcase,
  Image as ImageIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Database,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../services/api';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getAdminStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-burgundy border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const kpis = [
    {
      label: 'Total Enquiries',
      value: stats?.totalEnquiries ?? 0,
      sub: `${stats?.pendingEnquiries ?? 0} Pending Attention`,
      icon: Inbox,
      color: 'bg-amber-500/10 text-amber-700 border-amber-200',
      link: '/admin/enquiries',
    },
    {
      label: 'Quotation Requests',
      value: stats?.totalQuotations ?? 0,
      sub: `${stats?.pendingQuotations ?? 0} Awaiting Review`,
      icon: FileSpreadsheet,
      color: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
      link: '/admin/quotations',
    },
    {
      label: 'Active Services',
      value: stats?.totalServices ?? 0,
      sub: `${stats?.publishedServices ?? 0} Published on Website`,
      icon: Briefcase,
      color: 'bg-blue-500/10 text-blue-700 border-blue-200',
      link: '/admin/services',
    },
    {
      label: 'Portfolio Projects',
      value: stats?.publishedPortfolio ?? 0,
      sub: 'Editorial Cases Live',
      icon: ImageIcon,
      color: 'bg-purple-500/10 text-purple-700 border-purple-200',
      link: '/admin/portfolio',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Banner with System Status */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-charcoal/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs uppercase font-bold text-charcoal-muted tracking-wider">
              System Operational
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-burgundy uppercase tracking-tight">
            Studio Operations Overview
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            Manage incoming event leads, print jobs, catalog specifications, and visual content.
          </p>
        </div>

        {/* Quick Shortcut Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/services"
            className="inline-flex items-center gap-1.5 bg-burgundy text-cream hover:bg-burgundy-light text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-electric" />
            <span>Add Service</span>
          </Link>
          <Link
            to="/admin/portfolio"
            className="inline-flex items-center gap-1.5 bg-burgundy text-cream hover:bg-burgundy-light text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-electric" />
            <span>Add Portfolio</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={idx}
              to={kpi.link}
              className="bg-white rounded-2xl p-6 border border-charcoal/10 shadow-sm hover:shadow-md hover:border-burgundy/40 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-charcoal-muted">
                  {kpi.label}
                </span>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${kpi.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="font-display text-4xl text-burgundy mb-1 group-hover:text-burgundy-light transition-colors">
                {kpi.value}
              </div>
              <div className="text-xs text-charcoal-muted flex items-center justify-between">
                <span>{kpi.sub}</span>
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-burgundy" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Submissions Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Quotation Requests */}
        <div className="bg-white rounded-2xl p-6 border border-charcoal/10 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-charcoal/10">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-burgundy" />
                <h3 className="font-display text-xl text-burgundy uppercase tracking-tight">
                  Recent Quotation Requests
                </h3>
              </div>
              <Link
                to="/admin/quotations"
                className="text-xs font-bold text-burgundy hover:text-burgundy-light uppercase tracking-wider flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {(stats?.recentQuotations || []).length === 0 ? (
              <p className="text-xs text-charcoal-muted py-6 text-center">
                No quotation requests recorded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {(stats?.recentQuotations || []).map((quot: any) => (
                  <div
                    key={quot.id}
                    className="p-3.5 rounded-xl bg-gray-50 border border-charcoal/5 flex items-center justify-between hover:bg-gray-100/70 transition-colors"
                  >
                    <div>
                      <span className="font-bold text-xs text-burgundy block">
                        {quot.full_name}
                      </span>
                      <span className="text-[11px] text-charcoal-muted">
                        {quot.event_type} &bull; {quot.event_location}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${
                        quot.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : quot.status === 'quoted'
                          ? 'bg-blue-100 text-blue-800'
                          : quot.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-200 text-charcoal'
                      }`}
                    >
                      {quot.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Contact Enquiries */}
        <div className="bg-white rounded-2xl p-6 border border-charcoal/10 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-charcoal/10">
              <div className="flex items-center gap-2">
                <Inbox className="w-5 h-5 text-burgundy" />
                <h3 className="font-display text-xl text-burgundy uppercase tracking-tight">
                  Recent General Enquiries
                </h3>
              </div>
              <Link
                to="/admin/enquiries"
                className="text-xs font-bold text-burgundy hover:text-burgundy-light uppercase tracking-wider flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {(stats?.recentEnquiries || []).length === 0 ? (
              <p className="text-xs text-charcoal-muted py-6 text-center">
                No enquiries recorded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {(stats?.recentEnquiries || []).map((enq: any) => (
                  <div
                    key={enq.id}
                    className="p-3.5 rounded-xl bg-gray-50 border border-charcoal/5 flex items-center justify-between hover:bg-gray-100/70 transition-colors"
                  >
                    <div>
                      <span className="font-bold text-xs text-burgundy block">
                        {enq.full_name}
                      </span>
                      <span className="text-[11px] text-charcoal-muted truncate max-w-xs block">
                        {enq.interested_service} &bull; {enq.email}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${
                        enq.status === 'new'
                          ? 'bg-emerald-100 text-emerald-800'
                          : enq.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-200 text-charcoal'
                      }`}
                    >
                      {enq.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
