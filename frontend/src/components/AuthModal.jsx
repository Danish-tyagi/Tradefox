import { useEffect, useState } from 'react';
import LoginForm from '../features/auth/LoginForm';
import SignupForm from '../features/auth/SignupForm';
import ForgotPasswordForm from '../features/auth/ForgotPasswordForm';
import logo from '../assets/tradefox-logo.svg';

const AuthModal = ({ mode = 'login', onClose }) => {
  const [tab, setTab] = useState(mode);
  useEffect(() => setTab(mode), [mode]);

  useEffect(() => { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = ''; }; }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-xl bg-white border border-ink-200 rounded-2xl card-shadow-lg animate-fadeInUp">

        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-6 pb-4 border-b border-ink-100">
          <img src={logo} alt="TradeFox" className="h-8" />
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-all text-xl leading-none">
            ×
          </button>
        </div>

        {/* Tabs — only show for login/signup */}
        {tab !== 'forgot' && (
          <div className="grid grid-cols-2 border-b border-ink-100">
            {[['login', 'Sign In'], ['signup', 'Create Account']].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)}
                className={`py-3.5 text-sm font-semibold transition-all text-center
                  ${tab === key
                    ? 'text-brand-500 border-b-2 border-brand-500 -mb-px'
                    : 'text-ink-400 hover:text-ink-700'}`}>
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Form */}
        <div className="px-8 py-7">
          {tab === 'login' && (
            <>
              <p className="text-2xl font-black text-ink-900 mb-1">Welcome back</p>
              <p className="text-sm text-ink-400 mb-7">Sign in to your TradeFox account</p>
              <LoginForm onSwitch={() => setTab('signup')} onForgot={() => setTab('forgot')} onSuccess={onClose} />
            </>
          )}
          {tab === 'signup' && (
            <>
              <p className="text-2xl font-black text-ink-900 mb-1">Create account</p>
              <p className="text-sm text-ink-400 mb-7">Get ₹1,00,000 virtual balance instantly</p>
              <SignupForm onSwitch={() => setTab('login')} onSuccess={onClose} />
            </>
          )}
          {tab === 'forgot' && (
            <>
              <p className="text-2xl font-black text-ink-900 mb-1">Forgot password?</p>
              <p className="text-sm text-ink-400 mb-7">Enter your email and we'll send a reset link.</p>
              <ForgotPasswordForm onBack={() => setTab('login')} />
            </>
          )}
        </div>

        <p className="text-center text-xs text-ink-300 pb-6">Virtual trading only — no real money involved</p>
      </div>
    </div>
  );
};

export default AuthModal;
