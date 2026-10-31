import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Image,
  Inbox,
  FileSpreadsheet,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  Database,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useContent } from '../../context/ContentContext';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { company } = useContent();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Services', path: '/admin/services', icon: Briefcase },
    { name: 'Portfolio', path: '/admin/portfolio', icon: Image },
    { name: 'Enquiries', path: '/admin/enquiries', icon: Inbox },
    { name: 'Quotations', path: '/admin/quotations', icon: FileSpreadsheet },
    { name: 'Website Content', path: '/admin/content', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#F4F4F6] text-charcoal flex flex-col md:flex-row">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-burgundy text-cream px-4 py-3 flex items-center justify-between shadow-md">
        <Link to="/admin" className="flex items-center gap-2">
          <span className="font-display text-xl text-cream tracking-tight">
            {company.company_name}
          </span>
          <span className="bg-electric text-burgundy text-[10px] font-bold px-2 py-0.5 rounded uppercase">
            Admin
          </span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-cream p-1.5 focus:outline-none"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Admin Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-burgundy text-cream flex flex-col justify-between p-5 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="pb-6 mb-6 border-b border-burgundy-light/40">
            <Link to="/admin" className="block">
              <span className="font-display text-2xl text-cream tracking-tight block">
                {company.company_name}
              </span>
              <span className="text-[11px] font-medium text-electric uppercase tracking-widest flex items-center gap-1.5 mt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Command Center</span>
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                    active
                      ? 'bg-electric text-burgundy font-bold shadow-md'
                      : 'text-cream/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer User & Actions */}
        <div className="pt-6 border-t border-burgundy-light/40 space-y-3">
          <div className="bg-burgundy-dark/60 p-3 rounded-xl border border-burgundy-light/30">
            <span className="text-[10px] uppercase font-bold text-cream/50 tracking-wider block">
              Signed In As
            </span>
            <span className="text-xs font-semibold text-cream truncate block">
              {user?.email || 'admin@luminacreative.studio'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              target="_blank"
              className="flex-1 flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 text-cream text-[11px] font-medium py-2 px-3 rounded-lg transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Site</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 bg-rose-600/20 hover:bg-rose-600 text-cream text-[11px] font-medium py-2 px-3 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
};
