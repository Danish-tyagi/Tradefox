import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import Button from '../components/Button';
import logo from '../assets/tradefox-logo.svg';

const inp = `w-full bg-white border border-ink-200 rounded-xl px-3 py-2.5 text-sm text-ink-800 placeholder-ink-400
  focus:outline-none focus:ring-2 focus:ring-brand-400/25 focus:border-brand-400 transition-all`;

const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50">
        <div className="text-center space-y-3">
          <p className="text-ink-600">Invalid or missing reset token.</p>
          <button onClick={() => navigate('/')} className="text-brand-500 font-semibold text-sm hover:text-brand-600">
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await authService.resetPassword(token, form.password);
      setDone(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-50 p-4">
      <div className="w-full max-w-md bg-white border border-ink-200 rounded-2xl card-shadow-lg p-8">
        <img src={logo} alt="TradeFox" className="h-8 mb-6" />

        {done ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-ink-800 font-semibold">Password reset successful</p>
            <p className="text-sm text-ink-400">You can now sign in with your new password.</p>
            <Button className="w-full" onClick={() => navigate('/')}>Go to Sign In</Button>
          </div>
        ) : (
          <>
            <p className="text-2xl font-black text-ink-900 mb-1">Set new password</p>
            <p className="text-sm text-ink-400 mb-7">Choose a strong password for your account.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-600 mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={show ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    required placeholder="••••••••" className={`${inp} pr-10`}
                  />
                  <button type="button" onClick={() => setShow((v) => !v)}
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
              <div>
                <label className="block text-xs font-semibold text-ink-600 mb-1.5">Confirm Password</label>
                <input
                  type={show ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))}
                  required placeholder="••••••••" className={inp}
                />
              </div>
              {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
