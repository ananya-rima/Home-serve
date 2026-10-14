import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, CalendarDays, MapPin, Clock, CheckCircle2, Home, Briefcase, ShieldAlert, Plus } from 'lucide-react';
import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchServiceById } from '../../features/service/serviceSlice';
import { fetchProviderDetails, fetchPublicAvailability } from '../../features/provider/providerSlice';
import { fetchAddresses } from '../../features/customer/customerSlice';
import { createBooking } from '../../features/booking/bookingSlice';
import { TIME_SLOTS } from '../../utils/constants';
import { formatCurrency, formatLongDate, formatTimeSlot, getErrorMessage, todayISO } from '../../utils/formatters';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Input from '../../components/ui/Input';
import PageHeader from '../../components/ui/PageHeader';
import PageLoader from '../../components/ui/PageLoader';

const LABEL_ICON = { Home, Office: Briefcase, Other: MapPin };

const SLOT_REASON = {
  off: 'Provider is off this day',
  hours: 'Outside working hours',
  booked: 'Already booked',
  past: 'Time has passed',
};


const getSlotState = (avail, date, slot) => {
  if (!avail || avail.date !== date) return { disabled: false };
  if (!avail.isWorkingDay) return { disabled: true, reason: 'off' };
  const record = avail.availability.find((a) => a.day === avail.day);
  if (record && (slot < record.startTime || slot > record.endTime)) return { disabled: true, reason: 'hours' };
  if (avail.bookedSlots.includes(slot)) return { disabled: true, reason: 'booked' };
  if (date === todayISO()) {
    const now = new Date();
    const [h, m] = slot.split(':').map(Number);
    if (h * 60 + m <= now.getHours() * 60 + now.getMinutes()) return { disabled: true, reason: 'past' };
  }
  return { disabled: false };
};

