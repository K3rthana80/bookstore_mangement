import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LayoutDashboard, BookMarked, LogOut, Library } from 'lucide-react';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/books',     label: 'Books',     icon: BookOpen },
  { to: '/issues',    label: 'Issued Books', icon: BookMarked },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully.');
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-indigo-900 min-h-screen flex flex-col text-white shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-indigo-800 flex items-center gap-3">
        <Library className="w-8 h-8 text-indigo-300" />
        <div>
          <p className="font-bold text-sm leading-tight">Book Store</p>
          <p className="text-xs text-indigo-400">Management System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-700 text-white'
                  : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="px-3 py-4 border-t border-indigo-800">
        <div className="px-3 py-2 mb-2">
          <p className="text-xs text-indigo-400">Logged in as</p>
          <p className="text-sm font-medium text-white truncate">{user?.username}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-200 hover:bg-red-700 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
