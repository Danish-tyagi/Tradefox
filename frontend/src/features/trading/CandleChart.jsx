import { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries, HistogramSeries, LineSeries } from 'lightweight-charts';
import { useQuery } from '@tanstack/react-query';
import { chartService } from '../../services/chartService';

const INTERVALS = [
  { label: '1m',  value: '1m' },
  { label: '5m',  value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1H',  value: '1h' },
  { label: '1D',  value: '1d' },
];

/* ── RSI calculation ── */
const calcRSI = (candles, period = 14) => {
  if (candles.length < period + 1) return [];
  const closes = candles.map(c => c.close);
  const result = [];
  let avgGain = 0, avgLoss = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) avgGain += diff; else avgLoss += Math.abs(diff);
  }
  avgGain /= period;
  avgLoss /= period;

  for (let i = period; i < closes.length; i++) {
    if (i > period) {
      const diff = closes[i] - closes[i - 1];
      avgGain = (avgGain * (period - 1) + Math.max(diff, 0)) / period;
      avgLoss = (avgLoss * (period - 1) + Math.max(-diff, 0)) / period;
    }
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push({ time: candles[i].time, value: parseFloat((100 - 100 / (1 + rs)).toFixed(2)) });
  }
  return result;
};

/* ── EMA calculation ── */
const calcEMA = (candles, period) => {
  if (candles.length < period) return [];
  const k = 2 / (period + 1);
  const result = [];
  let ema = candles.slice(0, period).reduce((s, c) => s + c.close, 0) / period;
  result.push({ time: candles[period - 1].time, value: parseFloat(ema.toFixed(2)) });
  for (let i = period; i < candles.length; i++) {
    ema = candles[i].close * k + ema * (1 - k);
    result.push({ time: candles[i].time, value: parseFloat(ema.toFixed(2)) });
  }
  return result;
};

/* ── MACD calculation ── */
const calcMACD = (candles) => {
  const ema12 = calcEMA(candles, 12);
  const ema26 = calcEMA(candles, 26);
  if (!ema12.length || !ema26.length) return { macd: [], signal: [], histogram: [] };

  // Align by time
  const ema26Map = Object.fromEntries(ema26.map(e => [e.time, e.value]));
  const macdLine = ema12
    .filter(e => ema26Map[e.time] !== undefined)
    .map(e => ({ time: e.time, value: parseFloat((e.value - ema26Map[e.time]).toFixed(2)) }));

  // Signal = 9-period EMA of MACD
  const k = 2 / 10;
  const signal = [];
  if (macdLine.length >= 9) {
    let sig = macdLine.slice(0, 9).reduce((s, m) => s + m.value, 0) / 9;
    signal.push({ time: macdLine[8].time, value: parseFloat(sig.toFixed(2)) });
    for (let i = 9; i < macdLine.length; i++) {
      sig = macdLine[i].value * k + sig * (1 - k);
      signal.push({ time: macdLine[i].time, value: parseFloat(sig.toFixed(2)) });
    }
  }

  const sigMap = Object.fromEntries(signal.map(s => [s.time, s.value]));
  const histogram = macdLine
    .filter(m => sigMap[m.time] !== undefined)
    .map(m => ({
      time: m.time,
      value: parseFloat((m.value - sigMap[m.time]).toFixed(2)),
      color: m.value >= sigMap[m.time] ? 'rgba(5,150,105,0.7)' : 'rgba(220,38,38,0.7)',
    }));

  return { macd: macdLine, signal, histogram };
};

