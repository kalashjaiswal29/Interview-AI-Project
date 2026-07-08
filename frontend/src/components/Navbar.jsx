import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-4">
      <nav className="max-w-4xl mx-auto flex items-center justify-between px-6 py-4 bg-slate-900/60 backdrop-blur-xl border border-white/5 shadow-lg rounded-2xl">
        <Link to="/" className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent hover:opacity-90 transition-opacity">
          ⚡ AI Interview Coach
        </Link>
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <span className="hidden md:inline text-xs text-slate-400 font-medium bg-slate-800/50 px-3 py-1 rounded-full border border-white/5">
                👤 {user.name || 'User'}
              </span>
              <Link to="/dashboard" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link to="/history" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                History
              </Link>
              <button onClick={handleLogout} className="clay-btn clay-btn-danger text-xs px-3 py-1.5 rounded-xl">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                Login
              </Link>
              <Link to="/register" className="clay-btn clay-btn-primary text-xs px-4 py-2 rounded-xl">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

