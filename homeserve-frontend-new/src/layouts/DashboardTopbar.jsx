import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, LogOut, ChevronDown, UserCircle } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logoutUser } from '../features/auth/authSlice';

const DashboardTopbar = ({ onMenuClick, title }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const profilePath = `/${user?.role}/profile`;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-ink-100 bg-white/90 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <button className="lg:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5 text-ink-600" />
        </button>
        <h2 className="text-base font-bold text-ink-900 sm:text-lg">{title}</h2>
      </div>

      <div className="relative" ref={ref}>
        <button onClick={() => setMenuOpen((o) => !o)} className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-ink-100">
          <Avatar src={user?.profileImage} name={user?.name} size="h-8 w-8" />
          <span className="hidden text-sm font-semibold text-ink-700 sm:inline">{user?.name}</span>
          <ChevronDown className="h-4 w-4 text-ink-400" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-xl border border-ink-100 bg-white p-1.5 shadow-floating animate-fadeIn">
            <Link
              to={profilePath}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-100"
            >
              <UserCircle className="h-4 w-4" /> My Profile
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default DashboardTopbar;
