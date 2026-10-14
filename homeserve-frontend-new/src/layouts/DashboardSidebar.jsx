import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import Logo from '../components/common/Logo';
import { X } from 'lucide-react';

const DashboardSidebar = ({ navItems, roleLabel, isOpen, onClose }) => (
  <>
    {isOpen && <div className="fixed inset-0 z-30 bg-ink-950/40 lg:hidden" onClick={onClose} />}
    <aside
      className={clsx(
        'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-ink-100 bg-white transition-transform duration-200 lg:static lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-ink-100 px-5">
        <Logo />
        <button className="lg:hidden" onClick={onClose}>
          <X className="h-5 w-5 text-ink-500" />
        </button>
      </div>

      <div className="px-5 pt-4">
        <span className="badge bg-brand-50 text-brand-700">{roleLabel}</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                isActive ? 'bg-brand-600 text-white shadow-soft' : 'text-ink-600 hover:bg-ink-100'
              )
            }
          >
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  </>
);

export default DashboardSidebar;
