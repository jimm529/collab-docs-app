import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

// Shared dark-navy header for the authenticated app pages (dashboard,
// editor), matching the login/signup pages' color palette.
export default function AppHeader({ left }) {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="bg-[#0b2654] px-6 py-4 flex items-center justify-between gap-4 shadow-md">
      <div className="flex items-center gap-4 min-w-0">
        <span className="text-white text-sm tracking-[0.2em] font-light whitespace-nowrap">COLLAB DOCS</span>
        {left}
      </div>
      <div className="flex items-center gap-4 text-sm text-white/70 shrink-0">
        <span>{auth.user.email}</span>
        <button onClick={handleLogout} className="text-white/90 hover:text-white hover:underline">
          Log out
        </button>
      </div>
    </header>
  );
}
