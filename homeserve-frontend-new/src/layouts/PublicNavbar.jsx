import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import Logo from '../components/common/Logo';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logoutUser } from '../features/auth/authSlice';
import { ROLES } from '../utils/constants';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '/services' },
  { label: 'Providers', to: '/providers' },
];

const DASHBOARD_PATH = {
  [ROLES.CUSTOMER]: '/customer/services',
  [ROLES.PROVIDER]: '/provider/dashboard',
  [ROLES.ADMIN]: '/admin/dashboard',
};

const PublicNavbar = () => {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/80 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-semibold transition ${isActive ? 'text-brand-700' : 'text-ink-600 hover:text-brand-600'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <Link
                to={DASHBOARD_PATH[user?.role] || '/'}
                className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-semibold text-ink-700 hover:bg-ink-100"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Avatar src={user?.profileImage} name={user?.name} size="h-9 w-9" />
              <Button variant="ghost" size="sm" icon={LogOut} onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-ink-700 hover:text-brand-600">
                Log in
              </Link>
              <Button size="md" onClick={() => navigate('/register')}>
                Get Started
              </Button>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen((o) => !o)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-ink-100 bg-white px-4 py-4 md:hidden animate-fadeIn">
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)} className="text-sm font-semibold text-ink-700">
                {link.label}
              </NavLink>
            ))}
            <hr className="border-ink-100" />
            {isAuthenticated ? (
              <>
                <Link to={DASHBOARD_PATH[user?.role] || '/'} onClick={() => setOpen(false)} className="text-sm font-semibold text-brand-700">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="text-left text-sm font-semibold text-rose-600">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="text-sm font-semibold text-ink-700">
                  Log in
                </Link>
                <Link to="/register" onClick={() => setOpen(false)} className="text-sm font-semibold text-brand-700">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;
