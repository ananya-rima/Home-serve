import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Briefcase, Clock, AlertTriangle, MessageSquareText, UserX, CalendarClock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchProviderDetails, fetchPublicAvailability } from '../../features/provider/providerSlice';
import { useBasePath } from '../../hooks/useBasePath';
import { formatCurrency, formatDate, formatTimeSlot } from '../../utils/formatters';
import { WEEK_DAYS } from '../../utils/constants';
import BookNowButton from '../../components/common/BookNowButton';
import Avatar from '../../components/ui/Avatar';
import Card from '../../components/ui/Card';
import RatingStars from '../../components/ui/RatingStars';
import EmptyState from '../../components/ui/EmptyState';
import PageLoader from '../../components/ui/PageLoader';

const ProviderDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const base = useBasePath();
  const { providerDetails, error, publicAvailability } = useAppSelector((s) => s.provider);

  useEffect(() => {
    dispatch(fetchProviderDetails(id));
    dispatch(fetchPublicAvailability({ id }));
  }, [dispatch, id]);

  const details = providerDetails?.provider?._id === id ? providerDetails : null;
  const schedule = publicAvailability?.providerId === id ? publicAvailability.availability : null;

  if (!details) {
    if (error && !providerDetails) return <EmptyState icon={UserX} title="Provider not found" description={error} />;
    return <PageLoader label="Loading provider..." />;
  }

  const { provider, services, reviews, ratingSummary } = details;
  const bookable = provider.isApproved && provider.status === 'active';

  return (
    <div>
      <Link to={`${base}/providers`} className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Back to providers
      </Link>

      {!bookable && (
        <div className="mb-5 flex items-center gap-3 rounded-xl bg-amber-50 p-4 text-sm font-medium text-amber-800">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          This provider is not currently available for booking.
        </div>
      )}

      <Card className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <Avatar src={provider.profileImage} name={provider.name} size="h-24 w-24 text-2xl" />
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-ink-950">{provider.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-600">
            <RatingStars rating={ratingSummary.avgRating} />
            <span className="text-ink-400">({ratingSummary.totalReviews} reviews)</span>
            {provider.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-ink-400" /> {provider.location}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Briefcase className="h-4 w-4 text-ink-400" /> {provider.experience || 0} yrs experience
            </span>
          </div>
          {provider.description && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-600">{provider.description}</p>}
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section>
            <h2 className="mb-4 text-lg font-bold text-ink-900">Services offered ({services.length})</h2>
            {services.length === 0 ? (
              <EmptyState icon={UserX} title="No services listed" description="This provider hasn't listed any services yet." />
            ) : (
              <div className="space-y-3">
                {services
                  .filter((ps) => ps.serviceId)
                  .map((ps) => (
                    <Card key={ps._id} className="flex flex-wrap items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <Link to={`${base}/services/${ps.serviceId._id}`} className="font-bold text-ink-900 hover:text-brand-700">
                          {ps.serviceId.name}
                        </Link>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-500">
                          <Clock className="h-3.5 w-3.5" /> {ps.serviceId.duration} min
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-display text-xl font-extrabold text-brand-700">{formatCurrency(ps.price)}</p>
                        <BookNowButton size="sm" serviceId={ps.serviceId._id} providerId={provider._id} disabled={!bookable} />
                      </div>
                    </Card>
                  ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold text-ink-900">Customer reviews</h2>
            {reviews.length === 0 ? (
              <EmptyState icon={MessageSquareText} title="No reviews yet" description="Be the first to review after your booking is completed." />
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <Card key={r._id}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={r.customerId?.profileImage} name={r.customerId?.name} size="h-9 w-9" />
                        <div>
                          <p className="text-sm font-semibold text-ink-900">{r.customerId?.name || 'Customer'}</p>
                          <p className="text-xs text-ink-400">{formatDate(r.createdAt)}</p>
                        </div>
                      </div>
                      <RatingStars rating={r.rating} showValue={false} />
                    </div>
                    {r.comment && <p className="mt-3 text-sm text-ink-600">{r.comment}</p>}
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <Card>
            <h3 className="text-sm font-bold text-ink-900">Skills</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {provider.skills?.length ? (
                provider.skills.map((s) => (
                  <span key={s} className="badge bg-brand-50 text-brand-700">
                    {s}
                  </span>
                ))
              ) : (
                <p className="text-sm text-ink-400">Not specified</p>
              )}
            </div>
          </Card>
          <Card>
            <h3 className="text-sm font-bold text-ink-900">Service areas</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {provider.serviceAreas?.length ? (
                provider.serviceAreas.map((a) => (
                  <span key={a} className="badge bg-ink-100 text-ink-600">
                    <MapPin className="h-3 w-3" /> {a}
                  </span>
                ))
              ) : (
                <p className="text-sm text-ink-400">Not specified</p>
              )}
            </div>
          </Card>
          <Card>
            <h3 className="flex items-center gap-2 text-sm font-bold text-ink-900">
              <CalendarClock className="h-4 w-4 text-brand-600" /> Weekly availability
            </h3>
            {!schedule ? (
              <p className="mt-3 text-sm text-ink-400">Loading schedule...</p>
            ) : schedule.length === 0 ? (
              <p className="mt-3 text-sm text-ink-400">This provider hasn't published working hours yet.</p>
            ) : (
              <ul className="mt-3 divide-y divide-ink-100 text-sm">
                {WEEK_DAYS.map((day) => {
                  const rec = schedule.find((a) => a.day === day);
                  const open = rec?.isAvailable;
                  return (
                    <li key={day} className="flex items-center justify-between py-2">
                      <span className={open ? 'font-semibold text-ink-800' : 'text-ink-400'}>{day}</span>
                      <span className={open ? 'text-ink-600' : 'text-ink-300'}>
                        {open ? `${formatTimeSlot(rec.startTime)} – ${formatTimeSlot(rec.endTime)}` : 'Unavailable'}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="mt-4 text-xs text-ink-400">Open time slots for a specific date are shown when you book.</p>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default ProviderDetailsPage;
