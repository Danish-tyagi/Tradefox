import { useQuery } from '@tanstack/react-query';
import { portfolioService } from '../../services/portfolioService';
import { formatCurrency } from '../../utils/formatCurrency';

const StatCard = ({ label, value, sub, color, icon }) => (
  <div className="bg-white rounded-2xl border border-ink-200 card-shadow p-5 flex items-start gap-4">
    <div className="w-10 h-10 rounded-xl bg-ink-50 border border-ink-200 flex items-center justify-center shrink-0 text-lg">{icon}</div>
    <div>
      <p className="text-xs text-ink-400 font-medium mb-1">{label}</p>
      <p className={`text-xl font-bold tabular-nums ${color || 'text-ink-900'}`}>{value}</p>
      {sub && <p className={`text-xs mt-0.5 tabular-nums font-semibold ${color || 'text-ink-400'}`}>{sub}</p>}
    </div>
  </div>
);

const PortfolioSummary = () => {
  const { data, isLoading } = useQuery({ queryKey: ['portfolio-summary'], queryFn: portfolioService.getSummary });

  if (isLoading) return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-ink-200 card-shadow p-5">
          <div className="h-3 skeleton rounded mb-3 w-2/3" />
          <div className="h-6 skeleton rounded w-full" />
        </div>
      ))}
    </div>
  );

  const pnl = data?.pnl || 0;
  const color = pnl > 0 ? 'text-up' : pnl < 0 ? 'text-down' : 'text-ink-900';
  const sign = pnl > 0 ? '+' : '';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard icon="📈" label="Current Value"     value={formatCurrency(data?.totalValue || 0)} />
      <StatCard icon="💰" label="Invested Value"    value={formatCurrency(data?.totalInvested || 0)} />
      <StatCard icon="📊" label="Total P&L"         value={`${sign}${formatCurrency(pnl)}`} sub={`${sign}${data?.pnlPercent?.toFixed(2) || 0}%`} color={color} />
      <StatCard icon="🏦" label="Available Balance" value={formatCurrency(data?.balance || 0)} />
    </div>
  );
};

export default PortfolioSummary;
