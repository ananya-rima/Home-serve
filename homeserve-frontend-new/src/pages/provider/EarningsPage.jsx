import { useEffect } from 'react';
import { Wallet, TrendingUp, Briefcase, CalendarCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchEarnings, fetchProviderBookings } from '../../features/provider/providerSlice';
import { formatCurrency, formatDate } from '../../utils/formatters';
import ApprovalBanner from '../../components/common/ApprovalBanner';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import PageLoader from '../../components/ui/PageLoader';
import StatCard from '../../components/ui/StatCard';

const EarningsPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { earnings, myBookings, status } = useAppSelector((s) => s.provider);

  useEffect(() => {
    dispatch(fetchEarnings());
    dispatch(fetchProviderBookings({ status: 'completed' }));
  }, [dispatch]);

  if (!user?.isApproved) {
    return (
      <div>
        <PageHeader title="Earnings" subtitle="Track your income from completed jobs." />
        <ApprovalBanner user={user} />
      </div>
    );
  }

  if (status === 'loading' && !earnings) return <PageLoader label="Loading earnings..." />;

  const recent = myBookings.slice(0, 10);

  return (
    <div>
      <PageHeader title="Earnings" subtitle="Track your income from completed jobs." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Earnings" value={formatCurrency(earnings?.total?.totalEarnings)} icon={Wallet} tone="brand" />
        <StatCard label="Total Completed Jobs" value={earnings?.total?.completedJobs || 0} icon={Briefcase} tone="sky" />
        <StatCard label="This Month's Earnings" value={formatCurrency(earnings?.currentMonth?.currentMonthEarnings)} icon={TrendingUp} tone="accent" />
        <StatCard label="This Month's Jobs" value={earnings?.currentMonth?.currentMonthJobs || 0} icon={CalendarCheck} tone="violet" />
      </div>

      <Card className="mt-6" padded={false}>
        <div className="border-b border-ink-100 p-5">
          <h2 className="text-base font-bold text-ink-900">Recent completed jobs</h2>
        </div>
        {recent.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={Wallet} title="No earnings yet" description="Completed jobs and their payouts will be listed here." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-400">
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Service</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {recent.map((b) => (
                  <tr key={b._id}>
                    <td className="px-5 py-3 font-medium text-ink-800">{b.customerId?.name}</td>
                    <td className="px-5 py-3 text-ink-600">{b.serviceId?.name}</td>
                    <td className="px-5 py-3 text-ink-500">{formatDate(b.bookingDate)}</td>
                    <td className="px-5 py-3 text-right font-bold text-brand-700">{formatCurrency(b.price)}</td>
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

export default EarningsPage;
