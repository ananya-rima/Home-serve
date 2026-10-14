import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

const Pagination = ({ meta, onPageChange }) => {
  if (!meta || meta.totalPages <= 1) return null;
  const { page, totalPages, total } = meta;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-4">
      <p className="text-xs text-ink-500">
        Page <span className="font-semibold text-ink-700">{page}</span> of{' '}
        <span className="font-semibold text-ink-700">{totalPages}</span> &middot; {total} total
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" icon={ChevronLeft} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="flex-row-reverse"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
