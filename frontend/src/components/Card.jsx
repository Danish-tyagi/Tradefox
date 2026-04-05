const Card = ({ children, className = '', padding = true, onClick }) => (
  <div onClick={onClick}
    className={`bg-white rounded-2xl border border-ink-200 card-shadow
      ${padding ? 'p-5' : ''}
      ${onClick ? 'cursor-pointer hover:border-brand-300 hover:card-shadow-md transition-all' : ''}
      ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-4">
    <div>
      <h3 className="text-sm font-semibold text-ink-800">{title}</h3>
      {subtitle && <p className="text-xs text-ink-400 mt-0.5">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export default Card;
