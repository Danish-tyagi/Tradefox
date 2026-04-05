import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { portfolioService } from '../services/portfolioService';
import { formatCurrency } from '../utils/formatCurrency';
import { calculatePnL, totalPnL } from '../utils/calculatePnL';
import Badge from './Badge';

const PortfolioModal = ({ onClose }) => {
  const navigate = useNavigate();
  const { data: holdings = [], isLoading } = useQuery({
    queryKey: ['portfolio'],
    queryFn: portfolioService.getHoldings,
  });
  const { data: summary } = useQuery({
    queryKey: ['portfolio-summary'],
    queryFn: portfolioService.getSummary,
  });

  const calculated = calculatePnL(holdings);
  const totals = totalPnL(holdings);
  const isProfit = totals.pnl >= 0;
  const sign = isProfit ? '+' : '';

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-3xl bg-white border border-ink-200 rounded-2xl card-shadow-lg animate-fadeInUp flex flex-col"
        style={{ maxHeight: 'calc(100vh - 2rem)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-ink-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-ink-900">My Portfolio</h2>
            <p className="text-sm text-ink-400 mt-0.5">{calculated.length} holdings</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { onClose(); navigate('/portfolio'); }}
              className="text-xs text-brand-500 hover:text-brand-600 font-semibold px-3 py-1.5 border border-brand-200 rounded-lg hover:bg-brand-50 transition-all">
              Full View →
            </button>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-all text-xl">×</button>
          </div>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-4 border-b border-ink-100 shrink-0">
          {[
            { label: 'Invested', value: formatCurrency(totals.totalInvested) },
            { label: 'Current',  value: formatCurrency(totals.totalValue) },
            { label: 'P&L',      value: `${sign}${formatCurrency(totals.pnl)}`, color: isProfit ? 'text-up' : 'text-down' },
            { label: 'Balance',  value: formatCurrency(summary?.balance || 0), color: 'text-brand-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="py-4 text-center border-r border-ink-100 last:border-0">
              <p className={`text-base font-black tabular-nums ${color || 'text-ink-900'}`}>{value}</p>
              <p className="text-xs text-ink-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Holdings table */}
        <div className="flex-1 overflow-y-auto overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-12 skeleton rounded-xl" />)}</div>
          ) : calculated.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-sm text-ink-400 mb-3">No holdings yet.</p>
              <button onClick={() => { onClose(); navigate('/trade'); }}
                className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-colors">
                Start Trading
              </button>
            </div>
          ) : (
            <table className="w-full min-w-[560px]">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b border-ink-100">
                  {['Stock', 'Qty', 'Avg Cost', 'LTP', 'P&L', 'Return'].map(h => (
                    <th key={h} className="text-left py-3 px-6 text-xs font-semibold text-ink-400 uppercase tracking-wide whitespace-nowrap bg-white">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {calculated.map((h) => {
                  const profit = h.pnl >= 0;
                  return (
                    <tr key={h.id}
                      onClick={() => { onClose(); navigate(`/trade?symbol=${h.stock.symbol}`); }}
                      className="border-b border-ink-100 last:border-0 hover:bg-ink-50 transition-colors cursor-pointer">
                      <td className="py-4 px-6">
                        <p className="font-bold text-ink-900">{h.stock.symbol}</p>
                        <p className="text-xs text-ink-400 mt-0.5">{h.stock.name}</p>
                      </td>
                      <td className="py-4 px-6 text-ink-700 tabular-nums font-medium">{h.quantity}</td>
                      <td className="py-4 px-6 text-ink-600 tabular-nums whitespace-nowrap">{formatCurrency(h.avgBuyPrice)}</td>
                      <td className="py-4 px-6 font-semibold text-ink-800 tabular-nums whitespace-nowrap">{formatCurrency(h.stock.currentPrice)}</td>
                      <td className="py-4 px-6">
                        <p className={`font-bold tabular-nums whitespace-nowrap ${profit ? 'text-up' : 'text-down'}`}>
                          {profit ? '+' : ''}{formatCurrency(h.pnl)}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant={profit ? 'success' : 'danger'}>
                          {profit ? '+' : ''}{h.pnlPercent.toFixed(2)}%
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioModal;
