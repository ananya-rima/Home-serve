import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import clsx from 'clsx';

const Logo = ({ to = '/', className, iconOnly = false }) => (
  <Link to={to} className={clsx('inline-flex items-center gap-2 select-none', className)}>
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-soft">
      <Home className="h-5 w-5" />
    </span>
    {!iconOnly && <span className="text-lg font-display font-extrabold tracking-tight text-ink-950">HomeServe</span>}
  </Link>
);

export default Logo;
