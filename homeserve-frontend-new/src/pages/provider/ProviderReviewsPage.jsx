import { useEffect } from 'react';
import { Star, MessageSquareText } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchMyReviews } from '../../features/provider/providerSlice';
import { formatDate } from '../../utils/formatters';
import ApprovalBanner from '../../components/common/ApprovalBanner';
import Avatar from '../../components/ui/Avatar';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import PageLoader from '../../components/ui/PageLoader';
import RatingStars from '../../components/ui/RatingStars';

const ProviderReviewsPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { myReviews, ratingDistribution, ratingSummary, status } = useAppSelector((s) => s.provider);

  useEffect(() => {
    dispatch(fetchMyReviews());
  }, [dispatch]);

  if (!user?.isApproved) {
    return (
      <div>
        <PageHeader title="Reviews" subtitle="See what customers are saying about your work." />
        <ApprovalBanner user={user} />
      </div>
    );
  }

  if (status === 'loading' && myReviews.length === 0) return <PageLoader label="Loading reviews..." />;

  const distMap = Object.fromEntries(ratingDistribution.map((d) => [d._id, d.count]));
  const total = ratingSummary.totalReviews || 0;

  return (
    <div>
      <PageHeader title="Reviews" subtitle="See what customers are saying about your work." />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="text-center">
          <p className="font-display text-5xl font-extrabold text-ink-950">{Number(ratingSummary.avgRating || 0).toFixed(1)}</p>
          <div className="mt-2 flex justify-center">
            <RatingStars rating={ratingSummary.avgRating} showValue={false} size="h-5 w-5" />
          </div>
          <p className="mt-1 text-sm text-ink-500">{total} reviews</p>

          <div className="mt-6 space-y-2 text-left">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = distMap[star] || 0;
              const pct = total ? Math.round((count / total) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-3 font-semibold text-ink-600">{star}</span>
                  <Star className="h-3 w-3 fill-accent-500 text-accent-500" />
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                    <div className="h-full bg-accent-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 text-right text-ink-400">{count}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="space-y-3">
          {myReviews.length === 0 ? (
            <EmptyState icon={MessageSquareText} title="No reviews yet" description="Reviews from your customers will appear here after jobs are completed." />
          ) : (
            myReviews.map((r) => (
              <Card key={r._id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={r.customerId?.profileImage} name={r.customerId?.name} size="h-10 w-10" />
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{r.customerId?.name || 'Customer'}</p>
                      <p className="text-xs text-ink-400">{formatDate(r.createdAt)}</p>
                    </div>
                  </div>
                  <RatingStars rating={r.rating} showValue={false} />
                </div>
                {r.comment && <p className="mt-3 text-sm text-ink-600">{r.comment}</p>}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderReviewsPage;
