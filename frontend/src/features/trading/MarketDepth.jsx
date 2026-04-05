import { useMemo } from 'react';
import { formatCurrency } from '../../utils/formatCurrency';

/**
 * Simulated Market Depth (Order Book) — 5 best bids & asks
 * Generates realistic bid/ask levels from current price
 */
const generateDepth = (price) => {
  if (!price) return { bids: [], asks: [] };

  const spread = price * 0.0002; // ~0.02% spread
  const bids = [];
  const asks = [];

  for (let i = 0; i < 5; i++) {
    const bidPrice = parseFloat((price - spread * (i + 1) - Math.random() * spread * 0.5).toFixed(2));
    const askPrice = parseFloat((price + spread * (i + 1) + Math.random() * spread * 0.5).toFixed(2));
    const bidQty = Math.floor(Math.random() * 900) + 100;
    const askQty = Math.floor(Math.random() * 900) + 100;
    const bidOrders = Math.floor(Math.random() * 15) + 1;
    const askOrders = Math.floor(Math.random() * 15) + 1;
    bids.push({ price: bidPrice, qty: bidQty, orders: bidOrders });
    asks.push({ price: askPrice, qty: askQty, orders: askOrders });
  }

  return { bids, asks };
};

const MarketDepth = ({ price }) => {
  // Regenerate depth on each price tick (memoized per price)
  const { bids, asks } = useMemo(() => generateDepth(price), [Math.round((price || 0) * 100)]);

  const totalBidQty = bids.reduce((s, b) => s + b.qty, 0);
  const totalAskQty = asks.reduce((s, a) => s + a.qty, 0);
  const maxQty = Math.max(...bids.map(b => b.qty), ...asks.map(a => a.qty));

  if (!price) return null;

  return (
    <div className="space-y-2">
      {/* Beginner explanation */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-[11px] text-blue-700 leading-relaxed">
        📖 <span className="font-bold">Order Book kya hai?</span> Yeh dikhata hai ki kitne log kaunsi price pe stock khareedna (Buy/Green) ya bechna (Sell/Red) chahte hain. Jahan zyada orders hain, wahan price support/resistance hoti hai.
      </div>
      <div className="border border-ink-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-3 bg-ink-50 px-3 py-1.5 text-[11px] font-semibold text-ink-400 border-b border-ink-200">
        <span>Orders</span>
        <span className="text-center">Qty</span>
        <span className="text-right">Price</span>
      </div>

      {/* Asks (sell side) — reversed so best ask is closest to price */}
      {[...asks].reverse().map((ask, i) => (
        <div key={i} className="relative grid grid-cols-3 px-3 py-1 hover:bg-red-50 transition-colors">
          <div className="absolute inset-y-0 right-0 bg-red-50 opacity-60 transition-all"
            style={{ width: `${(ask.qty / maxQty) * 100}%` }} />
          <span className="relative text-ink-500 tabular-nums">{ask.orders}</span>
          <span className="relative text-center text-ink-700 tabular-nums font-medium">{ask.qty.toLocaleString('en-IN')}</span>
          <span className="relative text-right text-red-500 font-bold tabular-nums">{formatCurrency(ask.price)}</span>
        </div>
      ))}

      {/* Spread indicator */}
      <div className="grid grid-cols-3 px-3 py-1.5 bg-ink-50 border-y border-ink-200">
        <span className="text-ink-400 text-[10px]">Spread</span>
        <span className="text-center text-ink-500 tabular-nums text-[10px]">
          {asks[0] && bids[0] ? formatCurrency(asks[0].price - bids[0].price) : '—'}
        </span>
        <span className="text-right text-ink-400 text-[10px]">
          {asks[0] && bids[0] ? (((asks[0].price - bids[0].price) / bids[0].price) * 100).toFixed(3) + '%' : ''}
        </span>
      </div>

      {/* Bids (buy side) */}
      {bids.map((bid, i) => (
        <div key={i} className="relative grid grid-cols-3 px-3 py-1 hover:bg-emerald-50 transition-colors">
          <div className="absolute inset-y-0 left-0 bg-emerald-50 opacity-60 transition-all"
            style={{ width: `${(bid.qty / maxQty) * 100}%` }} />
          <span className="relative text-ink-500 tabular-nums">{bid.orders}</span>
          <span className="relative text-center text-ink-700 tabular-nums font-medium">{bid.qty.toLocaleString('en-IN')}</span>
          <span className="relative text-right text-emerald-600 font-bold tabular-nums">{formatCurrency(bid.price)}</span>
        </div>
      ))}

      {/* Footer totals */}
      <div className="grid grid-cols-2 border-t border-ink-200 bg-ink-50">
        <div className="px-3 py-1.5 border-r border-ink-200">
          <p className="text-[10px] text-ink-400">Total Buy Qty</p>
          <p className="text-xs font-bold text-emerald-600 tabular-nums">{totalBidQty.toLocaleString('en-IN')}</p>
        </div>
        <div className="px-3 py-1.5">
          <p className="text-[10px] text-ink-400">Total Sell Qty</p>
          <p className="text-xs font-bold text-red-500 tabular-nums">{totalAskQty.toLocaleString('en-IN')}</p>
        </div>
      </div>
      </div>
    </div>
  );
};

export default MarketDepth;
