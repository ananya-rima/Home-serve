import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CalendarClock, Save } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchAvailability, setAvailability } from '../../features/provider/providerSlice';
import { WEEK_DAYS } from '../../utils/constants';
import { getErrorMessage } from '../../utils/formatters';
import ApprovalBanner from '../../components/common/ApprovalBanner';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import PageLoader from '../../components/ui/PageLoader';

const DEFAULT_HOURS = { startTime: '09:00', endTime: '18:00' };

const AvailabilityPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { availability, status } = useAppSelector((s) => s.provider);
  const [schedule, setSchedule] = useState(
    WEEK_DAYS.reduce((acc, day) => ({ ...acc, [day]: { isAvailable: false, ...DEFAULT_HOURS } }), {})
  );
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    dispatch(fetchAvailability());
  }, [dispatch]);

  useEffect(() => {
    if (availability.length > 0 && !loaded) {
      setSchedule((prev) => {
        const next = { ...prev };
        availability.forEach((a) => {
          next[a.day] = { isAvailable: a.isAvailable, startTime: a.startTime, endTime: a.endTime };
        });
        return next;
      });
      setLoaded(true);
    }
  }, [availability, loaded]);

  const toggleDay = (day) => {
    setSchedule((prev) => ({ ...prev, [day]: { ...prev[day], isAvailable: !prev[day].isAvailable } }));
  };

  const updateTime = (day, field, value) => {
    setSchedule((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  };

  const applyToAll = (day) => {
    const source = schedule[day];
    setSchedule((prev) => {
      const next = { ...prev };
      WEEK_DAYS.forEach((d) => {
        if (next[d].isAvailable) next[d] = { ...next[d], startTime: source.startTime, endTime: source.endTime };
      });
      return next;
    });
    toast.success(`Applied ${day}'s hours to all your working days`);
  };

  const handleSave = async () => {
    const invalid = WEEK_DAYS.some((day) => schedule[day].isAvailable && schedule[day].startTime >= schedule[day].endTime);
    if (invalid) {
      toast.error('Start time must be before end time on every working day');
      return;
    }
    setSaving(true);
    try {
      const payload = WEEK_DAYS.map((day) => ({ day, ...schedule[day] }));
      await dispatch(setAvailability(payload)).unwrap();
      toast.success('Availability saved');
    } catch (err) {
      toast.error(getErrorMessage({ message: err }));
    } finally {
      setSaving(false);
    }
  };

  if (!user?.isApproved) {
    return (
      <div>
        <PageHeader title="Availability" subtitle="Set the days and hours you're open for bookings." />
        <ApprovalBanner user={user} />
      </div>
    );
  }

  if (status === 'loading' && !loaded) return <PageLoader label="Loading availability..." />;

  return (
    <div>
      <PageHeader
        title="Availability"
        subtitle="Set the days and hours you're open for bookings. Customers can only book within these windows."
        actions={
          <Button icon={Save} onClick={handleSave} isLoading={saving}>
            Save availability
          </Button>
        }
      />

      <Card padded={false}>
        <div className="divide-y divide-ink-100">
          {WEEK_DAYS.map((day) => {
            const d = schedule[day];
            return (
              <div key={day} className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
                <label className="flex w-36 shrink-0 cursor-pointer items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${d.isAvailable ? 'bg-brand-600' : 'bg-ink-200'}`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${d.isAvailable ? 'left-5' : 'left-0.5'}`} />
                  </button>
                  <span className={`text-sm font-semibold ${d.isAvailable ? 'text-ink-900' : 'text-ink-400'}`}>{day}</span>
                </label>

                {d.isAvailable ? (
                  <div className="flex flex-1 flex-wrap items-center gap-3">
                    <input
                      type="time"
                      value={d.startTime}
                      onChange={(e) => updateTime(day, 'startTime', e.target.value)}
                      className="rounded-lg border border-ink-200 px-3 py-1.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
                    />
                    <span className="text-sm text-ink-400">to</span>
                    <input
                      type="time"
                      value={d.endTime}
                      onChange={(e) => updateTime(day, 'endTime', e.target.value)}
                      className="rounded-lg border border-ink-200 px-3 py-1.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
                    />
                    <button onClick={() => applyToAll(day)} className="text-xs font-semibold text-brand-700 hover:underline">
                      Apply to all working days
                    </button>
                  </div>
                ) : (
                  <p className="flex flex-1 items-center gap-2 text-sm text-ink-400">
                    <CalendarClock className="h-4 w-4" /> Not working this day
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default AvailabilityPage;
