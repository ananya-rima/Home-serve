import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Star, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchAdminReviews, removeAdminReview } from '../../features/admin/adminSlice';
import { formatDate, getErrorMessage } from '../../utils/formatters';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import PageLoader from '../../components/ui/PageLoader';
import Pagination from '../../components/ui/Pagination';
import RatingStars from '../../components/ui/RatingStars';

const AdminReviewsPage = () => {
  const dispatch = useAppDispatch();
  const { reviews, reviewsMeta, status } = useAppSelector((s) => s.admin);
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    dispatch(fetchAdminReviews({ page, limit: 10 }));
  }, [dispatch, page]);

  const handleDelete = async () => {
    setBusy(true);
    try {
      await dispatch(removeAdminReview(deleting._id)).unwrap();
      toast.success('Review removed');
      setDeleting(null);
    } catch (err) {
      toast.error(getErrorMessage({ message: err }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader title="Reviews" subtitle="Moderate reviews across the platform." />

      {status === 'loading' && reviews.length === 0 ? (
        <PageLoader label="Loading reviews..." />
      ) : reviews.length === 0 ? (
        <EmptyState icon={Star} title="No reviews yet" description="Customer reviews will appear here." />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <Card key={r._id} className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <Avatar src={r.customerId?.profileImage} name={r.customerId?.name} size="h-10 w-10" />
                <div>
                  <p className="text-sm font-semibold text-ink-900">
                    {r.customerId?.name} <span className="font-normal text-ink-400">reviewed</span> {r.providerId?.name}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <RatingStars rating={r.rating} showValue={false} />
                    <span className="text-xs text-ink-400">{formatDate(r.createdAt)}</span>
                  </div>
                  {r.comment && <p className="mt-2 text-sm text-ink-600">{r.comment}</p>}
                </div>
              </div>
              <Button variant="ghost" size="sm" icon={Trash2} className="text-rose-500" onClick={() => setDeleting(r)}>
                Remove
              </Button>
            </Card>
          ))}
          <Pagination meta={reviewsMeta} onPageChange={setPage} />
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        isLoading={busy}
        title="Remove this review?"
        message="This will permanently delete the review from the platform."
        confirmLabel="Remove review"
      />
    </div>
  );
};

export default AdminReviewsPage;
