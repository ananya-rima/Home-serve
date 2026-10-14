import clsx from 'clsx';
import { BOOKING_STATUS_LABEL } from '../../utils/constants';

const STEPS = ['Confirmed', 'OnTheWay', 'Started', 'Completed'];


const JobProgress = ({ status }) => {
  const current = STEPS.indexOf(status);
  return (
    <div>
      <div className="flex gap-1.5">
        {STEPS.map((step, i) => (
          <span key={step} className={clsx('h-1.5 flex-1 rounded-full', i <= current ? 'bg-brand-500' : 'bg-ink-100')} />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] font-medium text-ink-400">
        {STEPS.map((step, i) => (
          <span key={step} className={clsx(i === current && 'font-bold text-brand-700')}>
            {BOOKING_STATUS_LABEL[step]}
          </span>
        ))}
      </div>
    </div>
  );
};

export default JobProgress;
