import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchProviderBookings } from '../../features/provider/providerSlice';
import ApprovalBanner from '../../components/common/ApprovalBanner';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import PageLoader from '../../components/ui/PageLoader';
import Pagination from '../../components/ui/Pagination';
import ProviderBookingCard from '../../components/common/ProviderBookingCard';

const PAGE_SIZE = 6;

const CompletedBookingsPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { myBookings, status } = useAppSelector((s) => s.provider);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchProviderBookings({ status: 'completed' }));
  }, [dispatch]);

  const start = (page - 1) * PAGE_SIZE;
  const paged = myBookings.slice(start, start + PAGE_SIZE);
  const meta = { page, totalPages: Math.ceil(myBookings.length / PAGE_SIZE) || 1, total: myBookings.length };

  if (!user?.isApproved) {
    return (
      <div>
        <PageHeader title="Completed Bookings" subtitle="Your job history." />
        <ApprovalBanner user={user} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Completed Bookings" subtitle="A record of every job you've finished." />

      {status === 'loading' && myBookings.length === 0 ? (
        <PageLoader label="Loading history..." />
      ) : myBookings.length === 0 ? (
        <EmptyState icon={CheckCircle2} title="No completed jobs yet" description="Finished bookings will appear here." />
      ) : (
        <div className="space-y-4">
          {paged.map((b) => (
            <ProviderBookingCard key={b._id} booking={b} />
          ))}
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
};

export default CompletedBookingsPage;
