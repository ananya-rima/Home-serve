import { useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, Wrench, Trophy, Star } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchRevenue,
  fetchTopServices,
  fetchTopProviders,
  fetchProviderRatings,
} from '../../features/admin/adminSlice';
import { formatCurrency } from '../../utils/formatters';
import Avatar from '../../components/ui/Avatar';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import PageLoader from '../../components/ui/PageLoader';
import RatingStars from '../../components/ui/RatingStars';

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-ink-950 px-3 py-2 text-xs text-white shadow-floating">
      <p className="font-semibold">{label}</p>
      <p>{formatCurrency(payload[0].value)}</p>
    </div>
  );
};

const ReportsPage = () => {
  const dispatch = useAppDispatch();
  const { revenue, topServices, topProviders, providerRatings, status } = useAppSelector((s) => s.admin);

  useEffect(() => {
    dispatch(fetchRevenue());
    dispatch(fetchTopServices({ limit: 5 }));
    dispatch(fetchTopProviders({ limit: 5 }));
    dispatch(fetchProviderRatings());
  }, [dispatch]);

  const chartData = [...revenue]
    .sort((a, b) => (a._id.year - b._id.year) || (a._id.month - b._id.month))
    .slice(-12)
    .map((r) => ({
      label: `${MONTH_NAMES[r._id.month]} ${String(r._id.year).slice(-2)}`,
      revenue: r.totalRevenue,
      bookings: r.totalBookings,
    }));

  if (status === 'loading' && revenue.length === 0) return <PageLoader label="Loading reports..." />;

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" subtitle="Revenue trends and platform performance." />

      <Card>
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-ink-900">
          <TrendingUp className="h-5 w-5 text-brand-600" /> Monthly revenue
        </h2>
        {chartData.length === 0 ? (
          <EmptyState icon={TrendingUp} title="No revenue yet" description="Completed bookings will populate this chart." />
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eceef0" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#657280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#657280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `Rs ${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#eef7f6' }} />
                <Bar dataKey="revenue" fill="#2e857b" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-ink-900">
            <Wrench className="h-5 w-5 text-brand-600" /> Top services
          </h2>
          {topServices.length === 0 ? (
            <EmptyState icon={Wrench} title="No data yet" />
          ) : (
            <div className="space-y-3">
              {topServices.map((s, i) => (
                <div key={s._id} className="flex items-center justify-between rounded-lg bg-ink-50 p-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">{i + 1}</span>
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{s.service?.name}</p>
                      <p className="text-xs text-ink-400">{formatCurrency(s.service?.basePrice)}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-ink-700">{s.bookingCount} bookings</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-ink-900">
            <Trophy className="h-5 w-5 text-brand-600" /> Top providers
          </h2>
          {topProviders.length === 0 ? (
            <EmptyState icon={Trophy} title="No data yet" />
          ) : (
            <div className="space-y-3">
              {topProviders.map((p, i) => (
                <div key={p._id} className="flex items-center justify-between rounded-lg bg-ink-50 p-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">{i + 1}</span>
                    <Avatar src={p.provider?.profileImage} name={p.provider?.name} size="h-8 w-8" />
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{p.provider?.name}</p>
                      <p className="text-xs text-ink-400">{formatCurrency(p.totalEarnings)} earned</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-ink-700">{p.completedJobs} jobs</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-ink-900">
          <Star className="h-5 w-5 text-brand-600" /> Provider rating summary
        </h2>
        {providerRatings.length === 0 ? (
          <EmptyState icon={Star} title="No ratings yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-400">
                  <th className="py-2.5 font-semibold">Provider</th>
                  <th className="py-2.5 font-semibold">Rating</th>
                  <th className="py-2.5 text-right font-semibold">Reviews</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {providerRatings.map((p) => (
                  <tr key={p._id}>
                    <td className="py-2.5 font-medium text-ink-800">{p.provider?.name}</td>
                    <td className="py-2.5">
                      <RatingStars rating={p.avgRating} />
                    </td>
                    <td className="py-2.5 text-right text-ink-500">{p.totalReviews}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ReportsPage;
