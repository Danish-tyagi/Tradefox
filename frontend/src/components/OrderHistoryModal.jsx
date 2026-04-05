import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../services/orderService';
import { formatCurrency } from '../utils/formatCurrency';

const statusConfig = {
  FILLED:    { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  PENDING:   { cls: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-500' },
  CANCELLED: { cls: 'bg-red-50 text-red-600 border-red-200',             dot: 'bg-red-400' },
  REJECTED:  { cls: 'bg-red-50 text-red-600 border-red-200',             dot: 'bg-red-400' },
};

const OrderHistoryModal = ({ onClose }) => {
  const [filter, setFilter] = useState('all'); // all | buy | sell | filled | pending

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: orderService.getHistory,
  });

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);

  const filtered = orders.filter(o => {
    if (filter === 'buy')     return o.side === 'BUY';
    if (filter === 'sell')    return o.side === 'SELL';
    if (filter === 'filled')  return o.status === 'FILLED';
    if (filter === 'pending') return o.status === 'PENDING';
    return true;
  });

  const filled = orders.filter(o => o.status === 'FILLED').length;
  const buys   = orders.filter(o => o.side === 'BUY').length;
  const sells  = orders.filter(o => o.side === 'SELL').length;
  const totalValue = orders.filter(o => o.status === 'FILLED').reduce((s, o) => s + o.price * o.quantity, 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-4xl bg-white border border-ink-200 rounded-2xl card-shadow-lg animate-fadeInUp flex flex-col"
        style={{ maxHeight: 'calc(100vh - 2rem)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-ink-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-ink-900">Order History</h2>
            <p className="text-sm text-ink-400 mt-0.5">{orders.length} total orders</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-all text-xl leading-none">×</button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-4 shrink-0 border-b border-ink-100">
          {[
            { label: 'Total Orders', value: orders.length,              color: 'text-ink-900',      sub: 'all time' },
            { label: 'Filled',       value: filled,                     color: 'text-emerald-600',  sub: `${orders.length ? ((filled/orders.length)*100).toFixed(0) : 0}% success` },
            { label: 'Buy / Sell',   value: `${buys} / ${sells}`,       color: 'text-ink-900',      sub: 'orders' },
            { label: 'Total Traded', value: formatCurrency(totalValue), color: 'text-brand-600',    sub: 'filled value' },
          ].map(({ label, value, color, sub }) => (
            <div key={label} className="py-4 px-5 border-r border-ink-100 last:border-0">
              <p className={`text-xl font-black tabular-nums ${color}`}>{value}</p>
              <p className="text-xs font-semibold text-ink-700 mt-0.5">{label}</p>
              <p className="text-xs text-ink-400">{sub}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1.5 px-7 py-3 border-b border-ink-100 shrink-0 bg-ink-50">
          {[
            { key: 'all',     label: 'All' },
            { key: 'buy',     label: '↑ Buy' },
            { key: 'sell',    label: '↓ Sell' },
            { key: 'filled',  label: '✓ Filled' },
            { key: 'pending', label: '⏳ Pending' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${filter === key
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-white text-ink-500 border border-ink-200 hover:border-brand-300 hover:text-brand-500'}`}>
              {label}
            </button>
          ))}
          <span className="ml-auto text-xs text-ink-400">{filtered.length} orders</span>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto overflow-x-auto">
          {isLoading ? (
            <div className="p-7 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">📋</div>
              <p className="text-base font-semibold text-ink-700 mb-1">No orders found</p>
              <p className="text-sm text-ink-400">Try a different filter</p>
            </div>
          ) : (
            <table className="w-full min-w-[640px]">
              <thead className="sticky top-0 bg-white z-10 border-b border-ink-100">
                <tr>
                  {['Stock', 'Side', 'Qty × Price', 'Total Value', 'Status', 'Date & Time'].map(h => (
                    <th key={h} className="text-left py-3 px-6 text-xs font-semibold text-ink-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => {
                  const isBuy = o.side === 'BUY';
                  const dt = new Date(o.createdAt);
                  const sc = statusConfig[o.status] || statusConfig.CANCELLED;
                  return (
                    <tr key={o.id} className="border-b border-ink-100 last:border-0 hover:bg-ink-50 transition-colors">

                      {/* Stock */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
                            <span className="text-xs font-black text-brand-600">{o.stock.symbol.slice(0, 2)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-ink-900">{o.stock.symbol}</p>
                            <p className="text-xs text-ink-400 truncate max-w-[100px]">{o.stock.name}</p>
                          </div>
                        </div>
                      </td>

                      {/* Side */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border
                          ${isBuy ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isBuy ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          {o.side}
                        </span>
                      </td>

                      {/* Qty × Price */}
                      <td className="py-4 px-6">
                        <p className="text-sm font-semibold text-ink-800 tabular-nums whitespace-nowrap">
                          {o.quantity} × {formatCurrency(o.price)}
                        </p>
                        <p className="text-xs text-ink-400 mt-0.5">{o.type}</p>
                      </td>

                      {/* Total */}
                      <td className="py-4 px-6">
                        <p className="text-sm font-bold text-ink-900 tabular-nums whitespace-nowrap">
                          {formatCurrency(o.price * o.quantity)}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border ${sc.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {o.status}
                        </span>
                      </td>

                      {/* Time */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <p className="text-sm text-ink-700 tabular-nums font-medium">
                          {dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-xs text-ink-400 mt-0.5 tabular-nums">
                          {dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </p>
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

export default OrderHistoryModal;
