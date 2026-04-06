import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const tourKey = (userId) => `tf_tour_done_${userId || 'guest'}`;

const steps = [
  {
    emoji: '🦊',
    title: 'Welcome to TradeFox!',
    desc: 'Yeh ek paper trading platform hai — real money ka koi risk nahi. Tum virtual balance se real market conditions mein trading seekh sakte ho.',
    highlight: null,
  },
  {
    emoji: '💰',
    title: 'Virtual Balance',
    desc: 'Tumhare account mein virtual money hai. Isse stocks kharido aur becho — bilkul real trading jaisa, but zero risk. Balance khatam ho toh "Add Funds" se reset kar sakte ho.',
    highlight: null,
  },
  {
    emoji: '📊',
    title: 'Dashboard',
    desc: 'Yahan tumhara portfolio summary, live market ticker, top gainers/losers aur recent orders dikhte hain. Roz yahan se start karo.',
    highlight: null,
  },
  {
    emoji: '📈',
    title: 'Trade Page',
    desc: 'Koi bhi stock select karo, candle chart dekho, aur order place karo. Market Order = current price pe turant execute. Limit Order = apni price set karo.',
    highlight: null,
  },
  {
    emoji: '🔔',
    title: 'Price Alerts',
    desc: 'Trade page pe "🔔" tab mein price alerts set kar sakte ho. Jab stock tumhari target price pe aaye, alert milega.',
    highlight: null,
  },
  {
    emoji: '🚀',
    title: 'Sab ready hai!',
    desc: 'Apna pehla trade place karo. Galti karo, seekho, aur improve karo — yahi toh paper trading ka fayda hai!',
    highlight: null,
    cta: 'Start Trading',
  },
];

const WelcomeTour = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    if (!localStorage.getItem(tourKey(user.id))) {
      const t = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, [user]);

  const dismiss = () => {
    localStorage.setItem(tourKey(user?.id), '1');
    setOpen(false);
  };

  const finish = () => {
    dismiss();
    navigate('/trade');
  };

  if (!open) return null;

  const current = steps[step];
  const isLast = step === steps.length - 1;
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={dismiss} />

      {/* Card */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '28rem' }} className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-[fadeInScale_0.25s_ease-out]">

        {/* Progress bar */}
        <div className="h-1 bg-ink-100">
          <div
            className="h-full bg-brand-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-ink-300 hover:text-ink-500 transition-colors text-xl leading-none z-10"
        >
          ×
        </button>

        {/* Content */}
        <div className="px-8 py-8 text-center">
          <div className="text-5xl mb-4">{current.emoji}</div>
          <h2 className="text-xl font-extrabold text-ink-900 mb-3">{current.title}</h2>
          <p className="text-sm text-ink-500 leading-relaxed">{current.desc}</p>
        </div>

        {/* Footer */}
        <div className="px-8 pb-7 flex items-center justify-between gap-3">
          {/* Step dots */}
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`rounded-full transition-all ${
                  i === step
                    ? 'w-5 h-2 bg-brand-500'
                    : 'w-2 h-2 bg-ink-200 hover:bg-ink-300'
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="px-4 py-2 text-sm font-semibold text-ink-600 hover:bg-ink-50 rounded-xl transition-colors border border-ink-200"
              >
                Back
              </button>
            )}
            {isLast ? (
              <button
                onClick={finish}
                className="px-5 py-2 text-sm font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-colors shadow-sm"
              >
                {current.cta || 'Start Trading'}
              </button>
            ) : (
              <button
                onClick={() => setStep(s => s + 1)}
                className="px-5 py-2 text-sm font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-colors shadow-sm"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeTour;
