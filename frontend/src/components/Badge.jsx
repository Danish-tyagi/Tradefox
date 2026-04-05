const Badge = ({ children, variant = 'default', className = '' }) => {
  const v = {
    default: 'bg-ink-100 text-ink-600',
    success: 'bg-emerald-50 text-emerald-700',
    danger:  'bg-red-50 text-red-600',
    warning: 'bg-amber-50 text-amber-700',
    info:    'bg-blue-50 text-blue-600',
    orange:  'bg-brand-50 text-brand-600',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold tabular-nums ${v[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
