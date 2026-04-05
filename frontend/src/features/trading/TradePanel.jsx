import { useMutation, useQueryClient } from '@tanstack/react-query';
import { stockService } from '../../services/stockService';
import { formatCurrency } from '../../utils/formatCurrency';
import useStockPrice from '../../hooks/useStockPrice';
import Badge from '../../components/Badge';
import { useToast } from '../../components/Toast';

const TradePanel = ({ stock }) => {
  const qc = useQueryClient();
  const toast = useToast();
  const { price, change, changePercent } = useStockPrice(stock?.symbol);
  const livePrice = price ?? stock?.currentPrice;
  const liveChange = change ?? stock?.change;
  const liveChangePct = changePercent ?? stock?.changePercent;
  const up = (liveChange ?? 0) >= 0;

  const wl = useMutation({
    mutationFn: (id) => stockService.addToWatchlist(id),
    onSuccess: () => {
      qc.invalidateQueries(['watchlist']);
      toast.success(`${stock?.symbol} added to your watchlist`, 'Added to Watchlist');
    },
    onError: () => toast.info(`${stock?.symbol} is already in your watchlist`),
  });

  if (!stock) return (
    <div className="bg-white border border-ink-200 rounded-2xl p-12 text-center card-shadow">
      <div className="text-5xl mb-3">📊</div>
      <p className="text-ink-400 text-sm">Search and select a stock to start trading</p>
    </div>
  );

  return (
    <div className="bg-white border border-ink-200 rounded-2xl p-5 card-shadow">
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-extrabold text-ink-900">{stock.symbol}</h2>
            {stock.sector && <span className="text-xs text-ink-500 bg-ink-100 border border-ink-200 px-2 py-0.5 rounded-full">{stock.sector}</span>}
          </div>
          <p className="text-sm text-ink-500">{stock.name}</p>
        </div>
        <button onClick={() => wl.mutate(stock.id)} disabled={wl.isPending}
          className="flex items-center gap-1.5 text-xs text-brand-600 border border-brand-200 hover:bg-brand-50 px-3 py-1.5 rounded-lg transition-colors font-semibold bg-white">
          ★ Watchlist
        </button>
      </div>

      <div className="flex items-end gap-3 mb-5">
        <span className={`text-4xl font-black tabular-nums ${up ? 'text-up' : 'text-down'}`}>{formatCurrency(livePrice)}</span>
        <div className="mb-1">
          <Badge variant={up ? 'success' : 'danger'}>
            {up ? '▲' : '▼'} {Math.abs(liveChange ?? 0).toFixed(2)} ({up ? '+' : ''}{liveChangePct?.toFixed(2)}%)
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-ink-50 border border-ink-200 rounded-xl px-3 py-2.5">
          <p className="text-xs text-ink-400 mb-0.5">Prev Close</p>
          <p className="font-semibold text-ink-800 tabular-nums text-sm">{formatCurrency(stock.prevClose)}</p>
        </div>
        <div className="bg-ink-50 border border-ink-200 rounded-xl px-3 py-2.5">
          <p className="text-xs text-ink-400 mb-0.5">Change</p>
          <p className={`font-semibold tabular-nums text-sm ${up ? 'text-up' : 'text-down'}`}>{up ? '+' : ''}{liveChange?.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default TradePanel;
