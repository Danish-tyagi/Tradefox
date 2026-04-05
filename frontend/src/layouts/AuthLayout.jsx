import { Outlet, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/tradefox-logo.svg';
import { stockService } from '../services/stockService';

const AuthLayout = ({ children }) => {
  const [stocks, setStocks] = useState([]);
  useEffect(() => { stockService.getPublic().then(setStocks).catch(() => {}); }, []);

  const gainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  const losers  = [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);

  return (
    <div className="min-h-screen bg-ink-50 flex">
      {/* Form side */}
      <div className="w-full lg:w-[460px] shrink-0 flex flex-col justify-center px-8 py-10 bg-white border-r border-ink-200 card-shadow relative">
        <div className="relative z-10 flex items-center justify-between mb-10">
          <Link to="/"><img src={logo} alt="TradeFox" className="h-8" /></Link>
          <Link to="/" className="text-xs text-ink-400 hover:text-ink-700 transition-colors">← Back to home</Link>
        </div>
        <div className="relative z-10 w-full max-w-sm mx-auto">{children || <Outlet />}</div>
        <p className="relative z-10 text-center text-xs text-ink-300 mt-8">Virtual trading only — no real money involved</p>
      </div>

      {/* Market data side */}
      <div className="hidden lg:flex flex-col flex-1 px-10 py-10 overflow-hidden">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-up animate-pulse" />
            <span className="text-xs text-up font-semibold uppercase tracking-wider">Live Market</span>
          </div>
          <h2 className="text-2xl font-bold text-ink-900">Today's Market</h2>
          <p className="text-ink-400 text-sm mt-1">Real NSE/BSE prices</p>
        </div>

        {stocks.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center"><div className="text-5xl mb-4">📡</div><p className="text-ink-400 text-sm">Start the backend to see live data</p></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 flex-1">
            {/* Gainers */}
            <div className="bg-white border border-ink-200 rounded-2xl overflow-hidden card-shadow">
              <div className="px-4 py-3 border-b border-ink-100 flex items-center gap-2">
                <span className="text-up text-sm font-bold">▲</span>
                <span className="text-sm font-semibold text-ink-800">Top Gainers</span>
              </div>
              <div className="divide-y divide-ink-100">
                {gainers.map((s) => (
                  <div key={s.id} className="flex items-center justify-between px-4 py-3 hover:bg-ink-50 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-ink-800">{s.symbol}</p>
                      <p className="text-xs text-ink-400 truncate max-w-[90px]">{s.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-ink-700 tabular-nums">₹{s.currentPrice?.toLocaleString('en-IN')}</p>
                      <p className="text-xs font-bold text-up tabular-nums">+{s.changePercent?.toFixed(2)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Losers */}
            <div className="bg-white border border-ink-200 rounded-2xl overflow-hidden card-shadow">
              <div className="px-4 py-3 border-b border-ink-100 flex items-center gap-2">
                <span className="text-down text-sm font-bold">▼</span>
                <span className="text-sm font-semibold text-ink-800">Top Losers</span>
              </div>
              <div className="divide-y divide-ink-100">
                {losers.map((s) => (
                  <div key={s.id} className="flex items-center justify-between px-4 py-3 hover:bg-ink-50 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-ink-800">{s.symbol}</p>
                      <p className="text-xs text-ink-400 truncate max-w-[90px]">{s.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-ink-700 tabular-nums">₹{s.currentPrice?.toLocaleString('en-IN')}</p>
                      <p className="text-xs font-bold text-down tabular-nums">{s.changePercent?.toFixed(2)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* All stocks */}
            <div className="col-span-2 bg-white border border-ink-200 rounded-2xl overflow-hidden card-shadow">
              <div className="px-4 py-3 border-b border-ink-100">
                <span className="text-sm font-semibold text-ink-800">All Stocks</span>
              </div>
              <div className="grid grid-cols-2 divide-x divide-ink-100">
                {stocks.slice(0, 10).map((s) => {
                  const up = s.change >= 0;
                  return (
                    <div key={s.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-ink-50 transition-colors border-b border-ink-100">
                      <div>
                        <p className="text-xs font-bold text-ink-800">{s.symbol}</p>
                        <p className="text-xs text-ink-400 truncate max-w-[80px]">{s.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-ink-700 tabular-nums">₹{s.currentPrice?.toLocaleString('en-IN')}</p>
                        <p className={`text-xs font-bold tabular-nums ${up ? 'text-up' : 'text-down'}`}>{up ? '+' : ''}{s.changePercent?.toFixed(2)}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        <p className="mt-6 text-center text-sm text-ink-400">Practice with <span className="text-brand-500 font-semibold">₹1,00,000</span> virtual balance. Real prices, zero risk.</p>
      </div>
    </div>
  );
};

export default AuthLayout;
