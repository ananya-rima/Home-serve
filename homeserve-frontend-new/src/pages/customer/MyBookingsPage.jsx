import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Wrench, CalendarX } from 'lucide-react';
import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchMyBookings } from '../../features/booking/bookingSlice';
import { BOOKING_STATUS_LABEL } from '../../utils/constants';
import { formatCurrency, formatDate, formatTimeSlot } from '../../utils/formatters';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import Pagination from '../../components/ui/Pagination';
import StatusBadge from '../../components/ui/StatusBadge';

const TABS = [{ value: '', label: 'All' }, ...Object.keys(BOOKING_STATUS_LABEL).map((s) => ({ value: s, label: BOOKING_STATUS_LABEL[s] }))];

const MyBookingsPage = () => {
  const dispatch = useAppDispatch();
  const { myBookings, meta, status } = useAppSelector((s) => s.booking);
  const tick = useAppSelector((s) => s.ui.realtimeTick);
  const [tab, setTab] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchMyBookings({ page, limit: 8, status: tab || undefined }));
  }, [dispatch, page, tab,tick]);

  const changeTab = (value) => {
    setTab(value);
    setPage(1);
  };

  return (
    <div>
      <PageHeader
        title="My Bookings"
        subtitle="Track every request from pending to completed."
        actions={
          <Link to="/customer/services">
            <Button variant="accent">Book a service</Button>
          </Link>
        }
      />

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.value || 'all'}
            onClick={() => changeTab(t.value)}
            className={clsx(
              'whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition',
              tab === t.value ? 'bg-brand-600 text-white shadow-soft' : 'bg-white text-ink-600 ring-1 ring-ink-200 hover:bg-ink-50'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {status === 'loading' && myBookings.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-ink-100" />
          ))}
        </div>
      ) : myBookings.length === 0 ? (
        <EmptyState
          icon={CalendarX}
          title="No bookings here yet"
          description={tab ? 'No bookings with this status.' : 'Your booked services will show up here.'}
        />
      ) : (
        <div className="space-y-3">
          {myBookings.map((b) => (
            <Link key={b._id} to={`/customer/bookings/${b._id}`}>
              <Card className="flex flex-col gap-4 transition-shadow hover:shadow-floating sm:flex-row sm:items-center">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-gradient text-white">
                  {b.service?.image ? <img src={b.service.image} alt="" className="h-full w-full object-cover" /> : <Wrench className="h-7 w-7" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-bold text-ink-900">{b.service?.name}</h3>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-ink-500">
                    <span className="flex items-center gap-1.5">
                      <Avatar src={b.provider?.profileImage} name={b.provider?.name} size="h-5 w-5" /> {b.provider?.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" /> {formatDate(b.bookingDate)} · {formatTimeSlot(b.timeSlot)}
                    </span>
                    {b.address && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {b.address.area}, {b.address.city}
                      </span>
                    )}
                  </div>
                </div>
                <p className="font-display text-xl font-extrabold text-brand-700">{formatCurrency(b.price)}</p>
              </Card>
            </Link>
          ))}
          <div className="pt-3">
            <Pagination meta={meta} onPageChange={setPage} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
