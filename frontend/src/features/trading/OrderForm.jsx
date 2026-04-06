import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../../services/orderService';
import { formatCurrency } from '../../utils/formatCurrency';
import { useToast } from '../../components/Toast';
import { useAuth } from '../../hooks/useAuth';

/* ── Explain My Trade Modal ── */
const TIPS = {
  BUY_MARKET:  'Market order sabse fast hota hai — current price pe turant execute hota hai. Beginners ke liye best.',
  BUY_LIMIT:   'Limit order smart move hai — tum apni price set karte ho. Jab stock us price pe aaye, tab hi kharidega.',
  BUY_SL:      'Stop-Loss order tumhara safety net hai. Agar price neeche gayi toh automatically sell ho jaayega — loss limited rehta hai.',
  BUY_SLM:     'SL-Market order fast exit deta hai — trigger hone pe market price pe turant execute hota hai.',
  SELL_MARKET: 'Market pe turant bech diya — current price milegi. Jaldi exit ke liye best.',
  SELL_LIMIT:  'Apni target price set ki — jab stock us price pe pahunche, tab sell hoga. Patience chahiye.',
  SELL_SL:     'Stop-Loss se tumne apna downside protect kiya. Agar price aur neeche gayi toh bhi tum safe ho.',
  SELL_SLM:    'SL-Market se fast exit liya — trigger hone pe market price pe sell ho gaya.',
};

