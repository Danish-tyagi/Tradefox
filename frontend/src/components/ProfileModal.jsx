import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency } from '../utils/formatCurrency';

const ProfileModal = ({ onClose }) => {
  const { user } = useAuth();

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);

  const joinDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-lg bg-white border border-ink-200 rounded-2xl card-shadow-lg animate-fadeInUp overflow-y-auto"
        style={{ maxHeight: 'calc(100vh - 2rem)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
          <h2 className="text-base font-bold text-ink-900">My Profile</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-all text-xl">×</button>
        </div>

        {/* Avatar + name */}
        <div className="px-6 py-6 flex items-center gap-4 border-b border-ink-100 bg-gradient-to-br from-brand-50 to-white">
          <div className="w-16 h-16 rounded-2xl bg-brand-500 text-white flex items-center justify-center text-2xl font-black uppercase shadow-sm">
            {user?.name?.[0]}
          </div>
          <div>
            <p className="text-xl font-black text-ink-900">{user?.name}</p>
            <p className="text-sm text-ink-400">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs bg-brand-500 text-white px-2.5 py-0.5 rounded-full font-bold">FREE</span>
              <span className="text-xs text-ink-400">Member since {joinDate}</span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="px-6 py-4 space-y-3">
          {[
            { label: 'Full Name',     value: user?.name },
            { label: 'Email',         value: user?.email },
            { label: 'Account Type',  value: 'Paper Trading' },
            { label: 'Virtual Balance', value: formatCurrency(user?.balance || 0), color: 'text-up font-bold' },
            { label: 'Member Since',  value: joinDate },
            { label: 'Plan',          value: 'TradeFox Free', color: 'text-brand-600 font-semibold' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center justify-between py-2.5 border-b border-ink-100 last:border-0">
              <span className="text-xs text-ink-400 font-medium">{label}</span>
              <span className={`text-sm tabular-nums ${color || 'text-ink-800 font-medium'}`}>{value}</span>
            </div>
          ))}
        </div>

        {/* Membership card */}
        <div className="px-6 pb-6">
          <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🦊</span>
                <div>
                  <p className="text-sm font-bold">TradeFox Member</p>
                  <p className="text-xs text-white/70">Free Plan</p>
                </div>
              </div>
              <span className="text-xs bg-white/20 border border-white/30 px-2.5 py-1 rounded-full font-bold">FREE</span>
            </div>
            <p className="text-xs text-white/70 mt-2">
              Practice trading with ₹1,00,000 virtual balance. Real NSE/BSE prices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
