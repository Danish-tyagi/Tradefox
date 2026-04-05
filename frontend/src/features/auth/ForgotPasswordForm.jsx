import { useState } from 'react';
import { authService } from '../../services/authService';
import Button from '../../components/Button';

const inp = `w-full bg-white border border-ink-200 rounded-xl px-3 py-2.5 text-sm text-ink-800 placeholder-ink-400
  focus:outline-none focus:ring-2 focus:ring-brand-400/25 focus:border-brand-400 transition-all`;

const ForgotPasswordForm = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm text-ink-600">
          If <span className="font-semibold text-ink-800">{email}</span> is registered, you'll receive a reset link shortly.
        </p>
        <p className="text-xs text-ink-400">Check your spam folder if you don't see it.</p>
        <button type="button" onClick={onBack} className="text-xs text-brand-500 font-semibold hover:text-brand-600">
          Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-ink-600 mb-1.5">Email address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          className={inp}
        />
      </div>
      {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Sending...' : 'Send Reset Link'}
      </Button>
      <p className="text-center text-xs text-ink-400">
        <button type="button" onClick={onBack} className="text-brand-500 font-semibold hover:text-brand-600">
          Back to Sign In
        </button>
      </p>
    </form>
  );
};

export default ForgotPasswordForm;
