import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import PortfolioSummary from './PortfolioSummary';
import Watchlist from './Watchlist';
import { orderService } from '../../services/orderService';
import { stockService } from '../../services/stockService';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';
import Card, { CardHeader } from '../../components/Card';
import Badge from '../../components/Badge';
import { useAuth } from '../../hooks/useAuth';
import useWebSocket from '../../hooks/useWebSocket';

const statusVariant = { FILLED: 'success', PENDING: 'warning', CANCELLED: 'danger', REJECTED: 'danger' };

/* ── Scrolling market ticker ── */
const MarketTicker = ({ stocks }) => {
  const items = [...stocks, ...stocks];
  return (
    <div className="bg-ink-900 rounded-2xl overflow-hidden mb-5">
      <div className="overflow-hidden py-2.5 px-2">
        <div className="flex gap-8 whitespace-nowrap"
          style={{ animation: 'tickerScroll 35s linear infinite' }}>
          {items.map((s, i) => {
            const up = s.change >= 0;
            return (
              <span key={i} className="inline-flex items-center gap-2 text-xs shrink-0">
                <span className="font-bold text-white">{s.symbol}</span>
                <span className="text-ink-300 tabular-nums">₹{s.currentPrice?.toLocaleString('en-IN')}</span>
                <span className={`font-semibold tabular-nums ${up ? 'text-emerald-400' : 'text-red-400'}`}>
                  {up ? '▲' : '▼'} {Math.abs(s.changePercent ?? 0).toFixed(2)}%
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ── Market overview card ── */
const MarketOverview = ({ stocks }) => {
  const navigate = useNavigate();
  const gainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  const losers  = [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {[
        { title: 'Top Gainers', data: gainers, up: true },
        { title: 'Top Losers',  data: losers,  up: false },
      ].map(({ title, data, up }) => (
        <Card key={title} padding={false}>
          <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-ink-100">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${up ? 'text-up' : 'text-down'}`}>{up ? '▲' : '▼'}</span>
              <span className="text-sm font-semibold text-ink-800">{title}</span>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-up font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-up animate-pulse" /> Live
            </span>
          </div>
          <ul className="divide-y divide-ink-100">
            {data.map((s) => {
              const isUp = s.change >= 0;
              return (
                <li key={s.id}
                  onClick={() => navigate(`/trade?symbol=${s.symbol}`)}
                  className="flex items-center justify-between px-5 py-3 hover:bg-ink-50 transition-colors cursor-pointer">
                  <div>
                    <p className="text-sm font-bold text-ink-800">{s.symbol}</p>
                    <p className="text-xs text-ink-400 truncate max-w-[120px]">{s.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-ink-700 tabular-nums">
                      ₹{s.currentPrice?.toLocaleString('en-IN')}
                    </p>
                    <span className={`text-xs font-bold tabular-nums ${isUp ? 'text-up' : 'text-down'}`}>
                      {isUp ? '+' : ''}{s.changePercent?.toFixed(2)}%
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="px-5 py-3 border-t border-ink-100">
            <button onClick={() => navigate('/trade')}
              className="text-xs text-brand-500 hover:text-brand-600 font-semibold transition-colors">
              View all stocks →
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
};

/* ── All stocks mini table ── */
const AllStocksTable = ({ stocks }) => {
  const navigate = useNavigate();
  return (
    <Card padding={false}>
      <div className="px-5 pt-4 pb-3 border-b border-ink-100 flex items-center justify-between">
        <CardHeader title="All Stocks" subtitle={`${stocks.length} stocks available`} />
        <button onClick={() => navigate('/trade')}
          className="text-xs text-brand-500 hover:text-brand-600 font-semibold -mt-4">
          Trade →
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-100">
              {['Stock', 'Price', 'Change', 'Sector'].map(h => (
                <th key={h} className="text-left py-2.5 px-4 text-xs font-semibold text-ink-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stocks.slice(0, 8).map((s) => {
              const up = s.change >= 0;
              return (
                <tr key={s.id} onClick={() => navigate(`/trade?symbol=${s.symbol}`)}
                  className="border-b border-ink-100 hover:bg-ink-50 transition-colors cursor-pointer">
                  <td className="py-3 px-4">
                    <p className="font-bold text-ink-800">{s.symbol}</p>
                    <p className="text-xs text-ink-400 truncate max-w-[120px]">{s.name}</p>
                  </td>
                  <td className="py-3 px-4 font-semibold text-ink-800 tabular-nums">
                    ₹{s.currentPrice?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-sm font-bold tabular-nums ${up ? 'text-up' : 'text-down'}`}>
                      {up ? '+' : ''}{s.changePercent?.toFixed(2)}%
                    </span>
                    <p className={`text-xs tabular-nums ${up ? 'text-up' : 'text-down'}`}>
                      {up ? '+' : ''}₹{Math.abs(s.change ?? 0).toFixed(2)}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    {s.sector
                      ? <span className="text-xs bg-ink-100 text-ink-600 px-2 py-0.5 rounded-full font-medium">{s.sector}</span>
                      : <span className="text-xs text-ink-300">—</span>
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

/* ── Recent orders ── */
const RecentOrders = () => {
  const { data: orders = [], isLoading } = useQuery({ queryKey: ['orders'], queryFn: orderService.getHistory });
  return (
    <Card padding={false}>
      <div className="px-5 pt-5 pb-3 border-b border-ink-100">
        <CardHeader title="Recent Orders" subtitle="Last 5 trades" />
      </div>
      {isLoading ? (
        <div className="px-5 py-4 space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-10 skeleton rounded-xl" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-3xl mb-2">📋</div>
          <p className="text-sm font-semibold text-ink-600">Koi order nahi abhi tak</p>
          <p className="text-xs text-ink-400 mt-1 mb-4">Apna pehla trade place karo aur yahan dekho</p>
          <a href="/trade"
            className="inline-block px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-colors">
            Trade karo →
          </a>
        </div>
      ) : (
        <ul className="divide-y divide-ink-100">
          {orders.slice(0, 5).map((o) => (
            <li key={o.id} className="flex items-center justify-between px-5 py-3 hover:bg-ink-50 transition-colors">
              <div className="flex items-center gap-3">
                <Badge variant={o.side === 'BUY' ? 'success' : 'danger'}>{o.side}</Badge>
                <div>
                  <p className="text-sm font-semibold text-ink-800">{o.stock.symbol} × {o.quantity}</p>
                  <p className="text-xs text-ink-400">{formatDateTime(o.createdAt)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-ink-700 tabular-nums">{formatCurrency(o.price * o.quantity)}</p>
                <Badge variant={statusVariant[o.status]}>{o.status}</Badge>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

/* ── Main Dashboard ── */
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';

  // Subscribe to ALL stock price updates
  useWebSocket([]);

  const { data: stocks = [] } = useQuery({
    queryKey: ['stocks'],
    queryFn: stockService.getAll,
    staleTime: 30_000,
  });

  return (
    <div className="p-6 space-y-5 animate-fadeInUp">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink-900">{greeting}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-sm text-ink-400 mt-0.5">Here's your market & portfolio overview</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/trade')}
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
            + New Trade
          </button>
          <button onClick={() => navigate('/portfolio')}
            className="px-4 py-2 bg-white hover:bg-ink-50 text-ink-700 text-sm font-semibold rounded-xl border border-ink-200 transition-colors shadow-sm">
            Portfolio
          </button>
        </div>
      </div>

      {/* Portfolio stats */}
      <PortfolioSummary />

      {/* Live ticker */}
      {stocks.length > 0 && <MarketTicker stocks={stocks} />}

      {/* Market overview — gainers + losers */}
      {stocks.length > 0 && <MarketOverview stocks={stocks} />}

      {/* All stocks table + right column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          {stocks.length > 0
            ? <AllStocksTable stocks={stocks} />
            : <div className="h-48 skeleton rounded-2xl" />
          }
        </div>
        <div className="space-y-5">
          <RecentOrders />
        </div>
      </div>

      {/* Watchlist */}
      <Watchlist />
    </div>
  );
};

export default Dashboard;
