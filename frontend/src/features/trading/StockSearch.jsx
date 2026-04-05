import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { stockService } from '../../services/stockService';
import { formatCurrency } from '../../utils/formatCurrency';
import Badge from '../../components/Badge';

const StockSearch = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const { data: results = [], isFetching } = useQuery({
    queryKey: ['stock-search', query],
    queryFn: () => stockService.search(query),
    enabled: query.length >= 1,
    staleTime: 10_000,
  });

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input type="text" value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => query && setOpen(true)}
          placeholder="Search stocks — RELIANCE, TCS, INFY..."
          className="w-full bg-white border border-ink-200 rounded-xl pl-11 pr-4 py-3 text-sm text-ink-800 placeholder-ink-400
            focus:outline-none focus:ring-2 focus:ring-brand-400/25 focus:border-brand-400 transition-all card-shadow" />
        {isFetching && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-ink-400 animate-pulse">...</span>}
      </div>
      {open && results.length > 0 && (
        <ul className="absolute z-50 top-full mt-1.5 w-full bg-white border border-ink-200 rounded-2xl overflow-hidden max-h-72 overflow-y-auto animate-fadeInUp card-shadow-lg">
          {results.map((s) => {
            const up = s.change >= 0;
            return (
              <li key={s.id} onClick={() => { setQuery(s.symbol); setOpen(false); onSelect?.(s); }}
                className="flex items-center justify-between px-4 py-3 hover:bg-ink-50 cursor-pointer transition-colors border-b border-ink-100 last:border-0">
                <div>
                  <p className="text-sm font-bold text-ink-800">{s.symbol}</p>
                  <p className="text-xs text-ink-400">{s.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-ink-700 tabular-nums">{formatCurrency(s.currentPrice)}</p>
                  <Badge variant={up ? 'success' : 'danger'}>{up ? '+' : ''}{s.changePercent?.toFixed(2)}%</Badge>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default StockSearch;
