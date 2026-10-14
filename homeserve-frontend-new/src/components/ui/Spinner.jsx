import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

const Spinner = ({ className, size = 'h-6 w-6' }) => (
  <Loader2 className={clsx('animate-spin text-brand-500', size, className)} />
);

export default Spinner;
