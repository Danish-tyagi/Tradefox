import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stockService } from '../services/stockService';
import StockSearch from '../features/trading/StockSearch';
import OrderForm from '../features/trading/OrderForm';
import OrderHistory from '../features/trading/OrderHistory';
import CandleChart from '../features/trading/CandleChart';
import PriceAlerts from '../features/trading/PriceAlerts';
import MarketDepth from '../features/trading/MarketDepth';
import StockFundamentals from '../features/trading/StockFundamentals';
import Card, { CardHeader } from '../components/Card';
import useWebSocket from '../hooks/useWebSocket';
import useStockPrice from '../hooks/useStockPrice';
import useMarketStatus from '../hooks/useMarketStatus';
import { formatCurrency } from '../utils/formatCurrency';
import { useToast } from '../components/Toast';

/* ── Market Status Banner ── */
const MarketStatusBanner = () => {
  const status = useMarketStatus();
  if (status.open === null) return null;

  if (status.open) {
    return (
      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-xs font-semibold text-emerald-700">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        Market Open · NSE/BSE
        {status.closesIn && <span className="ml-auto text-emerald-600 font-normal">Closes in {status.closesIn}</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-xs font-semibold text-amber-700">
      <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
      {status.reason} · Orders will execute when market opens
      {status.nextOpen && <span className="ml-auto text-amber-600 font-normal">{status.nextOpen}</span>}
    </div>
  );
};

/* ── Left stock list panel ── */
const StockListPanel = ({ stocks, selected, onSelect }) => {
  const [filter, setFilter] = useState('');
  const [tab, setTab] = useState('all');

  const filtered = stocks
    .filter(s => {
      const q = filter.toLowerCase();
      return s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
    })
    .filter(s => {
      if (tab === 'gainers') return s.change >= 0;
      if (tab === 'losers')  return s.change < 0;
      return true;
    });

  return (
    <div className="bg-white border border-ink-200 rounded-2xl flex flex-col h-[calc(100vh-96px)] sticky top-5 overflow-hidden"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>

      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-ink-100 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-ink-800">Market Watch</p>
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" value={filter} onChange={e => setFilter(e.target.value)}
            placeholder="Search..."
            className="w-full bg-ink-50 border border-ink-200 rounded-lg pl-8 pr-3 py-2 text-xs text-ink-800 placeholder-ink-400
              focus:outline-none focus:ring-1 focus:ring-brand-400 focus:border-brand-400 transition-all" />
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 bg-ink-100 rounded-lg p-0.5">
          {[['all', 'All'], ['gainers', '▲ Gainers'], ['losers', '▼ Losers']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all
                ${tab === key ? 'bg-white text-ink-800 shadow-sm' : 'text-ink-500 hover:text-ink-700'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stock list */}
      <div className="overflow-y-auto flex-1 divide-y divide-ink-50">
        {filtered.length === 0 ? (
          <p className="text-xs text-ink-400 text-center py-8">No stocks found</p>
        ) : filtered.map((s) => {
          const up = s.change >= 0;
          const isSelected = selected?.id === s.id;
          return (
            <button key={s.id} onClick={() => onSelect(s)}
              className={`w-full flex items-center justify-between px-4 py-3 transition-all text-left group
                ${isSelected
                  ? 'bg-brand-50 border-l-[3px] border-l-brand-500'
                  : 'hover:bg-ink-50 border-l-[3px] border-l-transparent'}`}>
              <div className="min-w-0">
                <p className={`text-xs font-bold truncate ${isSelected ? 'text-brand-600' : 'text-ink-800'}`}>{s.symbol}</p>
                <p className="text-[11px] text-ink-400 truncate max-w-[90px] mt-0.5">{s.name}</p>
              </div>
              <div className="text-right shrink-0 ml-2">
                <p className="text-xs font-semibold text-ink-700 tabular-nums">₹{s.currentPrice?.toLocaleString('en-IN')}</p>
                <p className={`text-[11px] font-bold tabular-nums mt-0.5 ${up ? 'text-emerald-600' : 'text-red-500'}`}>
                  {up ? '+' : ''}{s.changePercent?.toFixed(2)}%
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-ink-100 shrink-0">
        <span className="text-xs text-ink-400">{filtered.length} stocks</span>
      </div>
    </div>
  );
};

/* ── Right panel: stock info + order form combined ── */
const RightPanel = ({ stock }) => {
  const { price, change, changePercent } = useStockPrice(stock?.symbol);
  const livePrice = price ?? stock?.currentPrice;
  const liveChange = change ?? stock?.change;
  const liveChangePct = changePercent ?? stock?.changePercent;
  const up = (liveChange ?? 0) >= 0;
  const qc = useQueryClient();
  const toast = useToast();
  const marketStatus = useMarketStatus();

  // 'order' | 'depth' | 'info' | 'alerts'
  const [tab, setTab] = useState('order');

  const wl = useMutation({
    mutationFn: (id) => stockService.addToWatchlist(id),
    onSuccess: () => {
      qc.invalidateQueries(['watchlist']);
      toast.success(`${stock?.symbol} added to your watchlist`, 'Added to Watchlist');
    },
    onError: () => toast.info(`${stock?.symbol} is already in your watchlist`),
  });

  if (!stock) return (
    <div className="bg-white border border-ink-200 rounded-2xl p-10 text-center"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="text-4xl mb-3">📈</div>
      <p className="text-sm font-semibold text-ink-700">Select a stock</p>
      <p className="text-xs text-ink-400 mt-1">Choose from the list to place an order</p>
    </div>
  );

  return (
    <div className="bg-white border border-ink-200 rounded-2xl"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>

      {/* Stock header */}
      <div className="px-5 py-4 border-b border-ink-100">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-base font-extrabold text-ink-900 tracking-tight">{stock.symbol}</h2>
              {stock.sector && (
                <span className="text-[11px] text-ink-500 bg-ink-100 border border-ink-200 px-2 py-0.5 rounded-full font-medium shrink-0">
                  {stock.sector}
                </span>
              )}
            </div>
            <p className="text-xs text-ink-400">{stock.name}</p>
          </div>
          <button onClick={() => wl.mutate(stock.id)} disabled={wl.isPending}
            className="text-[11px] text-brand-600 border border-brand-200 hover:bg-brand-50 px-2 py-1 rounded-md transition-colors font-semibold bg-white shrink-0">
            ★ Watch
          </button>
        </div>

        {/* Price */}
        <div className="flex items-end gap-3 mb-3">
          <p className={`text-2xl font-black tabular-nums ${up ? 'text-emerald-600' : 'text-red-500'}`}>
            {formatCurrency(livePrice)}
          </p>
          <span className={`inline-flex items-center gap-1 text-xs font-bold mb-0.5
            ${up ? 'text-emerald-600' : 'text-red-500'}`}>
            {up ? '▲' : '▼'} {Math.abs(liveChange ?? 0).toFixed(2)} ({up ? '+' : ''}{liveChangePct?.toFixed(2)}%)
          </span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="border border-ink-200 rounded-xl px-3 py-2">
            <p className="text-[10px] text-ink-400 mb-0.5">Prev Close</p>
            <p className="text-sm font-bold text-ink-900 tabular-nums">{formatCurrency(stock.prevClose)}</p>
          </div>
          <div className="border border-ink-200 rounded-xl px-3 py-2">
            <p className="text-[10px] text-ink-400 mb-0.5">Change</p>
            <p className={`text-sm font-bold tabular-nums ${up ? 'text-emerald-600' : 'text-red-500'}`}>
              {up ? '+' : ''}{liveChange?.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Market closed warning */}
        {marketStatus.open === false && (
          <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700 font-medium">
            <span>🔒</span>
            <span>{marketStatus.reason} — Orders queued for next session</span>
          </div>
        )}
      </div>

      {/* Tab switcher */}
      <div className="grid grid-cols-4 gap-0.5 bg-ink-100 rounded-xl p-1 mx-4 my-3">
        {[['order', 'Order'], ['depth', 'Order Book'], ['info', 'Info'], ['alerts', '🔔']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all
              ${tab === key
                ? 'bg-white text-ink-900 shadow-sm'
                : 'text-ink-400 hover:text-ink-600'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-4 pb-4">
        {tab === 'order' && <OrderForm stock={{ ...stock, currentPrice: livePrice ?? stock.currentPrice }} embedded />}
        {tab === 'depth' && <MarketDepth price={livePrice} />}
        {tab === 'info'  && <StockFundamentals stock={stock} livePrice={livePrice} />}
        {tab === 'alerts' && <PriceAlerts stock={stock} />}
      </div>
    </div>
  );
};

/* ── Main ── */
const TradePage = () => {
  const [searchParams] = useSearchParams();
  const [selectedStock, setSelectedStock] = useState(null);
  const symbolParam = searchParams.get('symbol');

  const { data: stocks = [] } = useQuery({
    queryKey: ['stocks'],
    queryFn: stockService.getAll,
    staleTime: 30_000,
  });

  const { data: stockFromParam } = useQuery({
    queryKey: ['stock', symbolParam],
    queryFn: () => stockService.getBySymbol(symbolParam),
    enabled: !!symbolParam && !selectedStock,
  });

  useEffect(() => {
    if (stockFromParam && !selectedStock) setSelectedStock(stockFromParam);
  }, [stockFromParam]);

  useEffect(() => {
    if (!selectedStock && stocks.length > 0 && !symbolParam) {
      setSelectedStock(stocks[0]);
    }
  }, [stocks]);

  useWebSocket(selectedStock ? [selectedStock.symbol] : []);

  return (
    <div className="p-5 animate-fadeInUp">

      {/* Top bar: search + market status */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <StockSearch onSelect={setSelectedStock} />
        </div>
        <div className="shrink-0 hidden md:block">
          <MarketStatusBanner />
        </div>
      </div>

      {/* Mobile market status */}
      <div className="mb-4 md:hidden">
        <MarketStatusBanner />
      </div>

      {/* 3-column layout */}
      <div className="grid grid-cols-12 gap-4">

        {/* Col 1 — Stock list */}
        <div className="col-span-12 lg:col-span-3">
          {stocks.length > 0
            ? <StockListPanel stocks={stocks} selected={selectedStock} onSelect={setSelectedStock} />
            : <div className="h-96 skeleton rounded-2xl" />
          }
        </div>

        {/* Col 2 — Chart + Order History */}
        <div className="col-span-12 lg:col-span-6 space-y-4">
          {selectedStock
            ? <CandleChart stock={selectedStock} />
            : (
              <div className="bg-white border border-ink-200 rounded-2xl p-16 text-center"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div className="text-5xl mb-3">📊</div>
                <p className="text-sm text-ink-400">Select a stock to view chart</p>
              </div>
            )
          }

          {/* Order History */}
          <Card padding={false}>
            <div className="px-5 pt-4 pb-3 border-b border-ink-100">
              <CardHeader title="Order History" subtitle="All your past orders" />
            </div>
            <OrderHistory />
          </Card>
        </div>

        {/* Col 3 — Right panel */}
        <div className="col-span-12 lg:col-span-3">
          <div className="sticky top-5">
            <RightPanel stock={selectedStock} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default TradePage;
