import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Star, Pencil, Trash2, MessageSquareText, PartyPopper } from 'lucide-react';
import { useAppDispatch } from '../../app/hooks';
import { createReview, updateReview, deleteReview } from '../../features/review/reviewSlice';
import { reviewApi } from '../../features/review/reviewApi';
import { bookingApi } from '../../features/booking/bookingApi';
import { formatDate, getErrorMessage } from '../../utils/formatters';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import PageLoader from '../../components/ui/PageLoader';
import RatingStars from '../../components/ui/RatingStars';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ReviewFormModal from '../../components/common/ReviewFormModal';


const ReviewsPage = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [reviewByBooking, setReviewByBooking] = useState({});
  const [formTarget, setFormTarget] = useState(null); 
  const [deleteTarget, setDeleteTarget] = useState(null); 
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await bookingApi.getMyBookings({ status: 'Completed', limit: 100 });
      const completed = data.data;
      setBookings(completed);

      const providerIds = [...new Set(completed.map((b) => b.provider?._id).filter(Boolean))];
      const results = await Promise.all(providerIds.map((pid) => reviewApi.getByProvider(pid).then((r) => r.data.data)));
      const map = {};
      results.flat().forEach((r) => {
        map[r.bookingId] = r;
      });
      setReviewByBooking(map);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const awaiting = bookings.filter((b) => !reviewByBooking[b._id]);
  const reviewed = bookings.filter((b) => reviewByBooking[b._id]);

  const submitReview = async (payload) => {
    const { booking, review } = formTarget;
    try {
      if (review) {
        const updated = await dispatch(updateReview({ id: review._id, payload })).unwrap();
        setReviewByBooking((m) => ({ ...m, [booking._id]: { ...review, ...updated } }));
        toast.success('Review updated');
      } else {
        const created = await dispatch(createReview({ bookingId: booking._id, ...payload })).unwrap();
        setReviewByBooking((m) => ({ ...m, [booking._id]: created }));
        toast.success('Thanks for your review!');
      }
    } catch (err) {
      toast.error(getErrorMessage({ message: err }));
      throw err;
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await dispatch(deleteReview(deleteTarget.review._id)).unwrap();
      setReviewByBooking((m) => {
        const next = { ...m };
        delete next[deleteTarget.booking._id];
        return next;
      });
      toast.success('Review deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getErrorMessage({ message: err }));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <PageLoader label="Loading your reviews..." />;

  return (
    <div className="space-y-10">
      <PageHeader title="My Reviews" subtitle="Rate completed jobs and manage the reviews you've written." />

      <section>
        <h2 className="mb-4 text-lg font-bold text-ink-900">Awaiting your review ({awaiting.length})</h2>
        {awaiting.length === 0 ? (
          <EmptyState icon={PartyPopper} title="You're all caught up" description="Completed bookings you haven't reviewed will appear here." />
        ) : (
          <div className="space-y-3">
            {awaiting.map((b) => (
              <Card key={b._id} className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar src={b.provider?.profileImage} name={b.provider?.name} size="h-12 w-12" />
                  <div>
                    <Link to={`/customer/bookings/${b._id}`} className="font-bold text-ink-900 hover:text-brand-700">
                      {b.service?.name}
                    </Link>
                    <p className="text-xs text-ink-500">
                      {b.provider?.name} · {formatDate(b.bookingDate)}
                    </p>
                  </div>
                </div>
                <Button icon={Star} onClick={() => setFormTarget({ booking: b })}>
                  Write review
                </Button>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-ink-900">Your reviews ({reviewed.length})</h2>
        {reviewed.length === 0 ? (
          <EmptyState icon={MessageSquareText} title="No reviews yet" description="Your submitted reviews will be listed here." />
        ) : (
          <div className="space-y-3">
            {reviewed.map((b) => {
              const review = reviewByBooking[b._id];
              return (
                <Card key={b._id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={b.provider?.profileImage} name={b.provider?.name} size="h-11 w-11" />
                      <div>
                        <p className="font-bold text-ink-900">{b.provider?.name}</p>
                        <p className="text-xs text-ink-500">
                          {b.service?.name} · reviewed {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" icon={Pencil} onClick={() => setFormTarget({ booking: b, review })}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" icon={Trash2} className="text-rose-500" onClick={() => setDeleteTarget({ booking: b, review })}>
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <RatingStars rating={review.rating} />
                    {review.comment && <p className="mt-2 text-sm text-ink-600">{review.comment}</p>}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <ReviewFormModal
        isOpen={Boolean(formTarget)}
        onClose={() => setFormTarget(null)}
        onSubmit={submitReview}
        initial={formTarget?.review}
        providerName={formTarget?.booking?.provider?.name}
      />
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={busy}
        title="Delete this review?"
        message="Your rating and comment will be permanently removed."
        confirmLabel="Delete review"
      />
    </div>
  );
};

export default ReviewsPage;
