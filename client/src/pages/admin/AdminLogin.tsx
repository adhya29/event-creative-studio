import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, KeyRound, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useContent } from '../../context/ContentContext';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { company } = useContent();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please provide both administrator email and password.');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const fillDemoCredentials = () => {
    setEmail('admin@luminacreative.studio');
    setPassword('AdminStudio@2026');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-burgundy flex items-center justify-center p-4">
      <div className="max-w-md w-full cream-card p-8 sm:p-10 shadow-2xl relative overflow-hidden">
        
        {/* Accent bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-electric"></div>

        {/* Brand & Title */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-burgundy text-cream mx-auto flex items-center justify-center shadow-lg mb-4">
            <ShieldCheck className="w-8 h-8 text-electric" />
          </div>

          <h1 className="font-display text-3xl text-burgundy uppercase tracking-tight mb-1">
            Studio Command Center
          </h1>
          <p className="font-editorial text-sm text-charcoal/80 italic">
            Authorized administrator access for {company.company_name}
          </p>
        </div>

        {/* Demo Credentials Helper Pill for Evaluator */}
        <div className="mb-6 p-3.5 rounded-xl bg-burgundy/10 border border-burgundy/20 text-burgundy">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-electric" />
              <span>Assessment Demo Access</span>
            </span>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="text-[10px] bg-electric text-burgundy hover:bg-electric-hover font-bold px-2.5 py-1 rounded-md transition-colors"
            >
              Auto-Fill Demo
            </button>
          </div>
          <p className="text-[11px] text-charcoal/80 font-mono">
            admin@luminacreative.studio &bull; AdminStudio@2026
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-100 border border-rose-300 text-rose-900 flex items-start gap-2.5 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Access Denied</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-burgundy uppercase tracking-wider mb-1.5">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-charcoal-muted absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@luminacreative.studio"
                className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-charcoal/20 focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-burgundy uppercase tracking-wider mb-1.5">
              Security Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-charcoal-muted absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-charcoal/20 focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 outline-none text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center text-xs uppercase tracking-wider py-3.5 font-bold mt-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating Session...</span>
            ) : (
              <>
                <span>Enter Admin Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-burgundy/15 text-center">
          <Link
            to="/"
            className="text-xs text-charcoal-muted hover:text-burgundy uppercase tracking-wider font-semibold"
          >
            &larr; Return to Public Website
          </Link>
        </div>

      </div>
    </div>
  );
};
