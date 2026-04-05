import { NavLink, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatCurrency';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/tradefox-logo.svg';

const navItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/trade', label: 'Trade' },
  { path: '/portfolio', label: 'Portfolio' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="h-14 bg-white border-b border-gray-100 flex items-center px-6 gap-6 sticky top-0 z-40">
      {/* Logo */}
      <img src={logo} alt="TradeFox" className="h-8 mr-4" />

      {/* Nav Links */}
      <div className="flex items-center gap-1 flex-1">
        {navItems.map(({ path, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${isActive
                ? 'bg-fox-50 text-fox-600'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {user && (
          <>
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-400">Balance</p>
              <p className="text-sm font-semibold text-gray-800">
                {formatCurrency(user.balance)}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-fox-100 text-fox-700 flex items-center justify-center text-sm font-bold uppercase">
              {user.name?.[0] || 'U'}
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;