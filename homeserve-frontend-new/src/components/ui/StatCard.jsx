import clsx from 'clsx';

const StatCard = ({ label, value, icon: Icon, tone = 'brand', trend }) => {
  const toneClasses = {
    brand: 'bg-brand-50 text-brand-600',
    accent: 'bg-accent-50 text-accent-600',
    rose: 'bg-rose-50 text-rose-600',
    sky: 'bg-sky-50 text-sky-600',
    violet: 'bg-violet-50 text-violet-600',
  };

  return (
    <div className="card p-5 flex items-start justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</p>
        <p className="mt-1.5 text-2xl font-bold text-ink-900 font-display">{value}</p>
        {trend && <p className="mt-1 text-xs font-medium text-emerald-600">{trend}</p>}
      </div>
      {Icon && (
        <div className={clsx('flex h-11 w-11 items-center justify-center rounded-xl', toneClasses[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      )}
    </div>
  );
};

export default StatCard;
