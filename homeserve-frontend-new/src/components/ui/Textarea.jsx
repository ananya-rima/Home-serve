import { forwardRef } from 'react';
import clsx from 'clsx';

const Textarea = forwardRef(({ label, error, rows = 4, className, id, ...props }, ref) => {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink-700">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        className={clsx(
          'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400',
          'transition focus:outline-none focus:ring-2 focus:ring-brand-400/40 resize-none',
          error ? 'border-rose-400 focus:ring-rose-300' : 'border-ink-200 focus:border-brand-400',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';
export default Textarea;
