export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatCompact = (amount) => {
  if (amount >= 1e7) return `₹${(amount / 1e7).toFixed(2)}Cr`;
  if (amount >= 1e5) return `₹${(amount / 1e5).toFixed(2)}L`;
  if (amount >= 1e3) return `₹${(amount / 1e3).toFixed(2)}K`;
  return `₹${amount.toFixed(2)}`;
};