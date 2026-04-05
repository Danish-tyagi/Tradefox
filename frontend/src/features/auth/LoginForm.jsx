import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/Button';
import { useToast } from '../../components/Toast';

const inp = `w-full bg-white border border-ink-200 rounded-xl px-3 py-2.5 text-sm text-ink-800 placeholder-ink-400
  focus:outline-none focus:ring-2 focus:ring-brand-400/25 focus:border-brand-400 transition-all`;

const LoginForm = ({ onSwitch, onForgot, onSuccess }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back! Redirecting to dashboard.', 'Login successful');
      onSuccess?.();
      navigate('/dashboard');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Login failed. Try again.';
      setError(msg);
      toast.error(msg, 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-ink-600 mb-1.5">Email</label>
        <input type="email" name="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))}
          required placeholder="you@example.com" className={inp} />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-ink-600">Password</label>
          {onForgot && (
            <button type="button" onClick={onForgot} className="text-xs text-brand-500 hover:text-brand-600 font-medium">
              Forgot password?
            </button>
          )}
        </div>
        <div className="relative">
          <input type={show ? 'text' : 'password'} name="password" value={form.password}
            onChange={e => setForm(p => ({...p, password: e.target.value}))}
            required placeholder="••••••••" className={`${inp} pr-10`} />
          <button type="button" onClick={() => setShow(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {show
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
              }
            </svg>
          </button>
        </div>
      </div>
      {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Button>
      {onSwitch && (
        <p className="text-center text-xs text-ink-400">
          Don&apos;t have an account?{' '}
          <button type="button" onClick={onSwitch} className="text-brand-500 font-semibold hover:text-brand-600">Sign up free</button>
        </p>
      )}
    </form>
  );
};

export default LoginForm;
