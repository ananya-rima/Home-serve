import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, ShieldCheck, Package, CalendarCheck, Wallet, UserCheck, Clock, XCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchDashboard } from '../../features/admin/adminSlice';
import { formatCurrency } from '../../utils/formatters';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import PageLoader from '../../components/ui/PageLoader';
import StatCard from '../../components/ui/StatCard';

const AdminDashboardPage = () => {
  const dispatch = useAppDispatch();
  const { dashboard } = useAppSelector((s) => s.admin);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  if (!dashboard) return <PageLoader label="Loading dashboard..." />;

  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="Platform-wide overview at a glance." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={formatCurrency(dashboard.totalRevenue)} icon={Wallet} tone="brand" />
        <StatCard label="Total Bookings" value={dashboard.totalBookings} icon={CalendarCheck} tone="sky" />
        <StatCard label="Total Customers" value={dashboard.totalCustomers} icon={Users} tone="violet" />
        <StatCard label="Total Providers" value={dashboard.totalProviders} icon={ShieldCheck} tone="accent" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Services" value={dashboard.totalServices} icon={Package} />
        <StatCard label="Approved Providers" value={dashboard.approvedProviders} icon={UserCheck} tone="brand" />
        <StatCard label="Pending Approvals" value={dashboard.pendingProviders} icon={Clock} tone="accent" />
        <StatCard label="Cancelled Bookings" value={dashboard.cancelledBookings} icon={XCircle} tone="rose" />
      </div>

      <Card className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ink-900">Completed bookings</p>
            <p className="text-xs text-ink-500">Jobs successfully delivered on the platform</p>
          </div>
          <p className="font-display text-3xl font-extrabold text-emerald-600">{dashboard.completedBookings}</p>
        </div>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Link to="/admin/providers?approvalStatus=pending">
          <Card className="transition-shadow hover:shadow-floating">
            <p className="text-sm font-semibold text-ink-900">Review pending providers</p>
            <p className="mt-1 text-xs text-ink-500">{dashboard.pendingProviders} awaiting approval</p>
          </Card>
        </Link>
        <Link to="/admin/complaints?status=open">
          <Card className="transition-shadow hover:shadow-floating">
            <p className="text-sm font-semibold text-ink-900">Open complaints</p>
            <p className="mt-1 text-xs text-ink-500">Review and resolve customer issues</p>
          </Card>
        </Link>
        <Link to="/admin/reports">
          <Card className="transition-shadow hover:shadow-floating">
            <p className="text-sm font-semibold text-ink-900">Full reports</p>
            <p className="mt-1 text-xs text-ink-500">Revenue trends, top services & providers</p>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
