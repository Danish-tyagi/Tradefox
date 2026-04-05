import { useEffect, useState, useRef } from 'react';
import logo from '../assets/tradefox-logo.svg';
import { stockService } from '../services/stockService';
import AuthModal from '../components/AuthModal';
import useReveal from '../hooks/useReveal';
import useCountUp from '../hooks/useCountUp';

/* ── Animated sparkline ── */
const Sparkline = ({ up, animated = false }) => {
  const color = up ? '#059669' : '#dc2626';
  const path = up ? 'M0 22 L12 17 L24 19 L36 10 L48 13 L60 4 L72 8' : 'M0 8 L12 13 L24 11 L36 19 L48 16 L60 23 L72 20';
  return (
    <svg viewBox="0 0 72 28" fill="none" className="w-full h-10">
      <defs>
        <linearGradient id={`sg-${up}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L72 28 L0 28 Z`} fill={`url(#sg-${up})`} />
      <path d={path} stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"
        style={animated ? { strokeDasharray: 200, strokeDashoffset: 200, animation: 'drawLine 1.5s ease-out forwards' } : {}} />
    </svg>
  );
};

/* ── Ticker bar ── */
const TickerBar = ({ stocks, onOpen }) => {
  const items = [...stocks, ...stocks];
  return (
    <div className="bg-ink-900 py-2.5 overflow-hidden cursor-pointer" onClick={() => onOpen('signup')}>
      <div className="flex gap-10 whitespace-nowrap" style={{ animation: 'tickerScroll 40s linear infinite' }}>
        {items.map((s, i) => {
          const up = s.change >= 0;
          return (
            <span key={i} className="inline-flex items-center gap-2 text-xs shrink-0">
              <span className="font-bold text-white">{s.symbol}</span>
              <span className="text-ink-300 tabular-nums">₹{s.currentPrice?.toLocaleString('en-IN')}</span>
              <span className={`font-semibold tabular-nums ${up ? 'text-emerald-400' : 'text-red-400'}`}>
                {up ? '▲' : '▼'} {Math.abs(s.changePercent ?? 0).toFixed(2)}%
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

/* ── Animated stat counter ── */
const AnimatedStat = ({ value, suffix = '', label, start }) => {
  const count = useCountUp(value, 1600, start);
  return (
    <div className="text-center">
      <p className="text-4xl font-black text-brand-500 tabular-nums">{count.toLocaleString('en-IN')}{suffix}</p>
      <p className="text-sm text-ink-500 mt-1">{label}</p>
    </div>
  );
};

/* ── Live price row with pulse animation ── */
const LiveRow = ({ stock, delay = 0, onOpen }) => {
  const [pulse, setPulse] = useState(false);
  const up = stock.change >= 0;
  useEffect(() => {
    const t = setTimeout(() => setPulse(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div onClick={() => onOpen('signup')}
      className="flex items-center justify-between px-4 py-3 hover:bg-ink-50 transition-colors cursor-pointer border-b border-ink-100 last:border-0"
      style={{ animation: `fadeInUp 0.4s ease-out ${delay}ms both` }}>
      <div>
        <p className="text-sm font-bold text-ink-800">{stock.symbol}</p>
        <p className="text-xs text-ink-400 truncate max-w-[100px]">{stock.name}</p>
      </div>
      <div className="text-right">
        <p className={`text-sm font-bold tabular-nums transition-colors ${pulse ? (up ? 'text-up' : 'text-down') : 'text-ink-700'}`}>
          ₹{stock.currentPrice?.toLocaleString('en-IN')}
        </p>
        <span className={`text-xs font-semibold tabular-nums ${up ? 'text-up' : 'text-down'}`}>
          {up ? '▲' : '▼'} {Math.abs(stock.changePercent ?? 0).toFixed(2)}%
        </span>
      </div>
    </div>
  );
};

/* ── Stock card with hover lift ── */
const StockCard = ({ stock, onOpen, delay = 0 }) => {
  const up = stock.change >= 0;
  return (
    <div onClick={() => onOpen('signup')} style={{ animationDelay: `${delay}ms` }}
      className="reveal-scale bg-white border border-ink-200 rounded-2xl p-4 cursor-pointer card-shadow
        hover:-translate-y-1 hover:card-shadow-md hover:border-brand-200 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-bold text-ink-900 text-sm">{stock.symbol}</p>
          <p className="text-xs text-ink-400 truncate max-w-[90px]">{stock.name}</p>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${up ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
          {up ? '+' : ''}{stock.changePercent?.toFixed(2)}%
        </span>
      </div>
      <p className="text-lg font-black text-ink-900 tabular-nums mb-2">₹{stock.currentPrice?.toLocaleString('en-IN')}</p>
      <Sparkline up={up} animated />
    </div>
  );
};

/* ── Feature card ── */
const FeatureCard = ({ icon, title, desc, delay = 0 }) => (
  <div style={{ transitionDelay: `${delay}ms` }}
    className="reveal bg-white border border-ink-200 rounded-2xl p-6 card-shadow
      hover:-translate-y-1 hover:border-brand-200 hover:card-shadow-md transition-all duration-300">
    <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-2xl mb-4">{icon}</div>
    <h3 className="font-bold text-ink-900 mb-2">{title}</h3>
    <p className="text-sm text-ink-500 leading-relaxed">{desc}</p>
  </div>
);

/* ── Step ── */
const Step = ({ num, title, desc, delay = 0 }) => (
  <div style={{ transitionDelay: `${delay}ms` }} className="reveal flex gap-4">
    <div className="w-9 h-9 rounded-full bg-brand-500 text-white text-sm font-black flex items-center justify-center shrink-0 mt-0.5 shadow-sm">{num}</div>
    <div>
      <p className="font-bold text-ink-900 mb-1">{title}</p>
      <p className="text-sm text-ink-500">{desc}</p>
    </div>
  </div>
);

/* ── First Buy Guide Step ── */
const BuyStep = ({ num, icon, title, desc, tip, delay = 0 }) => (
  <div style={{ animation: `fadeInUp 0.4s ease-out ${delay}ms both` }}
    className="relative bg-white border border-ink-200 rounded-2xl p-6 card-shadow hover:-translate-y-1 hover:border-brand-200 hover:card-shadow-md transition-all duration-300">
    <div className="flex items-start gap-4">
      <div className="relative shrink-0">
        <div className="w-12 h-12 rounded-xl bg-brand-500 text-white flex items-center justify-center text-xl shadow-sm">{icon}</div>
        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-ink-900 text-white text-xs font-black flex items-center justify-center">{num}</div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-ink-900 mb-1">{title}</p>
        <p className="text-sm text-ink-500 leading-relaxed mb-3">{desc}</p>
        {tip && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            <span className="text-amber-500 text-xs mt-0.5 shrink-0">💡</span>
            <p className="text-xs text-amber-700 leading-relaxed">{tip}</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

const FIRST_BUY_STEPS = [
  {
    icon: '📝',
    title: 'Account banao — bilkul free',
    desc: 'Sirf naam, email aur password chahiye. Koi KYC nahi, koi documents nahi. 30 seconds mein ready.',
    tip: 'Apna real email use karo — password reset ke kaam aayega.',
  },
  {
    icon: '💰',
    title: '₹1,00,000 virtual balance milega',
    desc: 'Account bante hi tumhare wallet mein ₹1 lakh virtual paisa aa jaata hai. Isse practice karo bina koi real risk ke.',
    tip: 'Yeh paisa real nahi hai — toh daro mat, freely experiment karo!',
  },
  {
    icon: '🔍',
    title: 'Stock dhundo',
    desc: 'Trade page pe jaao aur search bar mein company ka naam ya symbol type karo — jaise "Reliance" ya "TCS". Real NSE/BSE prices dikhenge.',
    tip: 'Pehli baar ke liye bade aur stable companies choose karo jaise HDFC, Infosys, ya Reliance.',
  },
  {
    icon: '📋',
    title: 'Order type samjho',
    desc: 'Market Order: jo bhi current price hai uspe turant khareedta hai. Limit Order: tum apni price set karo, jab market us price pe aaye tab buy hoga.',
    tip: 'Beginner ho? Market Order se shuru karo — simple aur instant hai.',
  },
  {
    icon: '🛒',
    title: 'Pehla order place karo',
    desc: 'Quantity daalo, order type select karo aur "Buy" dabao. Bas! Tumhara pehla virtual trade complete.',
    tip: 'Chhoti quantity se shuru karo — 1 ya 2 shares. Samajhne ke baad badha sakte ho.',
  },
  {
    icon: '📊',
    title: 'Portfolio track karo',
    desc: 'Dashboard pe jaao — wahan tumhara P&L, holdings, aur returns sab dikhega. Dekho tumhara investment kaise perform kar raha hai.',
    tip: 'Roz thoda time do portfolio dekhne mein — isse market ki samajh tezi se aati hai.',
  },
];

/* ── First Buy Guide Section ── */
const FirstBuyGuide = ({ onOpen }) => {
  const [activeTab, setActiveTab] = useState('steps');
  return (
    <section id="first-buy" className="bg-gradient-to-b from-white to-ink-50 border-y border-ink-200">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-4" style={{ animation: 'fadeInUp 0.5s ease-out both' }}>
          <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-full px-4 py-1.5 text-xs text-brand-600 font-semibold mb-4">
            <span>🎯</span> Beginners ke liye
          </div>
          <h2 className="text-3xl font-black text-ink-900 mb-3">Pehli baar stock khareedna hai?</h2>
          <p className="text-ink-500 max-w-xl mx-auto">Ghabrao mat — yeh guide tumhein step-by-step batayegi ki TradeFox pe apna pehla virtual trade kaise place karein.</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-10" style={{ animation: 'fadeInUp 0.5s ease-out 0.1s both' }}>
          <div className="inline-flex bg-ink-100 rounded-xl p-1 gap-1">
            {[{ id: 'steps', label: '📋 Step-by-Step Guide' }, { id: 'tips', label: '💡 Pro Tips' }].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-white text-ink-900 card-shadow' : 'text-ink-500 hover:text-ink-700'}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'steps' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {FIRST_BUY_STEPS.map((step, i) => (
              <BuyStep key={i} num={i + 1} {...step} delay={i * 60} />
            ))}
          </div>
        )}

        {activeTab === 'tips' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 max-w-4xl mx-auto">
            {[
              { icon: '📉', title: 'Ghabrao mat jab price girta hai', desc: 'Market mein ups and downs normal hain. Virtual trading mein yeh experience lo ki price girne pe panic sell karna sahi nahi hota.' },
              { icon: '🎯', title: 'Ek sector se shuru karo', desc: 'Pehle IT ya Banking sector ke 2-3 stocks choose karo. Ek saath bahut saare stocks track karna confusing ho sakta hai.' },
              { icon: '⏰', title: 'Market hours yaad rakho', desc: 'NSE/BSE Monday-Friday 9:15 AM se 3:30 PM tak open rehta hai. Iske baad orders queue mein jaate hain.' },
              { icon: '📚', title: 'P&L samjho', desc: 'P&L matlab Profit & Loss. Agar tumne ₹100 mein kharida aur price ₹110 ho gayi — tumhara unrealized profit ₹10 hai.' },
              { icon: '🔄', title: 'Limit order try karo', desc: 'Market order ke baad limit order try karo. Ek price set karo jis pe tum khareedna chahte ho — yeh real trading mein bahut kaam aata hai.' },
              { icon: '💼', title: 'Diversify karo', desc: 'Saara paisa ek stock mein mat lagao. 4-5 alag companies mein invest karo — isse risk kam hota hai.' },
            ].map(({ icon, title, desc }, i) => (
              <div key={i} style={{ animation: `fadeInUp 0.4s ease-out ${i * 60}ms both` }}
                className="bg-white border border-ink-200 rounded-2xl p-5 card-shadow hover:border-brand-200 transition-all">
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">{icon}</span>
                  <div>
                    <p className="font-bold text-ink-900 mb-1 text-sm">{title}</p>
                    <p className="text-sm text-ink-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center" style={{ animation: 'fadeInUp 0.5s ease-out 0.4s both' }}>
          <p className="text-ink-500 text-sm mb-4">Sab samajh aa gaya? Ab practice karo — bilkul free!</p>
          <button onClick={() => onOpen('signup')}
            className="px-8 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
            Abhi shuru karo — Free hai 🚀
          </button>
        </div>
      </div>
    </section>
  );
};

/* ── Marquee testimonials (Groww style) ── */
const TESTIMONIALS = [
  { name: 'Rahul Sharma',    role: 'Software Engineer',         text: 'TradeFox made learning stock trading so easy. The real-time prices make it feel like actual trading without any risk.' },
  { name: 'Priya Mehta',     role: 'MBA Student',               text: 'I practiced for 3 months on TradeFox before investing real money. Best decision ever. My portfolio is up 22%.' },
  { name: 'Arjun Nair',      role: 'CA Student',                text: 'The order matching is instant and the portfolio analytics are exactly what I needed to understand P&L.' },
  { name: 'Sneha Patel',     role: 'Marketing Manager',         text: 'Finally a platform that explains everything clearly. I went from zero knowledge to confident trader in weeks.' },
  { name: 'Vikram Singh',    role: 'Entrepreneur',              text: 'The watchlist feature is brilliant. I track my favourite stocks and practice trading them every day.' },
  { name: 'Ananya Gupta',    role: 'Finance Graduate',          text: 'Real NSE/BSE data with virtual money — this is exactly what every beginner needs before going live.' },
  { name: 'Rohan Kapoor',    role: 'IT Professional',           text: 'Clean UI, fast execution, real market data. TradeFox is the best paper trading platform I have used.' },
  { name: 'Divya Reddy',     role: 'Teacher',                   text: 'I recommend TradeFox to all my students. It is the safest way to learn investing without losing money.' },
  { name: 'Karan Malhotra',  role: 'Product Manager at Infosys', text: 'The P&L chart and holdings breakdown helped me understand exactly where I was going wrong in my strategy.' },
  { name: 'Meera Joshi',     role: 'Homemaker',                 text: 'Started with zero knowledge. Now I understand stocks, orders, and portfolio management. Thank you TradeFox!' },
  { name: 'Aditya Kumar',    role: 'College Student',           text: 'Free platform with real data — I cannot believe this is free. Every student should use this before investing.' },
  { name: 'Pooja Iyer',      role: 'Data Analyst',              text: 'The interface is so intuitive. I placed my first virtual trade in under 2 minutes. Absolutely love it.' },
];

const TestimonialCard = ({ name, role, text }) => (
  <div className="shrink-0 w-72 bg-white border border-ink-200 rounded-2xl p-5 card-shadow mx-3 select-none">
    <p className="text-sm text-ink-600 leading-relaxed mb-4 line-clamp-4">&ldquo;{text}&rdquo;</p>
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-brand-500 text-white flex items-center justify-center text-sm font-black shrink-0">
        {name[0]}
      </div>
      <div>
        <p className="text-sm font-bold text-ink-900">{name}</p>
        <p className="text-xs text-ink-400">{role}</p>
      </div>
    </div>
  </div>
);

const MarqueeRow = ({ items, reverse = false, speed = 40 }) => {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden py-2">
      <div className="flex"
        style={{ animation: `${reverse ? 'marqueeRight' : 'marqueeLeft'} ${speed}s linear infinite` }}>
        {doubled.map((t, i) => <TestimonialCard key={i} {...t} />)}
      </div>
    </div>
  );
};

const MarqueeSection = () => {
  const half = Math.ceil(TESTIMONIALS.length / 2);
  const row1 = TESTIMONIALS.slice(0, half);
  const row2 = TESTIMONIALS.slice(half);
  return (
    <section className="py-16 bg-ink-50 border-y border-ink-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-10 text-center reveal">
        <h2 className="text-3xl font-black text-ink-900 mb-3">Loved by traders across India</h2>
        <p className="text-ink-500">Join thousands who are already practising smarter</p>
      </div>
      {/* Fade edges */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #f8fafc, transparent)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #f8fafc, transparent)' }} />
        <MarqueeRow items={row1} reverse={false} speed={45} />
        <MarqueeRow items={row2} reverse={true}  speed={38} />
      </div>
    </section>
  );
};

/* ── Main ── */
const LandingPage = () => {
  const [stocks, setStocks] = useState([]);
  const [modal, setModal] = useState(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [activeNav, setActiveNav] = useState(null);
  const statsRef = useRef(null);

  useEffect(() => { stockService.getPublic().then(setStocks).catch(() => {}); }, []);

  /* Intersection Observer for scroll reveals */
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [stocks]);

  /* Stats counter trigger */
  useEffect(() => {
    if (!statsRef.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStatsVisible(true); obs.disconnect(); } }, { threshold: 0.3 });
    obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const gainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  const losers  = [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);
  const featured = stocks.slice(0, 8);

  return (
    <div className="min-h-screen bg-ink-50 text-ink-800">
      {/* overflow-x clip wrapper — does NOT wrap navbar so sticky works */}
      
      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-ink-200 card-shadow">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <img src={logo} alt="TradeFox" className="h-8" style={{ animation: 'fadeInUp 0.4s ease-out' }} />
          <div className="hidden md:flex items-center gap-8 text-sm text-ink-500" style={{ animation: 'fadeInUp 0.4s ease-out 0.1s both' }}>
            {[
              { id: 'markets',   label: 'Markets',      href: '#markets' },
              { id: 'features',  label: 'Features',     href: '#features' },
              { id: 'first-buy', label: 'Pehli Baar?',  href: '#first-buy' },
              { id: 'how',       label: 'How it works', href: '#how' },
            ].map(({ id, label, href }) => (
              <a key={id} href={href} onClick={() => setActiveNav(id)}
                className={`transition-colors font-medium ${activeNav === id ? 'text-brand-500' : 'hover:text-ink-900'}`}>
                {label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3" style={{ animation: 'fadeInUp 0.4s ease-out 0.2s both' }}>
            <button onClick={() => setModal('login')}
              className="text-sm font-semibold text-ink-600 hover:text-ink-900 px-4 py-2 rounded-xl hover:bg-ink-100 transition-all">Login</button>
            <button onClick={() => setModal('signup')}
              className="text-sm font-bold bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
              Sign up free
            </button>
          </div>
        </div>
      </nav>

      {/* ── TICKER ── */}
      <div className="overflow-x-hidden">
      {stocks.length > 0 && <TickerBar stocks={stocks} onOpen={setModal} />}

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-ink-50/50 to-white">
        {/* Decorative blobs */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-brand-100 rounded-full blur-3xl opacity-40 pointer-events-none" style={{ animation: 'floatUp 6s ease-in-out infinite' }} />
        <div className="absolute bottom-10 left-10 w-56 h-56 bg-emerald-100 rounded-full blur-3xl opacity-30 pointer-events-none" style={{ animation: 'floatUp 8s ease-in-out infinite 2s' }} />

        <div className="relative max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-full px-4 py-1.5 text-xs text-brand-600 font-semibold mb-6"
              style={{ animation: 'fadeInUp 0.5s ease-out 0.1s both' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
              100% Free · Real Market Data · Zero Risk
            </div>
            <h1 className="text-5xl font-black text-ink-900 leading-tight mb-5"
              style={{ animation: 'slideInLeft 0.6s ease-out 0.2s both' }}>
              India's stock market<br />
              <span className="text-brand-500">at your fingertips</span>
            </h1>
            <p className="text-lg text-ink-500 mb-8 leading-relaxed"
              style={{ animation: 'fadeInUp 0.6s ease-out 0.35s both' }}>
              Practice trading with ₹1,00,000 virtual balance.<br />Real NSE/BSE prices, real order matching — zero risk.
            </p>
            <div className="flex flex-wrap gap-3" style={{ animation: 'fadeInUp 0.6s ease-out 0.45s both' }}>
              <button onClick={() => setModal('signup')}
                className="px-7 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-base transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                Start Trading Free →
              </button>
              <button onClick={() => setModal('login')}
                className="px-7 py-3.5 bg-white hover:bg-ink-50 text-ink-700 font-semibold rounded-xl text-base border border-ink-200 shadow-sm transition-all hover:-translate-y-0.5">
                Sign In
              </button>
            </div>
          </div>

          {/* Right — floating live market card */}
          <div className="relative" style={{ animation: 'slideInRight 0.7s ease-out 0.3s both' }}>
            <div className="bg-white border border-ink-200 rounded-2xl card-shadow-md overflow-hidden"
              style={{ animation: 'floatUp 4s ease-in-out infinite 1s' }}>
              <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between">
                <span className="font-bold text-ink-800 text-sm">Live Market</span>
                <span className="flex items-center gap-1.5 text-xs text-up font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-up animate-pulse" /> Live
                </span>
              </div>
              {stocks.length > 0
                ? gainers.slice(0, 4).map((s, i) => <LiveRow key={s.id} stock={s} delay={i * 120} onOpen={setModal} />)
                : [...Array(4)].map((_, i) => <div key={i} className="h-14 skeleton mx-4 my-2 rounded-xl" />)
              }
              <div className="px-5 py-3 bg-ink-50 border-t border-ink-100">
                <button onClick={() => setModal('signup')} className="text-xs text-brand-500 font-semibold hover:text-brand-600">
                  View all stocks after signup →
                </button>
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 bg-white border border-ink-200 rounded-2xl px-4 py-3 card-shadow-md text-center"
              style={{ animation: 'floatUp 5s ease-in-out infinite 0.5s' }}>
              <p className="text-2xl font-black text-brand-500">₹1L</p>
              <p className="text-xs text-ink-400 font-medium">Virtual Balance</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ANIMATED STATS ── */}
      <section ref={statsRef} className="bg-ink-900 py-14">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <AnimatedStat value={100000} suffix="" label="Virtual Balance (₹)" start={statsVisible} />
          <AnimatedStat value={stocks.length || 20} suffix="+" label="Stocks Available" start={statsVisible} />
          <AnimatedStat value={10000} suffix="+" label="Active Traders" start={statsVisible} />
          <AnimatedStat value={100} suffix="%" label="Free Forever" start={statsVisible} />
        </div>
      </section>

      {/* ── MARKETS ── */}
      {stocks.length > 0 && (
        <section id="markets" className="max-w-7xl mx-auto px-6 py-16">
          <div className="reveal flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-ink-900">Market Overview</h2>
              <p className="text-ink-400 text-sm mt-1">Live prices from NSE/BSE</p>
            </div>
            <span className="flex items-center gap-2 text-xs text-up font-semibold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-up animate-pulse" /> Live
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            {[{ title: 'Top Gainers', data: gainers, up: true }, { title: 'Top Losers', data: losers, up: false }].map(({ title, data, up }, si) => (
              <div key={title} style={{ transitionDelay: `${si * 100}ms` }}
                className="reveal bg-white border border-ink-200 rounded-2xl overflow-hidden card-shadow">
                <div className="px-5 py-3 border-b border-ink-100 flex items-center gap-2">
                  <span className={`text-sm font-bold ${up ? 'text-up' : 'text-down'}`}>{up ? '▲' : '▼'}</span>
                  <span className="text-sm font-semibold text-ink-800">{title}</span>
                </div>
                {data.map((s, i) => <LiveRow key={s.id} stock={s} delay={i * 80} onOpen={setModal} />)}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featured.map((s, i) => <StockCard key={s.id} stock={s} onOpen={setModal} delay={i * 60} />)}
          </div>
        </section>
      )}

      {/* ── FEATURES ── */}
      <section id="features" className="bg-ink-50 border-y border-ink-200">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="reveal text-center mb-12">
            <h2 className="text-3xl font-black text-ink-900 mb-3">Everything you need to trade</h2>
            <p className="text-ink-500">Professional tools, zero cost</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <FeatureCard icon="📈" title="Real-time Prices"       desc="Live NSE/BSE stock prices with WebSocket updates. See prices move as they happen." delay={0} />
            <FeatureCard icon="⚡" title="Instant Order Matching"  desc="Market and limit orders with real order matching engine. FILLED in milliseconds." delay={80} />
            <FeatureCard icon="📊" title="Portfolio Analytics"    desc="Track P&L, holdings, avg cost, returns. Full portfolio breakdown with charts." delay={160} />
            <FeatureCard icon="👁️" title="Watchlist"              desc="Add stocks to your watchlist. Monitor your favourite picks from the dashboard." delay={240} />
            <FeatureCard icon="📋" title="Order History"          desc="Complete history of all your trades — BUY, SELL, MARKET, LIMIT orders." delay={320} />
            <FeatureCard icon="🔒" title="Safe & Free"            desc="No real money, no credit card. Just sign up and start practising immediately." delay={400} />
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS MARQUEE ── */}
      <MarqueeSection />

      {/* ── HOW IT WORKS ── */}      <section id="how" className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="reveal">
              <h2 className="text-3xl font-black text-ink-900 mb-3">How it works</h2>
              <p className="text-ink-400 mb-10">Get started in under 60 seconds</p>
            </div>
            <div className="space-y-8">
              <Step num="1" title="Create a free account"         desc="Sign up with your name, email and password. No KYC, no documents needed." delay={0} />
              <Step num="2" title="Get ₹1,00,000 virtual balance" desc="Your account is instantly credited with ₹1,00,000 to start trading." delay={100} />
              <Step num="3" title="Search & trade stocks"         desc="Search any NSE/BSE stock, place market or limit orders in real time." delay={200} />
              <Step num="4" title="Track your performance"        desc="Monitor your portfolio P&L, holdings and order history on the dashboard." delay={300} />
            </div>
            <div className="reveal mt-10">
              <button onClick={() => setModal('signup')}
                className="px-7 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
                Get started free →
              </button>
            </div>
          </div>

          {/* Mock dashboard — animated */}
          <div className="reveal-right bg-white border border-ink-200 rounded-2xl p-6 space-y-4 card-shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-ink-800">Your Dashboard</span>
              <span className="text-xs text-up bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-up animate-pulse" /> Live
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Portfolio Value', value: '₹1,18,420', color: 'text-ink-900' },
                { label: 'Total P&L',       value: '+₹18,420',  color: 'text-up' },
                { label: 'Invested',        value: '₹1,00,000', color: 'text-ink-900' },
                { label: 'Returns',         value: '+18.42%',   color: 'text-up' },
              ].map(({ label, value, color }, i) => (
                <div key={label} className="bg-ink-50 border border-ink-200 rounded-xl p-3"
                  style={{ animation: 'fadeInUp 0.4s ease-out both', animationDelay: `${i * 80}ms` }}>
                  <p className="text-xs text-ink-400 mb-1">{label}</p>
                  <p className={`text-sm font-bold tabular-nums ${color}`}>{value}</p>
                </div>
              ))}
            </div>
            <div className="bg-ink-50 border border-ink-200 rounded-xl overflow-hidden">
              <div className="px-4 py-2 border-b border-ink-200 text-xs font-semibold text-ink-500">Holdings</div>
              {[
                { sym: 'RELIANCE', qty: 5,  pnl: '+₹2,340', up: true },
                { sym: 'TCS',      qty: 2,  pnl: '+₹1,820', up: true },
                { sym: 'INFY',     qty: 10, pnl: '-₹540',   up: false },
              ].map(({ sym, qty, pnl, up }, i) => (
                <div key={sym} className="flex items-center justify-between px-4 py-2.5 border-b border-ink-200 last:border-0"
                  style={{ animation: 'fadeInUp 0.4s ease-out both', animationDelay: `${i * 100 + 200}ms` }}>
                  <div>
                    <p className="text-xs font-bold text-ink-800">{sym}</p>
                    <p className="text-xs text-ink-400">{qty} shares</p>
                  </div>
                  <span className={`text-xs font-bold tabular-nums ${up ? 'text-up' : 'text-down'}`}>{pnl}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FIRST BUY GUIDE ── */}
      <FirstBuyGuide onOpen={setModal} />

      {/* ── CTA ── */}
      <section className="bg-ink-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #FF6B00 0%, transparent 50%), radial-gradient(circle at 80% 50%, #059669 0%, transparent 50%)' }} />
        <div className="relative max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="text-4xl font-black text-white mb-4 reveal">Ready to start trading?</h2>
          <p className="text-ink-400 mb-8 text-lg reveal">Join thousands of traders practising on TradeFox. Free forever.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 reveal">
            <button onClick={() => setModal('signup')}
              className="px-10 py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-base transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
              Create Free Account
            </button>
            <button onClick={() => setModal('login')}
              className="px-10 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-base border border-white/20 transition-all hover:-translate-y-0.5">
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-ink-200">

        {/* Main links grid */}
        <div className="max-w-7xl mx-auto px-6 pt-14 pb-10 grid grid-cols-2 md:grid-cols-5 gap-8">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <img src={logo} alt="TradeFox" className="h-8 mb-4" />
            <p className="text-sm text-ink-500 leading-relaxed mb-5">
              India's smartest virtual paper trading platform. Practice with real NSE/BSE data.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3">
              {[
                { label: 'Twitter/X', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
                { label: 'LinkedIn', path: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z' },
                { label: 'Instagram', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
              ].map(({ label, path }) => (
                <button key={label} aria-label={label}
                  className="w-8 h-8 rounded-lg bg-ink-100 hover:bg-brand-50 hover:text-brand-500 text-ink-500 flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d={path} /></svg>
                </button>
              ))}
            </div>
          </div>

          {/* Products */}
          <div>
            <p className="text-xs font-bold text-ink-800 uppercase tracking-widest mb-4">Products</p>
            <ul className="space-y-2.5">
              {['Stocks', 'Portfolio', 'Watchlist', 'Order History', 'Paper Trading'].map(item => (
                <li key={item}>
                  <button onClick={() => setModal('signup')}
                    className="text-sm text-ink-500 hover:text-brand-500 transition-colors">{item}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-bold text-ink-800 uppercase tracking-widest mb-4">Company</p>
            <ul className="space-y-2.5">
              {['About Us', 'Blog', 'Careers', 'Press', 'Contact Us'].map(item => (
                <li key={item}>
                  <span className="text-sm text-ink-500 cursor-default">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Learn */}
          <div>
            <p className="text-xs font-bold text-ink-800 uppercase tracking-widest mb-4">Learn</p>
            <ul className="space-y-2.5">
              {['What is Paper Trading?', 'How to Buy Stocks', 'Understanding P&L', 'Market Orders vs Limit', 'Portfolio Management'].map(item => (
                <li key={item}>
                  <span className="text-sm text-ink-500 cursor-default">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Get the app */}
          <div>
            <p className="text-xs font-bold text-ink-800 uppercase tracking-widest mb-4">Get Started</p>
            <p className="text-sm text-ink-500 mb-4">Start with ₹1,00,000 virtual balance. Free forever.</p>
            <button onClick={() => setModal('signup')}
              className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold rounded-xl transition-all shadow-sm mb-2">
              Create Free Account
            </button>
            <button onClick={() => setModal('login')}
              className="w-full py-2.5 bg-white hover:bg-ink-50 text-ink-700 text-sm font-semibold rounded-xl border border-ink-200 transition-all">
              Sign In
            </button>
          </div>
        </div>

        {/* Disclaimer — Groww style */}
        <div className="border-t border-ink-100">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <p className="text-xs text-ink-400 leading-relaxed">
              <span className="font-semibold text-ink-500">Disclaimer:</span> TradeFox is a virtual paper trading platform for educational purposes only.
              All stocks, prices and market data shown are simulated. No real money is involved.
              This platform does not provide investment advice. Past performance of virtual trades does not guarantee future results.
              Please consult a SEBI-registered financial advisor before making real investment decisions.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-ink-100 bg-ink-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-xs text-ink-400">
              <span>© {new Date().getFullYear()} TradeFox. All rights reserved.</span>
              <span className="hidden md:inline text-ink-200">|</span>
              <span className="hidden md:inline">Built with ❤️ in India</span>
            </div>

            {/* Founder pill */}
            <div className="flex items-center gap-2 bg-white border border-ink-200 rounded-full px-3 py-1.5 card-shadow">
              <div className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-black shrink-0">D</div>
              <span className="text-xs text-ink-400">Founded by</span>
              <span className="text-xs font-bold text-ink-800">Danish Tyagi</span>
            </div>

            <div className="flex items-center gap-4 text-xs text-ink-400">
              <span className="hover:text-ink-700 transition-colors cursor-pointer">Privacy Policy</span>
              <span className="text-ink-200">|</span>
              <span className="hover:text-ink-700 transition-colors cursor-pointer">Terms of Use</span>
              <span className="text-ink-200">|</span>
              <span className="hover:text-ink-700 transition-colors cursor-pointer">Sitemap</span>
            </div>
          </div>
        </div>
      </footer>

      {modal && <AuthModal mode={modal} onClose={() => setModal(null)} />}
      </div> {/* end overflow-x-hidden */}
    </div>
  );
};

export default LandingPage;
