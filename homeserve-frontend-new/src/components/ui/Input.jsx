import { forwardRef } from 'react';
import clsx from 'clsx';

const Input = forwardRef(({ label, error, hint, icon: Icon, className, id, ...props }, ref) => {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400',
            'transition focus:outline-none focus:ring-2 focus:ring-brand-400/40',
            Icon && 'pl-10',
            error ? 'border-rose-400 focus:ring-rose-300' : 'border-ink-200 focus:border-brand-400',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
      {!error && hint && <p className="mt-1.5 text-xs text-ink-400">{hint}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
