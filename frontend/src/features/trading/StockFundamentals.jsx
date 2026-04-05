import { useMemo, useState } from 'react';
import { formatCurrency } from '../../utils/formatCurrency';

/* ── Tooltip component ── */
const Tooltip = ({ text }) => {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex items-center ml-1">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        className="w-3.5 h-3.5 rounded-full bg-ink-200 text-ink-500 text-[9px] font-bold flex items-center justify-center hover:bg-brand-200 hover:text-brand-700 transition-colors leading-none"
        aria-label="More info"
      >?</button>
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-48 bg-ink-900 text-white text-[10px] leading-relaxed rounded-lg px-2.5 py-2 z-50 shadow-lg pointer-events-none">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-ink-900" />
        </span>
      )}
    </span>
  );
};

/**
 * Simulated stock fundamentals — PE, EPS, 52w high/low, market cap, volume
 * In a real app these would come from a market data API.
 * Here we derive plausible values from the stock's price & sector.
 */
const SECTOR_PE = {
  'IT':             28,
  'Banking':        14,
  'Finance':        22,
  'Energy':         12,
  'Auto':           18,
  'FMCG':           55,
  'Pharma':         30,
  'Metals':         10,
  'Conglomerate':   20,
  'Infrastructure': 25,
  'Cement':         22,
  'Paints':         60,
  'Consumer':       70,
  'Consumer Tech':  80,
  'Fintech':        90,
  'Retail':         65,
};

const SECTOR_MCAP = {
  'IT':             'Large Cap',
  'Banking':        'Large Cap',
  'Finance':        'Large Cap',
  'Energy':         'Large Cap',
  'Auto':           'Large Cap',
  'FMCG':           'Large Cap',
  'Pharma':         'Mid Cap',
  'Metals':         'Mid Cap',
  'Conglomerate':   'Large Cap',
  'Infrastructure': 'Large Cap',
  'Cement':         'Large Cap',
  'Paints':         'Large Cap',
  'Consumer':       'Large Cap',
  'Consumer Tech':  'Mid Cap',
  'Fintech':        'Mid Cap',
  'Retail':         'Mid Cap',
};

const StockFundamentals = ({ stock, livePrice }) => {
  const price = livePrice ?? stock?.currentPrice;

  const fundamentals = useMemo(() => {
    if (!stock || !price) return null;
    const pe = SECTOR_PE[stock.sector] || 25;
    const eps = parseFloat((price / pe).toFixed(2));
    const high52w = parseFloat((price * (1 + 0.18 + Math.random() * 0.12)).toFixed(2));
    const low52w  = parseFloat((price * (0.72 + Math.random() * 0.10)).toFixed(2));
    const avgVol  = Math.floor((Math.random() * 2_000_000) + 500_000);
    const mcapVal = parseFloat((price * (Math.random() * 500_000_000 + 100_000_000)).toFixed(0));
    const mcapStr = mcapVal >= 1e12
      ? `₹${(mcapVal / 1e12).toFixed(2)}L Cr`
      : `₹${(mcapVal / 1e9).toFixed(2)}K Cr`;

    return { pe, eps, high52w, low52w, avgVol, mcapStr, capType: SECTOR_MCAP[stock.sector] || 'Mid Cap' };
  }, [stock?.id]); // only recalc when stock changes, not on every price tick

  if (!fundamentals) return null;

  const rows = [
    { label: 'P/E Ratio',  value: fundamentals.pe.toFixed(1), tip: 'Price-to-Earnings ratio — stock kitna mehenga hai earnings ke hisaab se. Kam P/E = sasta, zyada P/E = mehenga (growth stocks mein zyada hota hai).' },
    { label: 'EPS',        value: formatCurrency(fundamentals.eps), tip: 'Earnings Per Share — company ne ek share ke peeche kitna profit kamaya. Zyada EPS = better.' },
    { label: '52W High',   value: formatCurrency(fundamentals.high52w), color: 'text-emerald-600', tip: 'Pichle 52 hafte (1 saal) mein stock ka sabse zyada price. Agar current price is ke paas hai toh stock strong hai.' },
    { label: '52W Low',    value: formatCurrency(fundamentals.low52w),  color: 'text-red-500', tip: 'Pichle 52 hafte mein stock ka sabse kam price. Agar current price is ke paas hai toh stock weak zone mein hai.' },
    { label: 'Avg Volume', value: fundamentals.avgVol.toLocaleString('en-IN'), tip: 'Average daily trading volume — kitne shares roz trade hote hain. Zyada volume = zyada liquidity = asaani se buy/sell kar sakte ho.' },
    { label: 'Market Cap', value: fundamentals.mcapStr, tip: 'Company ki total value (price × total shares). Large cap = badi stable company, Small cap = chhoti high-risk/high-reward company.' },
    { label: 'Cap Type',   value: fundamentals.capType, tip: 'Large Cap (>20K Cr) = stable blue-chip. Mid Cap (5K-20K Cr) = growth potential. Small Cap (<5K Cr) = high risk, high reward.' },
    { label: 'Sector',     value: stock.sector || '—', tip: 'Company kis industry mein hai. Ek hi sector ke stocks usually saath move karte hain.' },
  ];

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-ink-400 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 leading-relaxed">
        💡 Har metric ke <span className="font-bold text-blue-600">?</span> button pe hover karo explanation ke liye
      </p>
      <div className="grid grid-cols-2 gap-2">
        {rows.map(({ label, value, color, tip }) => (
          <div key={label} className="bg-ink-50 border border-ink-200 rounded-xl px-3 py-2">
            <p className="text-[10px] text-ink-400 mb-0.5 flex items-center">
              {label}
              {tip && <Tooltip text={tip} />}
            </p>
            <p className={`text-xs font-bold tabular-nums ${color || 'text-ink-800'}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockFundamentals;
