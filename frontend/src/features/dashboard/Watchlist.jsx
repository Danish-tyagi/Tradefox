import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { stockService } from '../../services/stockService';
import { formatCurrency } from '../../utils/formatCurrency';
import Card, { CardHeader } from '../../components/Card';
import Badge from '../../components/Badge';

const Watchlist = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: watchlist = [], isLoading } = useQuery({
    queryKey: ['watchlist'],
    queryFn: stockService.getWatchlist,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
  const remove = useMutation({ mutationFn: (id) => stockService.removeFromWatchlist(id), onSuccess: () => qc.invalidateQueries(['watchlist']) });

  if (isLoading) return (
    <Card><CardHeader title="Watchlist" />
      <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-10 skeleton rounded-xl" />)}</div>
    </Card>
  );

  return (
    <Card padding={false}>
      <div className="px-5 pt-5 pb-3"><CardHeader title="Watchlist" subtitle={`${watchlist.length} stocks`} /></div>
      {watchlist.length === 0 ? (
        <p className="text-sm text-ink-400 text-center py-8">No stocks added. Go to Trade page to add.</p>
      ) : (
        <ul className="divide-y divide-ink-100">
          {watchlist.map((stock) => {
            const up = stock.change >= 0;
            return (
              <li key={stock.id} onClick={() => navigate(`/trade?symbol=${stock.symbol}`)}
                className="flex items-center justify-between px-5 py-3 hover:bg-ink-50 transition-colors cursor-pointer group">
                <div>
                  <p className="text-sm font-semibold text-ink-800">{stock.symbol}</p>
                  <p className="text-xs text-ink-400 truncate max-w-[120px]">{stock.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-ink-800 tabular-nums">{formatCurrency(stock.currentPrice)}</p>
                    <Badge variant={up ? 'success' : 'danger'}>{up ? '+' : ''}{stock.changePercent?.toFixed(2)}%</Badge>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); remove.mutate(stock.id); }}
                    className="text-ink-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-xl leading-none">×</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};

export default Watchlist;
