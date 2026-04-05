import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, createColumnHelper } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { orderService } from '../../services/orderService';
import { formatCurrency } from '../../utils/formatCurrency';
import { useToast } from '../../components/Toast';

const col = createColumnHelper();

/* ── Modify Order Modal ── */
const ModifyModal = ({ order, onClose }) => {
  const [price, setPrice] = useState(order.price);
  const [triggerPrice, setTriggerPrice] = useState(order.triggerPrice || '');
  const [quantity, setQuantity] = useState(order.quantity);
  const qc = useQueryClient();
  const toast = useToast();

  const modify = useMutation({
    mutationFn: (data) => orderService.modify(order.id, data),
    onSuccess: () => {
      qc.invalidateQueries(['orders']);
      toast.success('Order modified successfully', 'Modified');
      onClose();
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Could not modify order', 'Error'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 animate-fadeInUp">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-ink-900">Modify Order — {order.stock?.symbol}</h3>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700 text-lg leading-none">×</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-ink-600 mb-1">Quantity</label>
            <input type="number" min={1} value={quantity} onChange={e => setQuantity(parseInt(e.target.value))}
              className="w-full border border-ink-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 tabular-nums" />
          </div>

          {order.type !== 'MARKET' && (
            <div>
              <label className="block text-xs font-semibold text-ink-600 mb-1">
                {order.type === 'LIMIT' ? 'Limit Price (₹)' : 'Limit Price (₹)'}
              </label>
              <input type="number" step="0.05" value={price} onChange={e => setPrice(e.target.value)}
                className="w-full border border-ink-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 tabular-nums" />
            </div>
          )}

          {(order.type === 'SL' || order.type === 'SLM') && (
            <div>
              <label className="block text-xs font-semibold text-ink-600 mb-1">Trigger Price (₹)</label>
              <input type="number" step="0.05" value={triggerPrice} onChange={e => setTriggerPrice(e.target.value)}
                className="w-full border border-orange-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 tabular-nums" />
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold border border-ink-200 rounded-xl text-ink-600 hover:bg-ink-50 transition-colors">
            Cancel
          </button>
          <button onClick={() => modify.mutate({ price: parseFloat(price), triggerPrice: triggerPrice ? parseFloat(triggerPrice) : undefined, quantity })}
            disabled={modify.isPending}
            className="flex-1 py-2.5 text-sm font-bold bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors disabled:opacity-50">
            {modify.isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderHistory = () => {
  const qc = useQueryClient();
  const toast = useToast();
  const [modifyOrder, setModifyOrder] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: orderService.getHistory,
  });

  const cancel = useMutation({
    mutationFn: (id) => orderService.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries(['orders']);
      toast.success('Order cancelled successfully', 'Cancelled');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Could not cancel order', 'Error');
    },
  });

  const columns = useMemo(() => [
    col.accessor('stock.symbol', {
      header: 'Symbol',
      cell: i => <span className="font-bold text-ink-900">{i.getValue()}</span>,
    }),
    col.accessor('side', {
      header: 'Side',
      cell: i => (
        <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${i.getValue() === 'BUY' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
          {i.getValue()}
        </span>
      ),
    }),
    col.accessor('type', {
      header: 'Type',
      cell: i => <span className="text-ink-500 text-xs">{i.getValue()}</span>,
    }),
    col.accessor('quantity', {
      header: 'Qty',
      cell: i => <span className="tabular-nums text-ink-700">{i.getValue()}</span>,
    }),
    col.accessor('price', {
      header: 'Price',
      cell: i => <span className="tabular-nums text-ink-700">{formatCurrency(i.getValue())}</span>,
    }),
    col.accessor('status', {
      header: 'Status',
      cell: i => {
        const v = i.getValue();
        const cls = v === 'FILLED'
          ? 'bg-emerald-50 text-emerald-700'
          : v === 'PENDING'
          ? 'bg-amber-50 text-amber-700'
          : 'bg-red-50 text-red-600';
        return <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${cls}`}>{v}</span>;
      },
    }),
    col.accessor('createdAt', {
      header: 'Time',
      cell: i => (
        <span className="text-ink-400 text-xs tabular-nums">
          {new Date(i.getValue()).toLocaleTimeString('en-IN', { hour12: true, hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
    }),
    col.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const order = row.original;
        if (order.status !== 'PENDING') return null;
        return (
          <div className="flex items-center gap-1.5">
            {order.type !== 'MARKET' && (
              <button
                onClick={() => setModifyOrder(order)}
                className="text-xs text-brand-600 hover:text-brand-800 border border-brand-200 hover:bg-brand-50 px-2 py-0.5 rounded-md transition-colors font-semibold"
              >
                Modify
              </button>
            )}
            <button
              onClick={() => cancel.mutate(order.id)}
              disabled={cancel.isPending}
              className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:bg-red-50 px-2 py-0.5 rounded-md transition-colors font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        );
      },
    }),
  ], [cancel]);

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) return (
    <div className="p-5 space-y-2">
      {[...Array(4)].map((_, i) => <div key={i} className="h-10 skeleton rounded-xl" />)}
    </div>
  );

  if (!data?.length) return <p className="text-sm text-ink-400 text-center py-8">No orders yet.</p>;

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id} className="border-b border-ink-100">
                {hg.headers.map(h => (
                  <th key={h.id} className="text-left py-2.5 px-4 text-xs text-ink-400 font-semibold uppercase tracking-wide whitespace-nowrap">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="border-b border-ink-100 hover:bg-ink-50 transition-colors">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="py-3 px-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modifyOrder && <ModifyModal order={modifyOrder} onClose={() => setModifyOrder(null)} />}
    </>
  );
};

export default OrderHistory;
