import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency } from '../utils/formatCurrency';
import logo from '../assets/tradefox-logo.svg';
import ProfileModal from './ProfileModal';
import OrderHistoryModal from './OrderHistoryModal';
import PortfolioModal from './PortfolioModal';
import FundModal from './FundModal';

const nav = [
  { label: 'Dashboard', path: '/dashboard', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg> },
  { label: 'Trade',     path: '/trade',     icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg> },
  { label: 'Portfolio', path: '/portfolio', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg> },
];

const UserPopup = ({ user, onClose, onLogout, triggerRef, onOpenModal }) => {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => {
      if (triggerRef?.current?.contains(e.target)) return;
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose, triggerRef]);

  const joinDate = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div ref={ref} className="fixed bottom-0 left-0 w-56 mb-[73px] z-50 animate-fadeInUp px-2 pb-1">
      <div className="bg-white border border-ink-200 rounded-2xl overflow-hidden card-shadow-lg">
        {/* Header */}
        <div className="px-4 py-4 border-b border-ink-100 bg-gradient-to-br from-brand-50 to-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-brand-500 text-white flex items-center justify-center text-base font-black uppercase shrink-0">
              {user.name?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-ink-900 truncate">{user.name}</p>
              <p className="text-xs text-ink-400 truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white border border-brand-200 rounded-xl px-3 py-2">
            <span className="text-sm">🦊</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-brand-600 leading-tight">TradeFox Member</p>
              <p className="text-xs text-ink-400">Since {joinDate}</p>
            </div>
            <span className="text-xs bg-brand-500 text-white px-2 py-0.5 rounded-full font-bold shrink-0">FREE</span>
          </div>
        </div>

        {/* Balance */}
        <div className="px-4 py-3 border-b border-ink-100 bg-ink-50 flex justify-between items-center">
          <div>
            <p className="text-xs text-ink-400 mb-0.5">Virtual Balance</p>
            <p className="text-base font-black text-up tabular-nums">{formatCurrency(user.balance)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-ink-400 mb-0.5">Account</p>
            <p className="text-xs font-bold text-ink-700">Paper Trading</p>
          </div>
        </div>

        {/* Menu */}
        <div className="py-1">
          {[
            { icon: '👤', label: 'Profile',       sub: 'Account details',   modal: 'profile' },
            { icon: '📊', label: 'My Portfolio',  sub: 'Holdings & P&L',    modal: 'portfolio' },
            { icon: '📋', label: 'Order History', sub: 'All past trades',   modal: 'orders' },
            { icon: '💳', label: 'Add / Withdraw', sub: 'Manage virtual funds', modal: 'funds' },
            { icon: '⭐', label: 'Upgrade Plan',  sub: 'Coming soon',       disabled: true },
          ].map(({ icon, label, sub, modal, disabled }) => (
            <button key={label} disabled={disabled}
              onClick={() => { if (modal) { onClose(); onOpenModal(modal); } }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-ink-50'}`}>
              <span className="text-sm w-5 text-center shrink-0">{icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink-800">{label}</p>
                <p className="text-xs text-ink-400">{sub}</p>
              </div>
              {disabled && <span className="text-xs text-ink-400 bg-ink-100 px-1.5 py-0.5 rounded-md shrink-0">Soon</span>}
            </button>
          ))}
        </div>

        {/* Sign out */}
        <div className="px-3 py-2.5 border-t border-ink-100">
          <button onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Log out
          </button>
        </div>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [popupOpen, setPopupOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'profile' | 'portfolio' | 'orders'
  const triggerRef = useRef(null);

  return (
    <>
      <aside className="w-56 h-screen bg-white border-r border-ink-200 flex flex-col sticky top-0 shrink-0 card-shadow">
        <div className="px-5 py-4 border-b border-ink-100 shrink-0">
          <img src={logo} alt="TradeFox" className="h-8" />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {nav.map(({ label, path, icon }) => (
            <NavLink key={path} to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'}`
              }>
              {icon}{label}
            </NavLink>
          ))}

          {/* Help / Tour */}
          <button
            onClick={() => { localStorage.removeItem(`tf_tour_done_${user?.id || 'guest'}`); navigate('/dashboard'); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink-600 hover:bg-ink-100 hover:text-ink-900 transition-all mt-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 16v-4m0-4h.01"/>
            </svg>
            Help / Tour
          </button>
        </nav>

        {user && (
          <div className="relative shrink-0 border-t border-ink-100">
            {popupOpen && (
              <UserPopup
                user={user}
                onClose={() => setPopupOpen(false)}
                onLogout={() => { logout(); navigate('/'); }}
                triggerRef={triggerRef}
                onOpenModal={(m) => setActiveModal(m)}
              />
            )}
            <button ref={triggerRef} onClick={() => setPopupOpen(v => !v)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 transition-colors text-left ${popupOpen ? 'bg-ink-50' : 'hover:bg-ink-50'}`}>
              <div className="h-8 w-8 rounded-lg bg-brand-500 text-white flex items-center justify-center text-sm font-black uppercase shrink-0">
                {user.name?.[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-900 truncate leading-tight">{user.name}</p>
                <p className="text-xs text-up font-semibold tabular-nums leading-tight">{formatCurrency(user.balance)}</p>
              </div>
              <svg className={`w-3.5 h-3.5 text-ink-400 shrink-0 transition-transform duration-200 ${popupOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
          </div>
        )}
      </aside>

      {/* Modals */}
      {activeModal === 'profile'   && <ProfileModal        onClose={() => setActiveModal(null)} />}
      {activeModal === 'portfolio' && <PortfolioModal      onClose={() => setActiveModal(null)} />}
      {activeModal === 'orders'    && <OrderHistoryModal   onClose={() => setActiveModal(null)} />}
      {activeModal === 'funds'     && <FundModal isOpen onClose={() => setActiveModal(null)} currentBalance={user?.balance || 0} />}
    </>
  );
};

export default Sidebar;
