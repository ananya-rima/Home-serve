import { useState } from 'react';
import { Star } from 'lucide-react';
import clsx from 'clsx';

const StarInput = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)}
          className="p-0.5 transition-transform hover:scale-110"
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <Star
            className={clsx('h-8 w-8', n <= (hover || value) ? 'fill-accent-500 text-accent-500' : 'text-ink-200')}
          />
        </button>
      ))}
    </div>
  );
};

export default StarInput;
