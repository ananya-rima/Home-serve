import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ClipboardList, Check, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchBookingRequests } from '../../features/provider/providerSlice';
import { acceptBooking, rejectBooking } from '../../features/booking/bookingSlice';
import { getErrorMessage } from '../../utils/formatters';
import ApprovalBanner from '../../components/common/ApprovalBanner';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import PageLoader from '../../components/ui/PageLoader';
import ProviderBookingCard from '../../components/common/ProviderBookingCard';

const BookingRequestsPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { bookingRequests, status } = useAppSelector((s) => s.provider);
  const tick = useAppSelector((s) => s.ui.realtimeTick);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    dispatch(fetchBookingRequests());
  }, [dispatch,tick]);

  const handleAccept = async (id) => {
    setBusyId(id);
    try {
      await dispatch(acceptBooking(id)).unwrap();
      toast.success('Booking accepted');
    } catch (err) {
      toast.error(getErrorMessage({ message: err }));
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async () => {
    setBusyId(rejectTarget);
    try {
      await dispatch(rejectBooking(rejectTarget)).unwrap();
      toast.success('Booking rejected');
      setRejectTarget(null);
    } catch (err) {
      toast.error(getErrorMessage({ message: err }));
    } finally {
      setBusyId(null);
    }
  };

  if (!user?.isApproved) {
    return (
      <div>
        <PageHeader title="Booking Requests" subtitle="New requests waiting for your response." />
        <ApprovalBanner user={user} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Booking Requests" subtitle="Accept or decline new requests before customers cancel or move on." />

      {status === 'loading' && bookingRequests.length === 0 ? (
        <PageLoader label="Loading requests..." />
      ) : bookingRequests.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No pending requests" description="New booking requests from customers will appear here." />
      ) : (
        <div className="space-y-4">
          {bookingRequests.map((b) => (
            <ProviderBookingCard
              key={b._id}
              booking={b}
              actions={
                <>
                  <Button variant="outline" size="sm" icon={X} onClick={() => setRejectTarget(b._id)} disabled={busyId === b._id}>
                    Decline
                  </Button>
                  <Button size="sm" icon={Check} onClick={() => handleAccept(b._id)} isLoading={busyId === b._id}>
                    Accept
                  </Button>
                </>
              }
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleReject}
        isLoading={Boolean(busyId)}
        title="Decline this request?"
        message="The customer will be notified that you're unable to take this booking."
        confirmLabel="Decline booking"
      />
    </div>
  );
};

export default BookingRequestsPage;
