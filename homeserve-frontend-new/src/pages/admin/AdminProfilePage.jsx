import { useEffect } from 'react';
import { Mail, Phone, ShieldCheck, CalendarDays } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchCurrentUser } from '../../features/auth/authSlice';
import { formatDate } from '../../utils/formatters';
import Avatar from '../../components/ui/Avatar';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';


const AdminProfilePage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);

 
  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  if (!user) return null;

  const details = [
    { icon: Mail, label: 'Email', value: user.email },
    { icon: Phone, label: 'Phone', value: user.phone || '-' },
    { icon: ShieldCheck, label: 'Role', value: 'Administrator' },
    { icon: CalendarDays, label: 'Member since', value: user.createdAt ? formatDate(user.createdAt, 'dd MMM yyyy') : '-' },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="My Profile" subtitle="Your administrator account details." />

      <Card className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left">
        <Avatar src={user.profileImage} name={user.name} size="h-24 w-24 text-2xl" />
        <div className="mt-4 sm:ml-6 sm:mt-0">
          <h2 className="text-xl font-bold text-ink-900">{user.name}</h2>
          <span className="badge mt-2 bg-brand-50 text-brand-700">Admin</span>
        </div>
      </Card>

      <Card className="mt-6 divide-y divide-ink-100" padded={false}>
        {details.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-4 px-5 py-4 sm:px-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-ink-400">{label}</p>
              <p className="truncate text-sm font-semibold text-ink-900">{value}</p>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};

export default AdminProfilePage;
