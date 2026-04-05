import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { portfolioService } from '../../services/portfolioService';
import { calculatePnL } from '../../utils/calculatePnL';
import { formatCurrency } from '../../utils/formatCurrency';
import Card, { CardHeader } from '../../components/Card';

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-ink-200 rounded-xl shadow-lg px-4 py-3 text-sm card-shadow-md">
      <p className="text-ink-400 text-xs mb-1">{label}</p>
      <p className="font-bold text-ink-900 tabular-nums">{formatCurrency(payload[0].value)}</p>
      {payload[1] && <p className="text-xs text-ink-400 tabular-nums">Invested: {formatCurrency(payload[1].value)}</p>}
    </div>
  );
};

const PnLChart = () => {
  const { data: holdings = [], isLoading } = useQuery({ queryKey: ['portfolio'], queryFn: portfolioService.getHoldings });
  const calc = calculatePnL(holdings);
  const chartData = calc.map((h) => ({ name: h.stock.symbol, value: +h.currentValue.toFixed(2), invested: +h.investedValue.toFixed(2) }));
  const totalPnL = calc.reduce((s, h) => s + h.pnl, 0);
  const profit = totalPnL >= 0;
  const lineColor = profit ? '#059669' : '#dc2626';

  if (isLoading) return <Card><CardHeader title="P&L Overview" /><div className="h-48 skeleton rounded-xl" /></Card>;
  if (!chartData.length) return <Card><CardHeader title="P&L Overview" /><p className="text-sm text-ink-400 text-center py-8">No holdings to chart yet.</p></Card>;

  return (
    <Card>
      <CardHeader title="P&L Overview"
        subtitle={<span className={profit ? 'text-up font-semibold' : 'text-down font-semibold'}>{profit ? '+' : ''}{formatCurrency(totalPnL)} overall</span>} />
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="cv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={lineColor} stopOpacity={0.15} />
              <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
          <Tooltip content={<Tip />} />
          <Area type="monotone" dataKey="value" stroke={lineColor} strokeWidth={2} fill="url(#cv)" name="Current Value" />
          <Area type="monotone" dataKey="invested" stroke="#cbd5e1" strokeWidth={1.5} fill="none" strokeDasharray="4 3" name="Invested" />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default PnLChart;
