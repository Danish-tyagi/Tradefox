const Button = ({ children, type = 'button', onClick, disabled = false, variant = 'primary', size = 'md', className = '', ...props }) => {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed';
  const v = {
    primary:   'bg-brand-500 hover:bg-brand-600 text-white focus:ring-brand-400 shadow-sm',
    secondary: 'bg-white hover:bg-ink-50 text-ink-700 border border-ink-200 focus:ring-ink-300 shadow-sm',
    danger:    'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 focus:ring-red-300',
    ghost:     'hover:bg-ink-100 text-ink-600 focus:ring-ink-200',
    success:   'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 focus:ring-emerald-300',
  };
  const s = { sm: 'text-xs px-3 py-1.5', md: 'text-sm px-4 py-2.5', lg: 'text-sm px-6 py-3' };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`${base} ${v[variant]} ${s[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