const BookingPage = () => {
  const [params] = useSearchParams();
  const serviceId = params.get('serviceId');
  const providerId = params.get('providerId');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { current } = useAppSelector((s) => s.service);
  const { providerDetails, publicAvailability: rawAvailability } = useAppSelector((s) => s.provider);
 
  const publicAvailability = rawAvailability?.providerId === providerId ? rawAvailability : null;
  const { addresses, status: addressStatus } = useAppSelector((s) => s.customer);
  const { status: bookingStatus } = useAppSelector((s) => s.booking);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ date: '', timeSlot: '', addressId: '' });

  useEffect(() => {
    if (!serviceId || !providerId) return;
    dispatch(fetchServiceById(serviceId));
    dispatch(fetchProviderDetails(providerId));
    dispatch(fetchAddresses());
  }, [dispatch, serviceId, providerId]);

  
  useEffect(() => {
    if (providerId && form.date) {
      dispatch(fetchPublicAvailability({ id: providerId, date: form.date }));
    }
  }, [dispatch, providerId, form.date]);

 
  useEffect(() => {
    if (form.timeSlot && getSlotState(publicAvailability, form.date, form.timeSlot).disabled) {
      setForm((f) => ({ ...f, timeSlot: '' }));
    }
  }, [publicAvailability, form.date, form.timeSlot]);

 
  useEffect(() => {
    if (addresses.length > 0 && !form.addressId) {
      const preferred = addresses.find((a) => a.isDefault) || addresses[0];
      setForm((f) => ({ ...f, addressId: preferred._id }));
    }
  }, [addresses, form.addressId]);

  if (!serviceId || !providerId) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Choose a service and provider first"
        description="Start from a service or provider page to begin a booking."
        actionLabel="Browse services"
        onAction={() => navigate('/customer/services')}
      />
    );
  }

  const service = current?.service?._id === serviceId ? current.service : null;
  const details = providerDetails?.provider?._id === providerId ? providerDetails : null;

  if (!service || !details || addressStatus === 'loading') {
    return <PageLoader label="Preparing your booking..." />;
  }

  const provider = details.provider;
  const providerService = details.services.find((ps) => ps.serviceId?._id === serviceId);
  const bookable = provider.isApproved && provider.status === 'active' && service.status === 'active';
  const selectedAddress = addresses.find((a) => a._id === form.addressId);
  const availabilityInfo =
    form.date && publicAvailability?.date === form.date ? publicAvailability : null;
  const availabilityLoading = Boolean(form.date) && !availabilityInfo;
  const workingHours =
    availabilityInfo?.isWorkingDay ? availabilityInfo.availability.find((a) => a.day === availabilityInfo.day) : null;

  if (!providerService) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="This provider doesn't offer this service"
        description="Please go back and choose a different provider."
        actionLabel="Back to service"
        onAction={() => navigate(`/customer/services/${serviceId}`)}
      />
    );
  }

  const canContinue = form.date && form.timeSlot && form.addressId && bookable;

  const handleConfirm = async () => {
    try {
      const booking = await dispatch(
        createBooking({
          serviceId,
          providerId,
          addressId: form.addressId,
          bookingDate: form.date,
          timeSlot: form.timeSlot,
        })
      ).unwrap();
      toast.success('Booking request sent!');
      navigate(`/customer/bookings/${booking._id}/confirmation`);
    } catch (err) {
      toast.error(getErrorMessage({ message: err }));
      setStep(1);
    }
  };

  const SummaryHeader = () => (
    <Card className="flex flex-wrap items-center gap-4">
      <Avatar src={provider.profileImage} name={provider.name} size="h-14 w-14" />
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wide text-ink-400">You're booking</p>
        <p className="truncate text-lg font-bold text-ink-900">{service.name}</p>
        <p className="text-sm text-ink-500">with {provider.name}</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-ink-400">Price</p>
        <p className="font-display text-2xl font-extrabold text-brand-700">{formatCurrency(providerService.price)}</p>
      </div>
    </Card>
  );

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to={`/customer/providers/${providerId}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to provider
      </Link>
      <PageHeader title="Book your service" subtitle="Pick a date, time and address — you'll review everything before confirming." />

      {/* Stepper */}
      <div className="mb-6 flex items-center gap-3">
        {['Details', 'Review & Confirm'].map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-3">
            <span
              className={clsx(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                step > i + 1 ? 'bg-brand-600 text-white' : step === i + 1 ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-400'
              )}
            >
              {step > i + 1 ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </span>
            <span className={clsx('text-sm font-semibold', step === i + 1 ? 'text-ink-900' : 'text-ink-400')}>{label}</span>
            {i === 0 && <span className="h-px flex-1 bg-ink-200" />}
          </div>
        ))}
      </div>

      {!bookable && (
        <div className="mb-5 rounded-xl bg-amber-50 p-4 text-sm font-medium text-amber-800">
          This provider or service is not currently available for booking.
        </div>
      )}

      <div className="space-y-5">
        <SummaryHeader />

        {step === 1 && (
          <>
            <Card className="space-y-5">
              <h2 className="flex items-center gap-2 text-base font-bold text-ink-900">
                <CalendarDays className="h-5 w-5 text-brand-600" /> Date & time
              </h2>
              <Input
                label="Service date"
                type="date"
                min={todayISO()}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                hint={form.date ? formatLongDate(form.date) : 'Choose a day the provider works'}
              />
              <div>
                <p className="mb-2 text-sm font-medium text-ink-700">Time slot</p>
                {form.date && availabilityLoading && <p className="mb-2 text-xs text-ink-400">Checking availability...</p>}
                {availabilityInfo && !availabilityInfo.isWorkingDay && (
                  <p className="mb-3 rounded-lg bg-amber-50 p-3 text-xs font-medium text-amber-800">
                    {provider.name} doesn't work on {availabilityInfo.day}s. Please choose another date.
                  </p>
                )}
                {workingHours && (
                  <p className="mb-3 text-xs text-ink-500">
                    Working hours that day: <b className="text-ink-700">{formatTimeSlot(workingHours.startTime)} – {formatTimeSlot(workingHours.endTime)}</b>
                  </p>
                )}
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                  {TIME_SLOTS.map((slot) => {
                    const state = getSlotState(publicAvailability, form.date, slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={!form.date || state.disabled}
                        title={state.reason ? SLOT_REASON[state.reason] : undefined}
                        onClick={() => setForm({ ...form, timeSlot: slot })}
                        className={clsx(
                          'rounded-xl border px-3 py-2.5 text-sm font-semibold transition',
                          'disabled:cursor-not-allowed disabled:border-ink-100 disabled:bg-ink-50 disabled:text-ink-300 disabled:line-through',
                          form.timeSlot === slot
                            ? 'border-brand-600 bg-brand-600 text-white shadow-soft'
                            : 'border-ink-200 bg-white text-ink-700 hover:border-brand-300 hover:bg-brand-50'
                        )}
                      >
                        {formatTimeSlot(slot)}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-ink-400">
                  {form.date ? 'Greyed-out slots are booked, outside working hours, or unavailable.' : 'Pick a date to see open time slots.'}
                </p>
              </div>
            </Card>

            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-bold text-ink-900">
                  <MapPin className="h-5 w-5 text-brand-600" /> Service address
                </h2>
                <Link to="/customer/addresses" className="flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline">
                  <Plus className="h-3.5 w-3.5" /> Manage addresses
                </Link>
              </div>
              {addresses.length === 0 ? (
                <EmptyState
                  icon={MapPin}
                  title="No saved address"
                  description="Add an address so the provider knows where to go."
                  actionLabel="Add an address"
                  onAction={() => navigate('/customer/addresses')}
                />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {addresses.map((a) => {
                    const Icon = LABEL_ICON[a.label] || MapPin;
                    return (
                      <button
                        key={a._id}
                        type="button"
                        onClick={() => setForm({ ...form, addressId: a._id })}
                        className={clsx(
                          'rounded-xl border p-4 text-left transition',
                          form.addressId === a._id ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600' : 'border-ink-200 bg-white hover:border-brand-300'
                        )}
                      >
                        <div className="flex items-center gap-2 text-sm font-bold text-ink-900">
                          <Icon className="h-4 w-4 text-brand-600" /> {a.label}
                          {a.isDefault && <span className="badge bg-brand-100 text-brand-700">Default</span>}
                        </div>
                        <p className="mt-1.5 text-xs text-ink-500">
                          {a.houseNo}, {a.street}, {a.area}, {a.city}, {a.state} - {a.pincode}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </Card>

            <div className="flex justify-end">
              <Button size="lg" disabled={!canContinue} onClick={() => setStep(2)}>
                Review summary
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <Card className="space-y-4">
              <h2 className="text-base font-bold text-ink-900">Booking summary</h2>
              <dl className="divide-y divide-ink-100 text-sm">
                {[
                  ['Service', service.name],
                  ['Provider', provider.name],
                  ['Date', formatLongDate(form.date)],
                  ['Time', formatTimeSlot(form.timeSlot)],
                  ['Duration', `${service.duration} minutes`],
                  [
                    'Address',
                    selectedAddress
                      ? `${selectedAddress.label} — ${selectedAddress.houseNo}, ${selectedAddress.street}, ${selectedAddress.area}, ${selectedAddress.city}`
                      : '-',
                  ],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-6 py-3">
                    <dt className="text-ink-500">{k}</dt>
                    <dd className="text-right font-semibold text-ink-900">{v}</dd>
                  </div>
                ))}
                <div className="flex justify-between py-4">
                  <dt className="text-base font-bold text-ink-900">Total</dt>
                  <dd className="font-display text-2xl font-extrabold text-brand-700">{formatCurrency(providerService.price)}</dd>
                </div>
              </dl>
              <p className="flex items-start gap-2 rounded-lg bg-ink-50 p-3 text-xs text-ink-500">
                <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                Your request will be sent to the provider as <b>Pending</b>. You can cancel it while it's pending or confirmed.
              </p>
            </Card>
            <div className="flex justify-between">
              <Button variant="outline" size="lg" onClick={() => setStep(1)} disabled={bookingStatus === 'loading'}>
                Edit details
              </Button>
              <Button size="lg" variant="accent" onClick={handleConfirm} isLoading={bookingStatus === 'loading'}>
                Confirm booking
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
