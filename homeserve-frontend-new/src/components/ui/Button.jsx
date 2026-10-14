import { forwardRef } from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-soft focus-visible:ring-brand-400',
  accent: 'bg-accent-gradient text-white hover:brightness-105 shadow-soft focus-visible:ring-accent-400',
  outline: 'border border-ink-200 text-ink-700 bg-white hover:bg-ink-50 focus-visible:ring-ink-300',
  ghost: 'text-ink-600 hover:bg-ink-100 focus-visible:ring-ink-300',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-soft focus-visible:ring-rose-400',
  subtle: 'bg-brand-50 text-brand-700 hover:bg-brand-100 focus-visible:ring-brand-300',
};

const SIZES = {
  sm: 'text-sm px-3 py-1.5 rounded-lg gap-1.5',
  md: 'text-sm px-4 py-2.5 rounded-xl gap-2',
  lg: 'text-base px-6 py-3 rounded-xl gap-2',
};

const Button = forwardRef(
  ({ children, variant = 'primary', size = 'md', isLoading, disabled, className, icon: Icon, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          'inline-flex items-center justify-center font-semibold transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
          VARIANTS[variant],
          SIZES[size],
          className
        )}
        {...props}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : Icon ? <Icon className="h-4 w-4" /> : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
