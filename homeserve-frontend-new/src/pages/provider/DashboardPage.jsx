import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, CalendarCheck, ClipboardList, Star, ArrowRight, TrendingUp } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchProviderProfile,
  fetchEarnings,
  fetchBookingRequests,
  fetchProviderBookings,
} from '../../features/provider/providerSlice';
import { formatCurrency, formatDate, formatTimeSlot } from '../../utils/formatters';
import ApprovalBanner from '../../components/common/ApprovalBanner';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import RatingStars from '../../components/ui/RatingStars';
import StatCard from '../../components/ui/StatCard';

const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { profile, completedJobs, ratingSummary, earnings, bookingRequests, myBookings } = useAppSelector((s) => s.provider);
  const tick = useAppSelector((s) => s.ui.realtimeTick);

  useEffect(() => {
    dispatch(fetchProviderProfile());
    dispatch(fetchEarnings());
    dispatch(fetchBookingRequests());
    dispatch(fetchProviderBookings({ status: 'active' }));
  }, [dispatch,tick]);

  const upcoming = myBookings.slice(0, 4);

  return (
    <div>
      <PageHeader title={`Welcome back, ${profile?.name?.split(' ')[0] || ''}`} subtitle="Here's how your business is doing." />

      <ApprovalBanner user={user} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Earnings" value={formatCurrency(earnings?.total?.totalEarnings)} icon={Wallet} tone="brand" />
        <StatCard label="This Month" value={formatCurrency(earnings?.currentMonth?.currentMonthEarnings)} icon={TrendingUp} tone="accent" />
        <StatCard label="Completed Jobs" value={completedJobs} icon={CalendarCheck} tone="sky" />
        <StatCard label="Avg. Rating" value={Number(ratingSummary.avgRating || 0).toFixed(1)} icon={Star} tone="violet" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-bold text-ink-900">
              <ClipboardList className="h-5 w-5 text-brand-600" /> New Requests ({bookingRequests.length})
            </h2>
            <Link to="/provider/bookings/requests" className="flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {bookingRequests.length === 0 ? (
            <EmptyState icon={ClipboardList} title="No pending requests" description="New booking requests will show up here." />
          ) : (
            <div className="space-y-3">
              {bookingRequests.slice(0, 3).map((b) => (
                <div key={b._id} className="flex items-center justify-between gap-3 rounded-xl bg-ink-50 p-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={b.customerId?.profileImage} name={b.customerId?.name} size="h-9 w-9" />
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{b.serviceId?.name}</p>
                      <p className="text-xs text-ink-500">
                        {formatDate(b.bookingDate)} · {formatTimeSlot(b.timeSlot)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-brand-700">{formatCurrency(b.price)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-bold text-ink-900">
              <CalendarCheck className="h-5 w-5 text-brand-600" /> Active Bookings
            </h2>
            <Link to="/provider/bookings/active" className="flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <EmptyState icon={CalendarCheck} title="Nothing active right now" description="Accepted jobs in progress will appear here." />
          ) : (
            <div className="space-y-3">
              {upcoming.map((b) => (
                <div key={b._id} className="flex items-center justify-between gap-3 rounded-xl bg-ink-50 p-3">
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{b.serviceId?.name}</p>
                    <p className="text-xs text-ink-500">
                      {b.customerId?.name} · {formatDate(b.bookingDate)}
                    </p>
                  </div>
                  <span className="badge bg-brand-50 text-brand-700">{b.status}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {!user?.isApproved ? null : (
        <div className="mt-6 flex items-center justify-between rounded-2xl bg-ink-950 p-6 text-white">
          <div>
            <p className="flex items-center gap-2 font-bold">
              <RatingStars rating={ratingSummary.avgRating} /> {ratingSummary.totalReviews} reviews
            </p>
            <p className="mt-1 text-sm text-white/70">Keep your service quality up to attract more bookings.</p>
          </div>
          <Link to="/provider/services">
            <Button variant="accent">Manage Services</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
