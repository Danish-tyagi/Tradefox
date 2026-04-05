import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { portfolioService } from '../../services/portfolioService';
import { formatCurrency } from '../../utils/formatCurrency';
import { calculatePnL } from '../../utils/calculatePnL';
import Badge from '../../components/Badge';
import Card, { CardHeader } from '../../components/Card';
import { orderService } from '../../services/orderService';
import { useToast } from '../../components/Toast';

/* ── Quick Sell Modal ── */
const SellModal = ({ holding, onClose }) => {
  const [qty, setQty] = useState(1);
  const [type, setType] = useState('MARKET');
  const [limitPrice, setLimitPrice] = useState(holding.stock.currentPrice);
  const qc = useQueryClient();
  const toast = useToast();

  const sell = useMutation({
    mutationFn: (d) => orderService.place(d),
    onSuccess: (data) => {
      qc.invalidateQueries(['portfolio']);
      qc.invalidateQueries(['portfolio-summary']);
      qc.invalidateQueries(['orders']);
      const o = data.order;
      toast.success(
        `Sold ${qty} × ${holding.stock.symbol} @ ${formatCurrency(o.price)}`,
        'Sell Order Executed!'
      );
      onClose();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Sell failed. Try again.', 'Order Failed');
    },
  });

  const execPrice = type === 'MARKET' ? holding.stock.currentPrice : limitPrice;
  const total = qty * execPrice;
  const maxQty = holding.quantity;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-sm bg-white border border-ink-200 rounded-2xl card-shadow-lg animate-fadeInUp">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
          <div>
            <h2 className="text-base font-bold text-ink-900">Sell {holding.stock.symbol}</h2>
            <p className="text-xs text-ink-400 mt-0.5">{holding.stock.name}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 text-xl">×</button>
        </div>

        {/* Current holding info */}
        <div className="mx-6 mt-4 bg-ink-50 border border-ink-200 rounded-xl px-4 py-3 grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs text-ink-400">Holdings</p>
            <p className="text-sm font-bold text-ink-800 tabular-nums">{holding.quantity}</p>
          </div>
          <div>
            <p className="text-xs text-ink-400">Avg Cost</p>
            <p className="text-sm font-bold text-ink-800 tabular-nums">{formatCurrency(holding.avgBuyPrice)}</p>
          </div>
          <div>
            <p className="text-xs text-ink-400">LTP</p>
            <p className={`text-sm font-bold tabular-nums ${holding.pnl >= 0 ? 'text-up' : 'text-down'}`}>
              {formatCurrency(holding.stock.currentPrice)}
            </p>
          </div>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Order type */}
          <div className="flex gap-2">
            {['MARKET', 'LIMIT'].map(t => (
              <button key={t} type="button" onClick={() => setType(t)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all
                  ${type === t ? 'border-red-400 text-red-600 bg-red-50' : 'border-ink-200 text-ink-500 bg-white hover:border-ink-300'}`}>
                {t}
              </button>
            ))}
          </div>

          {/* Quantity */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-ink-600">Quantity</label>
              <button onClick={() => setQty(maxQty)}
                className="text-xs text-brand-500 font-semibold hover:text-brand-600">Max ({maxQty})</button>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-9 h-9 bg-ink-50 border border-ink-200 rounded-lg text-ink-700 hover:border-red-400 font-bold text-lg leading-none">−</button>
              <input type="number" min="1" max={maxQty} value={qty}
                onChange={e => setQty(Math.min(maxQty, Math.max(1, parseInt(e.target.value) || 1)))}
                className="flex-1 bg-white border border-ink-200 rounded-lg px-3 py-2 text-sm text-ink-800 text-center focus:outline-none focus:ring-2 focus:ring-red-400/25 focus:border-red-400 tabular-nums" />
              <button type="button" onClick={() => setQty(q => Math.min(maxQty, q + 1))}
                className="w-9 h-9 bg-ink-50 border border-ink-200 rounded-lg text-ink-700 hover:border-red-400 font-bold text-lg leading-none">+</button>
            </div>
          </div>

          {/* Limit price */}
          {type === 'LIMIT' && (
            <div>
              <label className="block text-xs font-medium text-ink-600 mb-1.5">Limit Price (₹)</label>
              <input type="number" step="0.05" value={limitPrice}
                onChange={e => setLimitPrice(parseFloat(e.target.value))}
                className="w-full bg-white border border-ink-200 rounded-lg px-3 py-2.5 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-red-400/25 focus:border-red-400 tabular-nums" />
            </div>
          )}

          {/* Total */}
          <div className="bg-ink-50 border border-ink-200 rounded-xl px-4 py-3 flex justify-between items-center">
            <span className="text-xs text-ink-500 font-medium">You will receive</span>
            <span className="text-sm font-bold text-ink-900 tabular-nums">{formatCurrency(total)}</span>
          </div>

          {/* P&L preview */}
          <div className={`rounded-xl px-4 py-3 flex justify-between items-center
            ${holding.pnl >= 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
            <span className="text-xs font-medium text-ink-600">Estimated P&L</span>
            <span className={`text-sm font-bold tabular-nums ${holding.pnl >= 0 ? 'text-up' : 'text-down'}`}>
              {holding.pnl >= 0 ? '+' : ''}{formatCurrency((execPrice - holding.avgBuyPrice) * qty)}
            </span>
          </div>

          {/* Sell button */}
          <button
            onClick={() => sell.mutate({ stockId: holding.stockId, type, side: 'SELL', quantity: qty, price: execPrice })}
            disabled={sell.isPending}
            className="w-full py-3 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 shadow-sm">
            {sell.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Selling...
              </span>
            ) : `Sell ${qty} × ${holding.stock.symbol}`}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Holdings Table ── */
const Holdings = () => {
  const navigate = useNavigate();
  const [sellTarget, setSellTarget] = useState(null);

  const { data: holdings = [], isLoading } = useQuery({
    queryKey: ['portfolio'],
    queryFn: portfolioService.getHoldings,
  });

  const calculated = calculatePnL(holdings);

  if (isLoading) return (
    <Card><CardHeader title="Holdings" />
      <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-12 skeleton rounded-xl" />)}</div>
    </Card>
  );

  if (!calculated.length) return (
    <Card>
      <CardHeader title="Holdings" />
      <div className="text-center py-10">
        <div className="text-4xl mb-3">📭</div>
        <p className="text-sm text-ink-400">No holdings yet.{' '}
          <button onClick={() => navigate('/trade')} className="text-brand-500 hover:text-brand-600 font-semibold">Start trading</button>
        </p>
      </div>
    </Card>
  );

  return (
    <>
      <Card padding={false}>
        <div className="px-5 pt-5 pb-3 border-b border-ink-100">
          <CardHeader title="Holdings" subtitle={`${calculated.length} stocks`} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100">
                {['Stock', 'Qty', 'Avg Cost', 'LTP', 'Invested', 'Current', 'P&L', ''].map((h) => (
                  <th key={h} className="py-2.5 px-4 text-left text-xs font-semibold text-ink-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {calculated.map((h) => {
                const profit = h.pnl >= 0;
                return (
                  <tr key={h.id}
                    className="border-b border-ink-100 hover:bg-ink-50 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/trade?symbol=${h.stock.symbol}`)}>
                    <td className="py-3 px-4">
                      <p className="font-bold text-ink-900">{h.stock.symbol}</p>
                      <p className="text-xs text-ink-400 truncate max-w-[100px]">{h.stock.name}</p>
                    </td>
                    <td className="py-3 px-4 text-ink-700 tabular-nums font-medium">{h.quantity}</td>
                    <td className="py-3 px-4 text-ink-600 tabular-nums">{formatCurrency(h.avgBuyPrice)}</td>
                    <td className="py-3 px-4 font-semibold text-ink-800 tabular-nums">{formatCurrency(h.stock.currentPrice)}</td>
                    <td className="py-3 px-4 text-ink-600 tabular-nums">{formatCurrency(h.investedValue)}</td>
                    <td className="py-3 px-4 text-ink-600 tabular-nums">{formatCurrency(h.currentValue)}</td>
                    <td className="py-3 px-4">
                      <p className={`font-bold tabular-nums ${profit ? 'text-up' : 'text-down'}`}>
                        {profit ? '+' : ''}{formatCurrency(h.pnl)}
                      </p>
                      <Badge variant={profit ? 'success' : 'danger'}>
                        {profit ? '+' : ''}{h.pnlPercent.toFixed(2)}%
                      </Badge>
                    </td>
                    {/* Sell button — visible on row hover */}
                    <td className="py-3 px-4">
                      <button
                        onClick={e => { e.stopPropagation(); setSellTarget(h); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white text-xs font-bold rounded-lg border border-red-200 hover:border-red-500 whitespace-nowrap">
                        SELL
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {sellTarget && <SellModal holding={sellTarget} onClose={() => setSellTarget(null)} />}
    </>
  );
};

export default Holdings;
