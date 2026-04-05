import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertService } from '../../services/alertService';
import { formatCurrency } from '../../utils/formatCurrency';
import { useToast } from '../../components/Toast';

const PriceAlerts = ({ stock }) => {
  const qc = useQueryClient();
  const toast = useToast();
  const [condition, setCondition] = useState('ABOVE');
  const [targetPrice, setTargetPrice] = useState(stock?.currentPrice?.toFixed(2) || '');

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: alertService.getAll,
  });

  const create = useMutation({
    mutationFn: alertService.create,
    onSuccess: () => {
      qc.invalidateQueries(['alerts']);
      toast.success(`Alert set for ${stock?.symbol}`, 'Alert Created');
      setTargetPrice('');
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to create alert', 'Error'),
  });

  const remove = useMutation({
    mutationFn: alertService.delete,
    onSuccess: () => {
      qc.invalidateQueries(['alerts']);
      toast.success('Alert removed', 'Deleted');
    },
  });

  const stockAlerts = alerts.filter(a => !a.triggered);

  return (
    <div className="space-y-3">
      {/* Create alert form */}
      {stock && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide">
            Set Alert — {stock.symbol}
          </p>

          {/* Condition select */}
          <div className="flex gap-0.5 bg-ink-100 rounded-xl p-1">
            {[['ABOVE', '▲ Above'], ['BELOW', '▼ Below']].map(([val, label]) => (
              <button key={val} type="button" onClick={() => setCondition(val)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all
                  ${condition === val
                    ? val === 'ABOVE'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-red-500 text-white shadow-sm'
                    : 'text-ink-400 hover:text-ink-700'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Target price input */}
          <div>
            <label className="block text-xs font-semibold text-ink-600 mb-1.5">
              Target Price (₹)
            </label>
            <input
              type="number"
              step="0.05"
              value={targetPrice}
              onChange={e => setTargetPrice(e.target.value)}
              placeholder={stock?.currentPrice?.toFixed(2)}
              className="w-full bg-white border border-ink-200 rounded-xl px-4 py-3 text-sm text-ink-800
                focus:outline-none focus:ring-2 focus:ring-ink-300 focus:border-ink-400 tabular-nums transition-all"
            />
          </div>

          {/* Submit */}
          <button
            onClick={() => create.mutate({ stockId: stock.id, condition, targetPrice })}
            disabled={!targetPrice || create.isPending}
            className={`w-full py-3 text-xs font-bold rounded-xl transition-all disabled:opacity-50 text-white
              ${condition === 'ABOVE'
                ? 'bg-emerald-500 hover:bg-emerald-600 shadow-[0_4px_12px_rgba(5,150,105,0.25)]'
                : 'bg-red-500 hover:bg-red-600 shadow-[0_4px_12px_rgba(220,38,38,0.25)]'}`}
          >
            {create.isPending ? 'Setting...' : `+ Set ${condition === 'ABOVE' ? 'Above' : 'Below'} Alert`}
          </button>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-ink-100 pt-3">
        <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-2">Active Alerts</p>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => <div key={i} className="h-12 skeleton rounded-xl" />)}
          </div>
        ) : stockAlerts.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-2xl mb-1">🔔</div>
            <p className="text-xs text-ink-400">No active alerts</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {stockAlerts.map(alert => {
              const isAbove = alert.condition === 'ABOVE';
              return (
                <li key={alert.id}
                  className="flex items-center justify-between bg-ink-50 border border-ink-200 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0
                      ${isAbove ? 'bg-emerald-500' : 'bg-red-500'}`}>
                      {isAbove ? '▲' : '▼'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-ink-800">{alert.stock.symbol}</p>
                      <p className="text-xs text-ink-500 tabular-nums">
                        {isAbove ? 'Above' : 'Below'} {formatCurrency(alert.targetPrice)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => remove.mutate(alert.id)}
                    disabled={remove.isPending}
                    className="w-6 h-6 flex items-center justify-center text-ink-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors text-base leading-none"
                  >
                    ×
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PriceAlerts;
