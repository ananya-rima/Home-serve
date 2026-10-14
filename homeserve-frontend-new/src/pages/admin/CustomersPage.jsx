import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, Users, ShieldBan, ShieldCheck, Eye } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchCustomers, fetchCustomerDetails, toggleCustomerBlock } from '../../features/admin/adminSlice';
import { useDebounce } from '../../hooks/useDebounce';
import { formatCurrency, formatDate, getErrorMessage } from '../../utils/formatters';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/ui/PageHeader';
import PageLoader from '../../components/ui/PageLoader';
import Pagination from '../../components/ui/Pagination';
import Select from '../../components/ui/Select';
import StatusBadge from '../../components/ui/StatusBadge';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'blocked', label: 'Blocked' },
];

const CustomersPage = () => {
  const dispatch = useAppDispatch();
  const { customers, customersMeta, customerDetails, status } = useAppSelector((s) => s.admin);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [viewingId, setViewingId] = useState(null);
  const [toggleTarget, setToggleTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const dSearch = useDebounce(search, 400);

  useEffect(() => {
    dispatch(fetchCustomers({ page, limit: 10, search: dSearch || undefined, status: statusFilter || undefined }));
  }, [dispatch, page, dSearch, statusFilter]);

  useEffect(() => {
    if (viewingId) dispatch(fetchCustomerDetails(viewingId));
  }, [dispatch, viewingId]);

  const handleToggle = async () => {
    setBusy(true);
    try {
      await dispatch(toggleCustomerBlock(toggleTarget._id)).unwrap();
      toast.success(toggleTarget.status === 'active' ? 'Customer blocked' : 'Customer unblocked');
      setToggleTarget(null);
    } catch (err) {
      toast.error(getErrorMessage({ message: err }));
    } finally {
      setBusy(false);
    }
  };

  const details = customerDetails?.customer?._id === viewingId ? customerDetails : null;

  return (
    <div>
      <PageHeader title="Customers" subtitle="Search, review, and manage customer accounts." />

      <div className="mb-5 flex flex-wrap gap-3">
        <div className="min-w-[240px] flex-1">
          <Input icon={Search} placeholder="Search by name or email" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="w-48">
          <Select placeholder="All statuses" options={STATUS_OPTIONS} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} />
        </div>
      </div>

      {status === 'loading' && customers.length === 0 ? (
        <PageLoader label="Loading customers..." />
      ) : customers.length === 0 ? (
        <EmptyState icon={Users} title="No customers found" description="Try a different search or filter." />
      ) : (
        <div className="card overflow-x-auto" style={{ padding: 0 }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-400">
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Phone</th>
                <th className="px-5 py-3 font-semibold">Joined</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {customers.map((c) => (
                <tr key={c._id}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={c.profileImage} name={c.name} size="h-9 w-9" />
                      <div>
                        <p className="font-semibold text-ink-900">{c.name}</p>
                        <p className="text-xs text-ink-400">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink-600">{c.phone}</td>
                  <td className="px-5 py-3 text-ink-500">{formatDate(c.createdAt)}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${c.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{c.status}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" icon={Eye} onClick={() => setViewingId(c._id)}>
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={c.status === 'active' ? ShieldBan : ShieldCheck}
                        className={c.status === 'active' ? 'text-rose-500' : 'text-emerald-600'}
                        onClick={() => setToggleTarget(c)}
                      >
                        {c.status === 'active' ? 'Block' : 'Unblock'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4">
            <Pagination meta={customersMeta} onPageChange={setPage} />
          </div>
        </div>
      )}

      <Modal isOpen={Boolean(viewingId)} onClose={() => setViewingId(null)} title="Customer details" size="lg">
        {!details ? (
          <PageLoader label="Loading..." />
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Avatar src={details.customer.profileImage} name={details.customer.name} size="h-14 w-14" />
              <div>
                <p className="font-bold text-ink-900">{details.customer.name}</p>
                <p className="text-sm text-ink-500">{details.customer.email}</p>
                <p className="text-sm text-ink-500">{details.customer.phone}</p>
              </div>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-bold text-ink-900">Booking history ({details.bookings.length})</h4>
              {details.bookings.length === 0 ? (
                <p className="text-sm text-ink-400">No bookings yet.</p>
              ) : (
                <div className="max-h-72 space-y-2 overflow-y-auto">
                  {details.bookings.map((b) => (
                    <div key={b._id} className="flex items-center justify-between rounded-lg bg-ink-50 p-3 text-sm">
                      <div>
                        <p className="font-semibold text-ink-800">{b.serviceId?.name}</p>
                        <p className="text-xs text-ink-500">
                          {b.providerId?.name} · {formatDate(b.bookingDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={b.status} />
                        <p className="mt-1 text-xs font-bold text-ink-700">{formatCurrency(b.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(toggleTarget)}
        onClose={() => setToggleTarget(null)}
        onConfirm={handleToggle}
        isLoading={busy}
        variant={toggleTarget?.status === 'active' ? 'danger' : 'primary'}
        title={toggleTarget?.status === 'active' ? 'Block this customer?' : 'Unblock this customer?'}
        message={
          toggleTarget?.status === 'active'
            ? 'They will be unable to log in or make bookings until unblocked.'
            : 'They will regain full access to their account.'
        }
        confirmLabel={toggleTarget?.status === 'active' ? 'Block customer' : 'Unblock customer'}
      />
    </div>
  );
};

export default CustomersPage;
