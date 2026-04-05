import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/Button';
import { useToast } from '../../components/Toast';

const inp = `w-full bg-white border border-ink-200 rounded-xl px-3 py-2.5 text-sm text-ink-800 placeholder-ink-400
  focus:outline-none focus:ring-2 focus:ring-brand-400/25 focus:border-brand-400 transition-all`;

// Generates a strong random password: uppercase + lowercase + digits + symbols
const generatePassword = () => {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const symbols = '!@#$%^&*';
  const all = upper + lower + digits + symbols;
  // Guarantee at least one of each type
  const pick = (str) => str[Math.floor(Math.random() * str.length)];
  const base = [pick(upper), pick(lower), pick(digits), pick(symbols)];
  for (let i = 0; i < 8; i++) base.push(pick(all));
  // Shuffle
  return base.sort(() => Math.random() - 0.5).join('');
};

const SignupForm = ({ onSwitch, onSuccess }) => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const pwd = generatePassword();
    setForm(p => ({ ...p, password: pwd }));
    setShow(false);
    setCopied(false);
  };

  const handleCopy = () => {
    if (!form.password) return;
    navigator.clipboard.writeText(form.password).then(() => {
      setCopied(true);
      toast.success('Password copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (form.password.length < 6) {
      const msg = 'Password must be at least 6 characters.';
      setError(msg); toast.warning(msg, 'Weak password'); return;
    }
    setLoading(true);
    try {
      await signup(form);
      toast.success('Account created! ₹1,00,000 balance added.', 'Welcome to TradeFox!');
      onSuccess?.(); navigate('/dashboard');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Signup failed. Try again.';
      setError(msg); toast.error(msg, 'Signup failed');
    } finally { setLoading(false); }
  };

  const set = (k) => (e) => setForm(p => ({...p, [k]: e.target.value}));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-ink-600 mb-1.5">Full Name</label>
        <input type="text" value={form.name} onChange={set('name')} required placeholder="Rahul Sharma" className={inp} />
      </div>
      <div>
        <label className="block text-xs font-semibold text-ink-600 mb-1.5">Email</label>
        <input type="email" value={form.email} onChange={set('email')} required placeholder="you@example.com" className={inp} />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-ink-600">Password</label>
          <button
            type="button"
            onClick={handleGenerate}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            {/* Refresh / generate icon */}
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Generate
          </button>
        </div>
        <div className="relative">
          <input
            type={show ? 'text' : 'password'}
            value={form.password}
            onChange={set('password')}
            required
            placeholder="Min 6 characters"
            className={`${inp} pr-16`}
          />
          {/* Eye toggle */}
          <button type="button" onClick={() => setShow(v => !v)}
            className="absolute right-8 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {show
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
              }
            </svg>
          </button>
          {/* Copy button */}
          <button type="button" onClick={handleCopy}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 transition-colors"
            title="Copy password">
            {copied
              ? /* checkmark */
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              : /* copy icon */
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect x="9" y="9" width="13" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
            }
          </button>
        </div>
      </div>
      {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating account...' : 'Create Account'}</Button>
      {onSwitch && (
        <p className="text-center text-xs text-ink-400">
          Already have an account?{' '}
          <button type="button" onClick={onSwitch} className="text-brand-500 font-semibold hover:text-brand-600">Sign in</button>
        </p>
      )}
    </form>
  );
};

export default SignupForm;
