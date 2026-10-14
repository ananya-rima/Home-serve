import { Star } from 'lucide-react';
import clsx from 'clsx';

const RatingStars = ({ rating = 0, size = 'h-4 w-4', showValue = true }) => (
  <div className="flex items-center gap-1">
    <div className="flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={clsx(size, n <= Math.round(rating) ? 'fill-accent-500 text-accent-500' : 'text-ink-200')}
        />
      ))}
    </div>
    {showValue && <span className="text-xs font-semibold text-ink-600">{Number(rating || 0).toFixed(1)}</span>}
  </div>
);

export default RatingStars;
