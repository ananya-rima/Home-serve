import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ListChecks, ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchProviderBookings } from '../../features/provider/providerSlice';
import { updateBookingStatus } from '../../features/booking/bookingSlice';
import { formatDate, getErrorMessage } from '../../utils/formatters';
import ApprovalBanner from '../../components/common/ApprovalBanner';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import PageLoader from '../../components/ui/PageLoader';
import ProviderBookingCard from '../../components/common/ProviderBookingCard';
import JobProgress from '../../components/common/JobProgress';


const NEXT_STATUS = { Confirmed: 'OnTheWay', OnTheWay: 'Started', Started: 'Completed' };
const NEXT_LABEL = { Confirmed: 'Mark On The Way', OnTheWay: 'Mark Started', Started: 'Mark Completed' };


const isJobDayReached = (bookingDate) => {
  const scheduled = new Date(bookingDate);
  scheduled.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today >= scheduled;
};

const ActiveBookingsPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { myBookings, status } = useAppSelector((s) => s.provider);
  const tick = useAppSelector((s) => s.ui.realtimeTick);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    dispatch(fetchProviderBookings({ status: 'active' }));
  }, [dispatch,tick]);

  const advance = async (booking) => {
    const nextStatus = NEXT_STATUS[booking.status];
    if (!nextStatus) return;
    setBusyId(booking._id);
    try {
      await dispatch(updateBookingStatus({ id: booking._id, status: nextStatus })).unwrap();
      toast.success(`Marked as ${nextStatus}`);
    } catch (err) {
      toast.error(getErrorMessage({ message: err }));
    } finally {
      setBusyId(null);
    }
  };

  if (!user?.isApproved) {
    return (
      <div>
        <PageHeader title="Active Bookings" subtitle="Confirmed jobs in progress." />
        <ApprovalBanner user={user} />
      </div>
    );
  }

  
  const grouped = ['Confirmed', 'OnTheWay', 'Started']
    .map((s) => myBookings.filter((b) => b.status === s))
    .flat();

  return (
    <div>
      <PageHeader title="Active Bookings" subtitle="Move each job forward as you go - customers see this update live." />

      {status === 'loading' && grouped.length === 0 ? (
        <PageLoader label="Loading active bookings..." />
      ) : grouped.length === 0 ? (
        <EmptyState icon={ListChecks} title="No active bookings" description="Accepted jobs will show up here until they're completed." />
      ) : (
        <div className="space-y-4">
          {grouped.map((b) => {
            const dayReached = isJobDayReached(b.bookingDate);
            return (
              <ProviderBookingCard
                key={b._id}
                booking={b}
                actions={
                  NEXT_STATUS[b.status] &&
                  (dayReached ? (
                    <Button size="sm" icon={ArrowRight} onClick={() => advance(b)} isLoading={busyId === b._id}>
                      {NEXT_LABEL[b.status]}
                    </Button>
                  ) : (
                    <span className="text-right text-xs font-medium text-ink-400">
                      Starts on
                      <br />
                      {formatDate(b.bookingDate, 'dd MMM yyyy')}
                    </span>
                  ))
                }
              >
                <div className="border-t border-ink-100 pt-4">
                  <JobProgress status={b.status} />
                </div>
              </ProviderBookingCard>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActiveBookingsPage;
