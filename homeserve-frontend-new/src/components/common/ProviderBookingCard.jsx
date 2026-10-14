import { CalendarDays, MapPin, Phone } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Card from '../ui/Card';
import StatusBadge from '../ui/StatusBadge';
import { formatCurrency, formatDate, formatTimeSlot } from '../../utils/formatters';

const ProviderBookingCard = ({ booking, actions, children }) => {
  const customer = booking.customerId;
  const service = booking.serviceId;
  const address = booking.addressId;

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-ink-900">{service?.name || 'Service'}</h3>
            <StatusBadge status={booking.status} />
          </div>
          <p className="mt-0.5 font-mono text-xs text-ink-400">#{booking._id.slice(-8).toUpperCase()}</p>
        </div>
        <p className="font-display text-xl font-extrabold text-brand-700">{formatCurrency(booking.price)}</p>
      </div>

      <div className="grid gap-4 text-sm sm:grid-cols-3">
        <div className="flex items-center gap-3">
          <Avatar src={customer?.profileImage} name={customer?.name} size="h-10 w-10" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink-900">{customer?.name || 'Customer'}</p>
            {customer?.phone && (
              <a href={`tel:${customer.phone}`} className="flex items-center gap-1 text-xs text-brand-700 hover:underline">
                <Phone className="h-3 w-3" /> {customer.phone}
              </a>
            )}
          </div>
        </div>
        <div className="flex items-start gap-2 text-ink-600">
          <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
          <span>
            <b className="text-ink-900">{formatDate(booking.bookingDate, 'EEE, dd MMM yyyy')}</b>
            <br />
            {formatTimeSlot(booking.timeSlot)}
          </span>
        </div>
        {address && (
          <div className="flex items-start gap-2 text-ink-600">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            <span>
              {address.houseNo}, {address.street}
              <br />
              {address.area}, {address.city} - {address.pincode}
            </span>
          </div>
        )}
      </div>

      {children}

      {actions && <div className="flex flex-wrap justify-end gap-2 border-t border-ink-100 pt-4">{actions}</div>}
    </Card>
  );
};

export default ProviderBookingCard;
