import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CalendarCheck, Eye } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchAllBookings, fetchAdminBookingDetails } from '../../features/admin/adminSlice';
import { BOOKING_STATUS_LABEL } from '../../utils/constants';
import { formatCurrency, formatDate, formatDateTime, formatTimeSlot, getErrorMessage } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/ui/PageHeader';
import PageLoader from '../../components/ui/PageLoader';
import Pagination from '../../components/ui/Pagination';
import Select from '../../components/ui/Select';
import StatusBadge from '../../components/ui/StatusBadge';

const STATUS_OPTIONS = Object.entries(BOOKING_STATUS_LABEL).map(([value, label]) => ({ value, label }));

const AdminBookingsPage = () => {
  const dispatch = useAppDispatch();
  const { bookings, bookingsMeta, bookingDetails, status } = useAppSelector((s) => s.admin);
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [viewingId, setViewingId] = useState(null);

  useEffect(() => {
    dispatch(
      fetchAllBookings({
        page,
        limit: 10,
        status: statusFilter || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      })
    );
  }, [dispatch, page, statusFilter, fromDate, toDate]);

  useEffect(() => {
    if (viewingId) {
      dispatch(fetchAdminBookingDetails(viewingId)).unwrap().catch((err) => toast.error(getErrorMessage({ message: err })));
    }
  }, [dispatch, viewingId]);

  const details = bookingDetails?._id === viewingId ? bookingDetails : null;

  return (
    <div>
      <PageHeader title="Bookings" subtitle="Monitor every booking across the platform." />

      <div className="mb-5 flex flex-wrap gap-3">
        <div className="w-48">
          <Select placeholder="All statuses" options={STATUS_OPTIONS} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} />
        </div>
        <Input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} className="w-40" />
        <Input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} className="w-40" />
      </div>

      {status === 'loading' && bookings.length === 0 ? (
        <PageLoader label="Loading bookings..." />
      ) : bookings.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="No bookings found" description="Try a different filter." />
      ) : (
        <div className="card overflow-x-auto" style={{ padding: 0 }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-400">
                <th className="px-5 py-3 font-semibold">Service</th>
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Provider</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Amount</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td className="px-5 py-3 font-medium text-ink-800">{b.serviceId?.name}</td>
                  <td className="px-5 py-3 text-ink-600">{b.customerId?.name}</td>
                  <td className="px-5 py-3 text-ink-600">{b.providerId?.name}</td>
                  <td className="px-5 py-3 text-ink-500">{formatDate(b.bookingDate)}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-ink-900">{formatCurrency(b.price)}</td>
                  <td className="px-5 py-3 text-right">
                    <Button variant="ghost" size="sm" icon={Eye} onClick={() => setViewingId(b._id)}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4">
            <Pagination meta={bookingsMeta} onPageChange={setPage} />
          </div>
        </div>
      )}

      <Modal isOpen={Boolean(viewingId)} onClose={() => setViewingId(null)} title="Booking details">
        {!details ? (
          <PageLoader label="Loading..." />
        ) : (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs text-ink-400">#{details._id.slice(-8).toUpperCase()}</p>
              <StatusBadge status={details.status} />
            </div>
            <dl className="divide-y divide-ink-100">
              {[
                ['Service', details.service?.name],
                ['Customer', `${details.customer?.name} (${details.customer?.phone || '-'})`],
                ['Provider', `${details.provider?.name} (${details.provider?.phone || '-'})`],
                ['Date & time', `${formatDate(details.bookingDate)} · ${formatTimeSlot(details.timeSlot)}`],
                [
                  'Address',
                  details.address
                    ? `${details.address.houseNo}, ${details.address.street}, ${details.address.area}, ${details.address.city}`
                    : '-',
                ],
                ['Payment status', details.paymentStatus],
                ['Created', formatDateTime(details.createdAt)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-6 py-2.5">
                  <dt className="text-ink-500">{k}</dt>
                  <dd className="text-right font-semibold text-ink-900">{v}</dd>
                </div>
              ))}
              <div className="flex justify-between py-3">
                <dt className="font-bold text-ink-900">Total</dt>
                <dd className="font-display text-xl font-extrabold text-brand-700">{formatCurrency(details.price)}</dd>
              </div>
            </dl>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminBookingsPage;
