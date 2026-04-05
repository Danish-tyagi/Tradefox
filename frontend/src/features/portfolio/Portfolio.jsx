import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { portfolioService } from '../../services/portfolioService';
import { stockService } from '../../services/stockService';
import { formatCurrency } from '../../utils/formatCurrency';
import { totalPnL, calculatePnL } from '../../utils/calculatePnL';
import Holdings from './Holdings';
import PnLChart from './PnLChart';
import Card, { CardHeader } from '../../components/Card';
import Badge from '../../components/Badge';
import useWebSocket from '../../hooks/useWebSocket';

/* ── Summary stat card ── */
const StatCard = ({ label, value, sub, color, icon, bg }) => (
  <div className={`rounded-2xl border p-5 flex items-start gap-4 ${bg || 'bg-white border-ink-200 card-shadow'}`}>
    {icon && (
      <div className="w-10 h-10 rounded-xl bg-ink-50 border border-ink-200 flex items-center justify-center shrink-0 text-lg">{icon}</div>
    )}
    <div>
      <p className="text-xs text-ink-400 font-medium mb-1">{label}</p>
      <p className={`text-xl font-bold tabular-nums ${color || 'text-ink-900'}`}>{value}</p>
      {sub && <p className={`text-xs mt-0.5 tabular-nums font-semibold ${color || 'text-ink-400'}`}>{sub}</p>}
    </div>
  </div>
);

