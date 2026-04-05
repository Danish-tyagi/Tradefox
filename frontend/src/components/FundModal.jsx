import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fundService } from '../services/fundService';
import { formatCurrency } from '../utils/formatCurrency';
import { useToast } from './Toast';
import { useAuth } from '../hooks/useAuth';
import Modal from './Modal';

const QUICK_AMOUNTS = [5000, 10000, 25000, 50000, 100000];

const FundModal = ({ isOpen, onClose, currentBalance }) => {
  const [tab, setTab] = useState('add');
  const [amount, setAmount] = useState('');
  const qc = useQueryClient();
  const toast = useToast();
  const { updateBalance } = useAuth();

  const onSuccess = (data) => {
    toast.success(data.message, tab === 'add' ? 'Funds Added' : 'Withdrawal Done');
    qc.invalidateQueries(['portfolio-summary']);
    // Sync balance in global auth state so sidebar updates immediately
    if (data.balance !== undefined) updateBalance(data.balance);
    setAmount('');
    onClose();
  };

  const add = useMutation({
    mutationFn: () => fundService.add(parseFloat(amount)),
    onSuccess,
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed', 'Error'),
  });

  const withdraw = useMutation({
    mutationFn: () => fundService.withdraw(parseFloat(amount)),
    onSuccess,
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed', 'Error'),
  });

  const isPending = add.isPending || withdraw.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Funds">
      <div className="space-y-5">
        {/* Current balance */}
        <div className="bg-ink-50 border border-ink-200 rounded-xl px-5 py-4 flex items-center justify-between">
          <span className="text-sm text-ink-500 font-medium">Available Balance</span>
          <span className="text-lg font-bold text-ink-900 tabular-nums">{formatCurrency(currentBalance)}</span>
        </div>

        {/* Tab */}
        <div className="flex gap-0.5 bg-ink-100 rounded-xl p-1">
          {[['add', '+ Add Funds'], ['withdraw', '− Withdraw']].map(([key, label]) => (
            <button key={key} onClick={() => { setTab(key); setAmount(''); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all
                ${tab === key
                  ? key === 'add' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-red-500 text-white shadow-sm'
                  : 'text-ink-500 hover:text-ink-700'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Quick amounts */}
        <div>
          <p className="text-xs text-ink-500 font-medium mb-2">Quick Select</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_AMOUNTS.map(a => (
              <button key={a} onClick={() => setAmount(String(a))}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all
                  ${amount === String(a)
                    ? 'border-brand-400 bg-brand-50 text-brand-600'
                    : 'border-ink-200 text-ink-600 hover:border-ink-300 bg-white'}`}>
                ₹{a.toLocaleString('en-IN')}
              </button>
            ))}
          </div>
        </div>

        {/* Amount input */}
        <div>
          <label className="block text-sm font-semibold text-ink-700 mb-2">Amount (₹)</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full bg-white border border-ink-200 rounded-xl px-4 py-3 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 tabular-nums"
          />
          {tab === 'add' && <p className="text-xs text-ink-400 mt-1">Max single deposit: ₹5,00,000</p>}
          {tab === 'withdraw' && <p className="text-xs text-ink-400 mt-1">Min withdrawal: ₹100</p>}
        </div>

        {/* Submit */}
        <button
          onClick={() => tab === 'add' ? add.mutate() : withdraw.mutate()}
          disabled={!amount || parseFloat(amount) <= 0 || isPending}
          className={`w-full py-3.5 text-sm font-bold rounded-xl transition-all disabled:opacity-50 text-white
            ${tab === 'add'
              ? 'bg-emerald-500 hover:bg-emerald-600 shadow-[0_4px_14px_rgba(5,150,105,0.3)]'
              : 'bg-red-500 hover:bg-red-600 shadow-[0_4px_14px_rgba(220,38,38,0.3)]'}`}
        >
          {isPending ? 'Processing...' : tab === 'add' ? `Add ${amount ? formatCurrency(amount) : 'Funds'}` : `Withdraw ${amount ? formatCurrency(amount) : 'Funds'}`}
        </button>
      </div>
    </Modal>
  );
};

export default FundModal;
