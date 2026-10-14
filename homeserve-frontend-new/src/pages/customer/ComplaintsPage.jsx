import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { MessageSquareWarning, Plus, ShieldCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchMyComplaints, createComplaint } from '../../features/complaint/complaintSlice';
import { fetchMyBookings } from '../../features/booking/bookingSlice';
import { COMPLAINT_ELIGIBLE_STATUSES, BOOKING_STATUS_LABEL } from '../../utils/constants';
import { formatDate, formatDateTime, getErrorMessage } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import PageLoader from '../../components/ui/PageLoader';
import ComplaintFormModal from '../../components/common/ComplaintFormModal';
import ComplaintStatusBadge from '../../components/common/ComplaintStatusBadge';

const ComplaintsPage = () => {
  const dispatch = useAppDispatch();
  const { myComplaints, status } = useAppSelector((s) => s.complaint);
  const { myBookings } = useAppSelector((s) => s.booking);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchMyComplaints());
    dispatch(fetchMyBookings({ limit: 100 }));
  }, [dispatch]);

  const bookingOptions = useMemo(
    () =>
      myBookings
        .filter((b) => COMPLAINT_ELIGIBLE_STATUSES.includes(b.status))
        .map((b) => ({
          value: b._id,
          label: `${b.service?.name} • ${formatDate(b.bookingDate)} (${BOOKING_STATUS_LABEL[b.status]})`,
        })),
    [myBookings]
  );

  const handleCreate = async (payload) => {
    try {
      await dispatch(createComplaint(payload)).unwrap();
      toast.success('Complaint submitted. We will review it shortly.');
    } catch (err) {
      toast.error(getErrorMessage({ message: err }));
      throw err;
    }
  };

  return (
    <div>
      <PageHeader
        title="Complaints"
        subtitle="Raise an issue with a booking and follow its resolution."
        actions={
          <Button icon={Plus} onClick={() => setOpen(true)} disabled={bookingOptions.length === 0}>
            Raise complaint
          </Button>
        }
      />

      {status === 'loading' && myComplaints.length === 0 ? (
        <PageLoader label="Loading complaints..." />
      ) : myComplaints.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No complaints raised"
          description={
            bookingOptions.length === 0
              ? 'Once you have a confirmed or completed booking you can raise a complaint here if something goes wrong.'
              : 'Everything running smoothly? If not, you can raise a complaint against any eligible booking.'
          }
        />
      ) : (
        <div className="space-y-4">
          {myComplaints.map((c) => (
            <Card key={c._id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <MessageSquareWarning className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-ink-900">{c.subject}</h3>
                    <p className="mt-0.5 text-xs text-ink-400">
                      Against {c.providerId?.name || 'provider'}
                      {c.bookingId?.bookingDate ? ` · Booking on ${formatDate(c.bookingId.bookingDate)}` : ''} · Raised {formatDateTime(c.createdAt)}
                    </p>
                  </div>
                </div>
                <ComplaintStatusBadge status={c.status} />
              </div>
              <p className="mt-4 text-sm text-ink-600">{c.description}</p>
              {c.adminRemark && (
                <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50/60 p-4 text-sm">
                  <p className="text-xs font-bold uppercase tracking-wide text-brand-700">Admin resolution remark</p>
                  <p className="mt-1 text-ink-700">{c.adminRemark}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <ComplaintFormModal isOpen={open} onClose={() => setOpen(false)} onSubmit={handleCreate} bookingOptions={bookingOptions} />
    </div>
  );
};

export default ComplaintsPage;