/* ── Market movers sidebar ── */
const MarketMovers = ({ stocks }) => {
  const navigate = useNavigate();
  const gainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  const losers  = [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);

  return (
    <div className="space-y-4">
      {[{ title: 'Top Gainers', data: gainers, up: true }, { title: 'Top Losers', data: losers, up: false }].map(({ title, data, up }) => (
        <Card key={title} padding={false}>
          <div className="px-4 pt-4 pb-2 border-b border-ink-100 flex items-center gap-2">
            <span className={`text-xs font-bold ${up ? 'text-up' : 'text-down'}`}>{up ? '▲' : '▼'}</span>
            <span className="text-sm font-semibold text-ink-800">{title}</span>
          </div>
          <ul className="divide-y divide-ink-100">
            {data.map((s) => {
              const isUp = s.change >= 0;
              return (
                <li key={s.id} onClick={() => navigate(`/trade?symbol=${s.symbol}`)}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-ink-50 transition-colors cursor-pointer">
                  <div>
                    <p className="text-xs font-bold text-ink-800">{s.symbol}</p>
                    <p className="text-xs text-ink-400 truncate max-w-[80px]">{s.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-ink-700 tabular-nums">₹{s.currentPrice?.toLocaleString('en-IN')}</p>
                    <p className={`text-xs font-bold tabular-nums ${isUp ? 'text-up' : 'text-down'}`}>
                      {isUp ? '+' : ''}{s.changePercent?.toFixed(2)}%
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      ))}

      {/* Quick trade CTA */}
      <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl p-5 text-white">
        <p className="font-bold text-base mb-1">Ready to trade?</p>
        <p className="text-sm text-white/80 mb-4">Place orders on live NSE/BSE stocks</p>
        <button onClick={() => navigate('/trade')}
          className="w-full py-2.5 bg-white text-brand-600 text-sm font-bold rounded-xl hover:bg-brand-50 transition-colors">
          Go to Trade →
        </button>
      </div>
    </div>
  );
};

/* ── Holdings allocation bar ── */
const AllocationBar = ({ holdings }) => {
  const calc = calculatePnL(holdings);
  if (!calc.length) return null;
  const total = calc.reduce((s, h) => s + h.currentValue, 0);
  const colors = ['#FF6B00', '#059669', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#84cc16'];

  return (
    <Card>
      <CardHeader title="Portfolio Allocation" subtitle="By current value" />
      {/* Bar */}
      <div className="flex rounded-full overflow-hidden h-3 mb-4">
        {calc.map((h, i) => (
          <div key={h.id} title={h.stock.symbol}
            style={{ width: `${(h.currentValue / total) * 100}%`, backgroundColor: colors[i % colors.length] }}
            className="transition-all hover:opacity-80" />
        ))}
      </div>
      {/* Legend */}
      <div className="grid grid-cols-2 gap-2">
        {calc.map((h, i) => (
          <div key={h.id} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
            <span className="text-xs text-ink-600 truncate">{h.stock.symbol}</span>
            <span className="text-xs text-ink-400 ml-auto tabular-nums">{((h.currentValue / total) * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

/* ── Main Portfolio ── */
const Portfolio = () => {
  const navigate = useNavigate();

  // Subscribe to ALL stock price updates
  useWebSocket([]);

  const { data: holdings = [], isLoading: holdingsLoading } = useQuery({
    queryKey: ['portfolio'],
    queryFn: portfolioService.getHoldings,
  });

  const { data: summaryData } = useQuery({
    queryKey: ['portfolio-summary'],
    queryFn: portfolioService.getSummary,
  });

  const { data: stocks = [] } = useQuery({
    queryKey: ['stocks'],
    queryFn: stockService.getAll,
    staleTime: 30_000,
  });

  const summary = totalPnL(holdings);
  const isProfit = summary.pnl >= 0;
  const pnlColor = isProfit ? 'text-up' : 'text-down';
  const sign = isProfit ? '+' : '';

  return (
    <div className="p-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-ink-900">Portfolio</h1>
          <p className="text-sm text-ink-400 mt-0.5">Your holdings & performance</p>
        </div>
        <button onClick={() => navigate('/trade')}
          className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors">
          + New Trade
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <StatCard icon="💰" label="Total Invested"    value={formatCurrency(summary.totalInvested)} />
        <StatCard icon="📈" label="Current Value"     value={formatCurrency(summary.totalValue)} />
        <StatCard icon="📊" label="Unrealized P&L"
          value={`${sign}${formatCurrency(summary.pnl)}`}
          sub={`${sign}${summary.pnlPercent.toFixed(2)}%`}
          color={pnlColor} />
        <StatCard icon="🏦" label="Available Balance" value={formatCurrency(summaryData?.balance || 0)} />
      </div>

      {/* Realized P&L banner */}
      {summaryData?.realizedPnl > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-600 font-semibold">Total Sell Proceeds (Realized)</p>
            <p className="text-lg font-bold text-emerald-700 tabular-nums">{formatCurrency(summaryData.realizedPnl)}</p>
          </div>
          <div className="text-2xl">💵</div>
        </div>
      )}

      {/* Main 2-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left — charts + holdings */}
        <div className="lg:col-span-2 space-y-5">
          <PnLChart />
          {holdings.length > 0 && <AllocationBar holdings={holdings} />}
          <Holdings />
        </div>

        {/* Right — market movers */}
        <div className="space-y-5">
          {/* Portfolio quick stats */}
          <Card>
            <CardHeader title="Quick Stats" />
            <div className="space-y-3">
              {[
                { label: 'Holdings',       value: `${holdings.length} stocks` },
                { label: 'Best Performer', value: (() => { const c = calculatePnL(holdings); if (!c.length) return '—'; const b = c.sort((a,b) => b.pnlPercent - a.pnlPercent)[0]; return `${b.stock.symbol} (+${b.pnlPercent.toFixed(1)}%)`; })(), color: 'text-up' },
                { label: 'Worst Performer',value: (() => { const c = calculatePnL(holdings); if (!c.length) return '—'; const w = c.sort((a,b) => a.pnlPercent - b.pnlPercent)[0]; return `${w.stock.symbol} (${w.pnlPercent.toFixed(1)}%)`; })(), color: 'text-down' },
                { label: 'Day P&L',        value: `${sign}${formatCurrency(summary.pnl)}`, color: pnlColor },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-ink-100 last:border-0">
                  <span className="text-xs text-ink-500">{label}</span>
                  <span className={`text-xs font-bold tabular-nums ${color || 'text-ink-800'}`}>{value}</span>
                </div>
              ))}
            </div>
          </Card>

          {stocks.length > 0 && <MarketMovers stocks={stocks} />}
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
