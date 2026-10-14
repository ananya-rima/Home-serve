import clsx from 'clsx';
import { Check, X } from 'lucide-react';
import { BOOKING_STATUS_LABEL } from '../../utils/constants';
import { formatDateTime } from '../../utils/formatters';

const FLOW = ['Pending', 'Confirmed', 'OnTheWay', 'Started', 'Completed'];


const BookingTimeline = ({ statusHistory = [], status }) => {
  const reached = {};
  statusHistory.forEach((h) => {
    reached[h.status] = h.changedAt;
  });

  const isTerminalBad = status === 'Rejected' || status === 'Cancelled';
  const steps = isTerminalBad
    ? [...FLOW.filter((s) => reached[s]), status]
    : FLOW;

  return (
    <ol className="relative space-y-6">
      {steps.map((step, i) => {
        const done = Boolean(reached[step]);
        const bad = step === 'Rejected' || step === 'Cancelled';
        return (
          <li key={step} className="relative flex gap-4">
            {i < steps.length - 1 && (
              <span
                className={clsx('absolute left-[15px] top-8 h-[calc(100%-8px)] w-0.5', done && !bad ? 'bg-brand-300' : 'bg-ink-100')}
              />
            )}
            <span
              className={clsx(
                'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2',
                bad && done && 'border-rose-500 bg-rose-500 text-white',
                !bad && done && 'border-brand-600 bg-brand-600 text-white',
                !done && 'border-ink-200 bg-white text-ink-300'
              )}
            >
              {bad && done ? <X className="h-4 w-4" /> : done ? <Check className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-ink-200" />}
            </span>
            <div className="pt-1">
              <p className={clsx('text-sm font-semibold', done ? 'text-ink-900' : 'text-ink-400')}>
                {BOOKING_STATUS_LABEL[step] || step}
              </p>
              <p className="text-xs text-ink-400">{done ? formatDateTime(reached[step]) : 'Waiting'}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default BookingTimeline;
