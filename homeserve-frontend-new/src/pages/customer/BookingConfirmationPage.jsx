




import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, CalendarDays, MapPin, User, Wrench } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchBookingById, clearLastCreated } from '../../features/booking/bookingSlice';
import { formatCurrency, formatDate, formatTimeSlot } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import PageLoader from '../../components/ui/PageLoader';

const BookingConfirmationPage = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { current } = useAppSelector((s) => s.booking);

  useEffect(() => {
    dispatch(fetchBookingById(id));
    return () => {
      dispatch(clearLastCreated());
    };
  }, [dispatch, id]);

  const booking = current?._id === id ? current : null;
  if (!booking) return <PageLoader label="Loading your booking..." />;

  const address = booking.addressId;

  return (
    <div className="mx-auto max-w-2xl text-center animate-fadeIn">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
        <CheckCircle2 className="h-11 w-11 text-emerald-500" />
      </div>
      <h1 className="mt-5 text-2xl font-extrabold text-ink-950">Booking request sent!</h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
        {booking.providerId?.name} will review your request shortly. You'll see the status update here as soon as they respond.
      </p>

      <Card className="mt-8 text-left">
        <div className="flex items-center justify-between border-b border-ink-100 pb-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-400">Booking reference</p>
            <p className="font-mono text-sm font-semibold text-ink-800">#{booking._id.slice(-8).toUpperCase()}</p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="space-y-4 py-5 text-sm">
          <p className="flex items-start gap-3">
            <Wrench className="mt-0.5 h-4 w-4 text-brand-600" />
            <span>
              <b className="text-ink-900">{booking.serviceId?.name}</b>
              <br />
              <span className="text-ink-500">{booking.serviceId?.duration} minutes</span>
            </span>
          </p>
          <p className="flex items-start gap-3">
            <User className="mt-0.5 h-4 w-4 text-brand-600" />
            <span>
              <b className="text-ink-900">{booking.providerId?.name}</b>
            </span>
          </p>
          <p className="flex items-start gap-3">
            <CalendarDays className="mt-0.5 h-4 w-4 text-brand-600" />
            <span>
              <b className="text-ink-900">{formatDate(booking.bookingDate, 'EEEE, dd MMMM yyyy')}</b>
              <br />
              <span className="text-ink-500">{formatTimeSlot(booking.timeSlot)}</span>
            </span>
          </p>
          {address && (
            <p className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-brand-600" />
              <span className="text-ink-600">
                {address.houseNo}, {address.street}, {address.area}, {address.city}, {address.state} {address.pincode}
              </span>
            </p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-ink-100 pt-4">
          <span className="text-sm text-ink-500">Total</span>
          <span className="font-display text-2xl font-extrabold text-brand-700">{formatCurrency(booking.price)}</span>
        </div>
      </Card>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to={`/customer/bookings/${booking._id}`}>
          <Button size="lg">Track booking</Button>
        </Link>
        <Link to="/customer/services">
          <Button size="lg" variant="outline">Browse more services</Button>
        </Link>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;