const ExplainMyTrade = ({ order, onClose }) => {
  const isBuy = order.side === 'BUY';
  const price = order.price;
  const qty   = order.quantity;
  const total = price * qty;
  const symbol = order.stock?.symbol || 'stock';
  const type  = order.type || 'MARKET';

  // Profit/loss scenarios — 5% up and 5% down
  const up5   = price * 1.05;
  const down5 = price * 0.95;
  const profitIf5Up   = isBuy ? (up5   - price) * qty : (price - up5)   * qty;
  const profitIf5Down = isBuy ? (down5 - price) * qty : (price - down5) * qty;

  const tipKey = `${order.side}_${type}`;
  const tip = TIPS[tipKey] || TIPS[`${order.side}_MARKET`];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fadeInUp">

        {/* Header */}
        <div className={`px-5 py-4 ${isBuy ? 'bg-emerald-500' : 'bg-red-500'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white text-lg font-black">
                {isBuy ? '↑' : '↓'}
              </div>
              <div>
                <p className="text-white font-extrabold text-base leading-tight">
                  {order.status === 'FILLED' ? 'Trade Execute Ho Gayi!' : 'Order Place Ho Gaya!'}
                </p>
                <p className="text-white/80 text-xs mt-0.5">
                  {isBuy ? 'Kharida' : 'Becha'} {qty} × {symbol} @ {formatCurrency(price)}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white text-xl leading-none">×</button>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">

          {/* Plain language summary */}
          <div className="bg-ink-50 border border-ink-200 rounded-xl px-4 py-3">
            <p className="text-xs font-bold text-ink-500 uppercase tracking-wide mb-1.5">Tune kya kiya?</p>
            <p className="text-sm text-ink-800 leading-relaxed">
              {isBuy
                ? <>Tune <span className="font-bold text-emerald-600">{qty} shares</span> of <span className="font-bold">{symbol}</span> khareed liye <span className="font-bold">{formatCurrency(price)}</span> per share pe. Tera total investment hai <span className="font-bold">{formatCurrency(total)}</span>.</>
                : <>Tune <span className="font-bold text-red-500">{qty} shares</span> of <span className="font-bold">{symbol}</span> bech diye <span className="font-bold">{formatCurrency(price)}</span> per share pe. Tujhe mila <span className="font-bold">{formatCurrency(total)}</span>.</>
              }
            </p>
          </div>

          {/* Profit/Loss scenarios */}
          <div>
            <p className="text-xs font-bold text-ink-500 uppercase tracking-wide mb-2">Agar price move kare toh?</p>
            <div className="grid grid-cols-2 gap-2">
              <div className={`rounded-xl px-3 py-2.5 border ${profitIf5Up >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                <p className="text-[10px] text-ink-500 mb-0.5">Price 5% upar gayi</p>
                <p className="text-xs font-bold text-ink-600 tabular-nums">{formatCurrency(up5)} / share</p>
                <p className={`text-sm font-extrabold tabular-nums mt-0.5 ${profitIf5Up >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {profitIf5Up >= 0 ? '+' : ''}{formatCurrency(profitIf5Up)}
                </p>
              </div>
              <div className={`rounded-xl px-3 py-2.5 border ${profitIf5Down >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                <p className="text-[10px] text-ink-500 mb-0.5">Price 5% neeche gayi</p>
                <p className="text-xs font-bold text-ink-600 tabular-nums">{formatCurrency(down5)} / share</p>
                <p className={`text-sm font-extrabold tabular-nums mt-0.5 ${profitIf5Down >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {profitIf5Down >= 0 ? '+' : ''}{formatCurrency(profitIf5Down)}
                </p>
              </div>
            </div>
          </div>

          {/* Order type tip */}
          <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
            <span className="text-base shrink-0">💡</span>
            <p className="text-xs text-blue-700 leading-relaxed">{tip}</p>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full
              ${order.status === 'FILLED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
              {order.status === 'FILLED' ? '✓ Executed' : '⏳ ' + order.status}
            </span>
            {order.status === 'PENDING' && (
              <p className="text-[11px] text-ink-400">Market open hone pe execute hoga</p>
            )}
          </div>

          <button onClick={onClose}
            className="w-full py-2.5 text-sm font-bold bg-ink-900 hover:bg-ink-800 text-white rounded-xl transition-colors">
            Samajh Gaya 👍
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderForm = ({ stock, embedded = false }) => {
  const [side, setSide] = useState('BUY');
  const [type, setType] = useState('MARKET');
  const [productType, setProductType] = useState('MIS'); // MIS = Intraday, CNC = Delivery
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(stock?.currentPrice || 0);
  const [triggerPrice, setTriggerPrice] = useState('');
  const [lastOrder, setLastOrder] = useState(null);
  const qc = useQueryClient();
  const { updateBalance } = useAuth();

  // Update price when stock changes
  useEffect(() => {
    if (stock?.currentPrice) setPrice(stock.currentPrice);
  }, [stock?.id]);

  // Reset price when switching order type
  useEffect(() => {
    if (stock?.currentPrice) setPrice(stock.currentPrice);
  }, [type]);

  const toast = useToast();
  const place = useMutation({
    mutationFn: (d) => orderService.place(d),
    onSuccess: (data) => {
      // attach order type so ExplainMyTrade can show the right tip
      setLastOrder({ ...data.order, type });
      qc.invalidateQueries(['orders']);
      qc.invalidateQueries(['portfolio']);
      qc.invalidateQueries(['portfolio-summary']);
      // Sync balance in sidebar immediately
      if (data.balance !== undefined) updateBalance(data.balance);
      setQty(1);
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || 'Order failed. Try again.';
      toast.error(msg, 'Order Failed');
    },
  });

  const total = qty * (type === 'MARKET' || type === 'SLM' ? stock?.currentPrice || 0 : price);
  const isBuy = side === 'BUY';

  return (
    <>
      <div className={embedded ? '' : 'bg-white border border-ink-200 rounded-2xl p-5 card-shadow'}>
        {!embedded && <h3 className="text-sm font-semibold text-ink-800 mb-4">Place Order</h3>}
        <form onSubmit={(e) => {
          e.preventDefault();
          place.mutate({
            stockId: stock.id, type, side,
            quantity: qty,
            price: type === 'MARKET' ? stock.currentPrice : parseFloat(price),
            triggerPrice: (type === 'SL' || type === 'SLM') ? parseFloat(triggerPrice) : undefined,
          });
        }} className="space-y-4">

          {/* BUY / SELL — screenshot style */}
          <div className="flex gap-3">
            <button type="button" onClick={() => setSide('BUY')}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all
                ${side === 'BUY'
                  ? 'bg-emerald-500 text-white shadow-[0_4px_12px_rgba(5,150,105,0.3)]'
                  : 'bg-white text-ink-500 border border-ink-200 hover:border-emerald-300 hover:text-emerald-600'}`}>
              BUY
            </button>
            <button type="button" onClick={() => setSide('SELL')}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all
                ${side === 'SELL'
                  ? 'bg-red-500 text-white shadow-[0_4px_12px_rgba(220,38,38,0.3)]'
                  : 'bg-white text-ink-500 border border-ink-200 hover:border-red-300 hover:text-red-500'}`}>
              SELL
            </button>
          </div>

          {/* MIS / CNC product type */}
          <div>
            <div className="flex gap-1 bg-ink-100 rounded-xl p-1">
              {[['MIS', 'Intraday (MIS)'], ['CNC', 'Delivery (CNC)']].map(([key, label]) => (
                <button key={key} type="button" onClick={() => setProductType(key)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all
                    ${productType === key
                      ? 'bg-white text-ink-900 shadow-sm'
                      : 'text-ink-400 hover:text-ink-600'}`}>
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-ink-400 px-1">
              {productType === 'MIS'
                ? '📅 Intraday — same day buy & sell karo. Market close hone se pehle position square off hogi.'
                : '📦 Delivery — stock apne portfolio mein rakhoge. Long-term ke liye.'}
            </p>
          </div>

          {/* MARKET / LIMIT / SL / SLM */}
          <div>
            <div className="grid grid-cols-2 gap-2">
              {['MARKET', 'LIMIT', 'SL', 'SLM'].map((t) => (
                <button key={t} type="button" onClick={() => setType(t)}
                  className={`py-2.5 text-xs font-bold rounded-xl border-2 transition-all
                    ${type === t
                      ? 'border-orange-400 text-orange-500 bg-orange-50'
                      : 'border-ink-200 text-ink-400 bg-white hover:border-ink-300'}`}>
                  {t === 'SL' ? 'Stop-Loss' : t === 'SLM' ? 'SL-Market' : t}
                </button>
              ))}
            </div>
            {/* Beginner hint */}
            <div className="mt-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-[11px] text-blue-600 leading-relaxed">
              {type === 'MARKET' && '⚡ Market Order — abhi ke price pe turant execute hoga.'}
              {type === 'LIMIT'  && '🎯 Limit Order — apni price set karo, jab stock us price pe aaye tab execute hoga.'}
              {type === 'SL'     && '🛡️ Stop-Loss — trigger price pe order activate hoga, phir limit price pe execute hoga. Loss rokne ke liye use karo.'}
              {type === 'SLM'    && '🛡️ SL-Market — trigger price pe activate hoga aur market price pe execute hoga. Fast exit ke liye.'}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-2">Quantity</label>
            <div className="flex items-center border border-ink-200 rounded-xl bg-white" style={{ minWidth: 0 }}>
              <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-12 h-12 flex items-center justify-center text-ink-500 hover:bg-ink-50 hover:text-ink-800 transition-colors text-xl font-light border-r border-ink-200 rounded-l-xl shrink-0">
                −
              </button>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={qty}
                onChange={e => { const v = parseInt(e.target.value); setQty(isNaN(v) ? 1 : Math.max(1, v)); }}
                className="flex-1 min-w-0 h-12 bg-white px-3 text-base text-ink-800 text-center focus:outline-none tabular-nums font-semibold"
              />
              <button type="button" onClick={() => setQty(q => q + 1)}
                className="w-12 h-12 flex items-center justify-center text-ink-500 hover:bg-ink-50 hover:text-ink-800 transition-colors text-xl font-light border-l border-ink-200 rounded-r-xl shrink-0">
                +
              </button>
            </div>
          </div>

          {type === 'LIMIT' && (
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">Limit Price (₹)</label>
              <input type="number" step="0.05" value={price} onChange={e => setPrice(e.target.value)}
                className="w-full bg-white border border-ink-200 rounded-xl px-4 py-3 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 tabular-nums" />
            </div>
          )}

          {(type === 'SL' || type === 'SLM') && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-2">
                  Trigger Price (₹)
                  <span className="ml-1 text-xs text-ink-400 font-normal">— order activates at this price</span>
                </label>
                <input type="number" step="0.05" value={triggerPrice} onChange={e => setTriggerPrice(e.target.value)}
                  placeholder={stock?.currentPrice?.toFixed(2)}
                  className="w-full bg-white border border-orange-300 rounded-xl px-4 py-3 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 tabular-nums" />
              </div>
              {type === 'SL' && (
                <div>
                  <label className="block text-sm font-semibold text-ink-700 mb-2">Limit Price (₹)</label>
                  <input type="number" step="0.05" value={price} onChange={e => setPrice(e.target.value)}
                    className="w-full bg-white border border-ink-200 rounded-xl px-4 py-3 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 tabular-nums" />
                </div>
              )}
            </div>
          )}

          {/* Total Value */}
          <div className="flex items-center justify-between bg-ink-50 border border-ink-200 rounded-xl px-4 py-3.5">
            <div>
              <span className="text-sm text-ink-500 font-medium">Total Value</span>
              <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-md
                ${productType === 'MIS' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                {productType}
              </span>
            </div>
            <span className="text-base font-bold text-ink-900 tabular-nums">{formatCurrency(total)}</span>
          </div>

          {/* Submit */}
          <button type="submit" disabled={place.isPending}
            className={`w-full py-4 text-sm font-bold rounded-xl transition-all disabled:opacity-50 text-white tracking-wide
              ${isBuy
                ? 'bg-emerald-500 hover:bg-emerald-600 shadow-[0_4px_14px_rgba(5,150,105,0.35)]'
                : 'bg-red-500 hover:bg-red-600 shadow-[0_4px_14px_rgba(220,38,38,0.35)]'}`}>
            {place.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Placing...
              </span>
            ) : `${side} ${stock?.symbol}`}
          </button>

          {place.isError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
              <span className="text-red-500 text-sm">⚠</span>
              <p className="text-xs text-red-600 font-medium">
                {place.error?.response?.data?.message || 'Order failed. Try again.'}
              </p>
            </div>
          )}
        </form>
      </div>

      {/* Success toast */}
      {lastOrder && createPortal(
        <ExplainMyTrade order={lastOrder} onClose={() => setLastOrder(null)} />,
        document.body
      )}
    </>
  );
};

export default OrderForm;