const CandleChart = ({ stock }) => {
  const containerRef = useRef(null);
  const chartRef     = useRef(null);
  const candleRef    = useRef(null);
  const volumeRef    = useRef(null);
  const rsiChartRef  = useRef(null);
  const rsiSeriesRef = useRef(null);
  const rsiContRef   = useRef(null);
  const macdChartRef = useRef(null);
  const macdLineRef  = useRef(null);
  const macdSigRef   = useRef(null);
  const macdHistRef  = useRef(null);
  const macdContRef  = useRef(null);
  const [tf, setTf]  = useState('5m');
  const [indicator, setIndicator] = useState('none'); // 'none' | 'rsi' | 'macd'

  const { data, isLoading } = useQuery({
    queryKey: ['candles', stock?.symbol, tf],
    queryFn: () => chartService.getCandles(stock.symbol, tf),
    enabled: !!stock?.symbol,
    staleTime: 30_000,
  });

  // Init chart once on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 380,
      layout: {
        background: { color: '#ffffff' },
        textColor: '#64748b',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#f1f5f9' },
        horzLines: { color: '#f1f5f9' },
      },
      crosshair: {
        mode: 1,
        vertLine: { color: '#FF6B00', width: 1, style: 2, labelBackgroundColor: '#FF6B00' },
        horzLine: { color: '#FF6B00', width: 1, style: 2, labelBackgroundColor: '#FF6B00' },
      },
      rightPriceScale: {
        borderColor: '#e2e8f0',
        scaleMargins: { top: 0.1, bottom: 0.25 },
      },
      timeScale: {
        borderColor: '#e2e8f0',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor:         '#059669',
      downColor:       '#dc2626',
      borderUpColor:   '#059669',
      borderDownColor: '#dc2626',
      wickUpColor:     '#059669',
      wickDownColor:   '#dc2626',
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });
    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    chartRef.current  = chart;
    candleRef.current = candleSeries;
    volumeRef.current = volumeSeries;

    const ro = new ResizeObserver(() => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current  = null;
      candleRef.current = null;
      volumeRef.current = null;
    };
  }, []);

  // Init RSI sub-chart
  useEffect(() => {
    if (indicator !== 'rsi' || !rsiContRef.current) return;
    const chart = createChart(rsiContRef.current, {
      width: rsiContRef.current.clientWidth,
      height: 120,
      layout: { background: { color: '#fff' }, textColor: '#64748b', fontSize: 10 },
      grid: { vertLines: { color: '#f1f5f9' }, horzLines: { color: '#f1f5f9' } },
      rightPriceScale: { borderColor: '#e2e8f0', scaleMargins: { top: 0.1, bottom: 0.1 } },
      timeScale: { borderColor: '#e2e8f0', timeVisible: true, secondsVisible: false },
      crosshair: { mode: 1 },
    });
    const rsiSeries = chart.addSeries(LineSeries, { color: '#8b5cf6', lineWidth: 1.5, priceLineVisible: false });
    rsiChartRef.current = chart;
    rsiSeriesRef.current = rsiSeries;
    const ro = new ResizeObserver(() => {
      if (rsiContRef.current) chart.applyOptions({ width: rsiContRef.current.clientWidth });
    });
    ro.observe(rsiContRef.current);
    return () => { ro.disconnect(); chart.remove(); rsiChartRef.current = null; rsiSeriesRef.current = null; };
  }, [indicator]);

  // Init MACD sub-chart
  useEffect(() => {
    if (indicator !== 'macd' || !macdContRef.current) return;
    const chart = createChart(macdContRef.current, {
      width: macdContRef.current.clientWidth,
      height: 120,
      layout: { background: { color: '#fff' }, textColor: '#64748b', fontSize: 10 },
      grid: { vertLines: { color: '#f1f5f9' }, horzLines: { color: '#f1f5f9' } },
      rightPriceScale: { borderColor: '#e2e8f0', scaleMargins: { top: 0.1, bottom: 0.1 } },
      timeScale: { borderColor: '#e2e8f0', timeVisible: true, secondsVisible: false },
      crosshair: { mode: 1 },
    });
    const macdLine = chart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 1.5, priceLineVisible: false });
    const macdSig  = chart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 1.5, priceLineVisible: false });
    const macdHist = chart.addSeries(HistogramSeries, { priceScaleId: 'right', priceLineVisible: false });
    macdChartRef.current = chart;
    macdLineRef.current  = macdLine;
    macdSigRef.current   = macdSig;
    macdHistRef.current  = macdHist;
    const ro = new ResizeObserver(() => {
      if (macdContRef.current) chart.applyOptions({ width: macdContRef.current.clientWidth });
    });
    ro.observe(macdContRef.current);
    return () => { ro.disconnect(); chart.remove(); macdChartRef.current = null; };
  }, [indicator]);

  // Update data
  useEffect(() => {
    if (!data?.candles?.length || !candleRef.current || !volumeRef.current) return;
    try {
      candleRef.current.setData(
        data.candles.map(c => ({ time: c.time, open: c.open, high: c.high, low: c.low, close: c.close }))
      );
      volumeRef.current.setData(
        data.candles.map(c => ({
          time: c.time,
          value: c.volume,
          color: c.close >= c.open ? 'rgba(5,150,105,0.25)' : 'rgba(220,38,38,0.25)',
        }))
      );
      chartRef.current?.timeScale().fitContent();

      // RSI
      if (indicator === 'rsi' && rsiSeriesRef.current) {
        const rsiData = calcRSI(data.candles);
        rsiSeriesRef.current.setData(rsiData);
        rsiChartRef.current?.timeScale().fitContent();
      }

      // MACD
      if (indicator === 'macd' && macdLineRef.current) {
        const { macd, signal, histogram } = calcMACD(data.candles);
        macdLineRef.current.setData(macd);
        macdSigRef.current.setData(signal);
        macdHistRef.current.setData(histogram);
        macdChartRef.current?.timeScale().fitContent();
      }
    } catch (e) {
      console.error('Chart update error:', e);
    }
  }, [data, indicator]);

  if (!stock) return null;

  const last = data?.candles?.[data.candles.length - 1];
  const isUp = last ? last.close >= last.open : true;

  return (
    <div className="bg-white border border-ink-200 rounded-2xl card-shadow overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-ink-100">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-ink-900">{stock.symbol}</span>
          {last && (
            <>
              <span className={`text-sm font-bold tabular-nums ${isUp ? 'text-up' : 'text-down'}`}>
                ₹{last.close?.toLocaleString('en-IN')}
              </span>
              <span className={`text-xs font-semibold ${isUp ? 'text-up' : 'text-down'}`}>
                {isUp ? '▲' : '▼'} {Math.abs(((last.close - last.open) / last.open) * 100).toFixed(2)}%
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Indicator selector */}
          <div className="flex items-center gap-0.5 bg-ink-50 rounded-lg p-0.5">
            {[['none', 'None'], ['rsi', 'RSI'], ['macd', 'MACD']].map(([key, label]) => (
              <button key={key} onClick={() => setIndicator(key)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all
                  ${indicator === key
                    ? 'bg-white text-purple-600 shadow-sm border border-ink-200'
                    : 'text-ink-500 hover:text-ink-800'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Timeframe selector */}
          <div className="flex items-center gap-0.5 bg-ink-50 rounded-lg p-0.5">
            {INTERVALS.map(({ label, value }) => (
              <button key={value} onClick={() => setTf(value)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all
                  ${tf === value
                    ? 'bg-white text-brand-600 shadow-sm border border-ink-200'
                    : 'text-ink-500 hover:text-ink-800'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart container */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
            <div className="flex items-center gap-2 text-sm text-ink-400">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Loading chart...
            </div>
          </div>
        )}
        <div ref={containerRef} />
      </div>

      {/* RSI sub-chart */}
      {indicator === 'rsi' && (
        <div className="border-t border-ink-100">
          <div className="flex items-center gap-2 px-5 py-1.5 bg-ink-50">
            <span className="text-[11px] font-bold text-purple-600">RSI (14)</span>
            <span className="text-[10px] text-ink-400">Overbought: 70 · Oversold: 30</span>
          </div>
          <div ref={rsiContRef} />
        </div>
      )}

      {/* MACD sub-chart */}
      {indicator === 'macd' && (
        <div className="border-t border-ink-100">
          <div className="flex items-center gap-3 px-5 py-1.5 bg-ink-50">
            <span className="text-[11px] font-bold text-blue-600">MACD (12,26,9)</span>
            <span className="flex items-center gap-1 text-[10px]"><span className="w-3 h-0.5 bg-blue-500 inline-block" /> MACD</span>
            <span className="flex items-center gap-1 text-[10px]"><span className="w-3 h-0.5 bg-amber-500 inline-block" /> Signal</span>
          </div>
          <div ref={macdContRef} />
        </div>
      )}

      {/* OHLC bar */}
      {last && (
        <div className="flex items-center gap-5 px-5 py-2.5 border-t border-ink-100 bg-ink-50 text-xs tabular-nums">
          {[
            { label: 'O', value: last.open,  color: 'text-ink-700' },
            { label: 'H', value: last.high,  color: 'text-up' },
            { label: 'L', value: last.low,   color: 'text-down' },
            { label: 'C', value: last.close, color: isUp ? 'text-up' : 'text-down' },
          ].map(({ label, value, color }) => (
            <span key={label} className="flex items-center gap-1">
              <span className="text-ink-400 font-medium">{label}</span>
              <span className={`font-bold ${color}`}>₹{value?.toLocaleString('en-IN')}</span>
            </span>
          ))}
          <span className="ml-auto text-ink-400">Vol: {last.volume?.toLocaleString('en-IN')}</span>
        </div>
      )}

      {/* Candle legend for beginners */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-2 border-t border-ink-100 bg-white text-[10px] text-ink-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-4 bg-emerald-500 rounded-sm" />
          <span>Green candle — price upar gayi (close &gt; open)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-4 bg-red-500 rounded-sm" />
          <span>Red candle — price neeche gayi (close &lt; open)</span>
        </span>
        <span className="flex items-center gap-1.5 ml-auto">
          <span className="text-ink-400">O=Open · H=High · L=Low · C=Close</span>
        </span>
      </div>
    </div>
  );
};

export default CandleChart;
