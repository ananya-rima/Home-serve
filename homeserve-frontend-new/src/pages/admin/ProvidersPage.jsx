import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Search, ShieldCheck, ShieldBan, Eye, Check, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchAdminProviders,
  fetchAdminProviderDetails,
  approveProvider,
  rejectProvider,
  toggleProviderBlock,
} from '../../features/admin/adminSlice';
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
import RatingStars from '../../components/ui/RatingStars';
import Select from '../../components/ui/Select';
import StatusBadge from '../../components/ui/StatusBadge';

const APPROVAL_OPTIONS = [
  { value: 'pending', label: 'Pending approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const ProvidersPage = () => {
  const dispatch = useAppDispatch();
  const [params, setParams] = useSearchParams();
  const { providers, providersMeta, providerDetails, status } = useAppSelector((s) => s.admin);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewingId, setViewingId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); 
  const [busy, setBusy] = useState(false);
  const dSearch = useDebounce(search, 400);

  const approvalStatus = params.get('approvalStatus') || '';

  useEffect(() => {
    dispatch(fetchAdminProviders({ page, limit: 10, search: dSearch || undefined, approvalStatus: approvalStatus || undefined }));
  }, [dispatch, page, dSearch, approvalStatus]);

  useEffect(() => {
    if (viewingId) dispatch(fetchAdminProviderDetails(viewingId));
  }, [dispatch, viewingId]);

  const setApprovalFilter = (value) => {
    const next = new URLSearchParams(params);
    if (value) next.set('approvalStatus', value);
    else next.delete('approvalStatus');
    setParams(next, { replace: true });
    setPage(1);
  };

  const runAction = async () => {
    const { type, provider } = confirmAction;
    setBusy(true);
    try {
      if (type === 'approve') {
        await dispatch(approveProvider(provider._id)).unwrap();
        toast.success('Provider approved');
      } else if (type === 'reject') {
        await dispatch(rejectProvider(provider._id)).unwrap();
        toast.success('Provider rejected');
      } else {
        await dispatch(toggleProviderBlock(provider._id)).unwrap();
        toast.success(provider.status === 'active' ? 'Provider blocked' : 'Provider unblocked');
      }
      setConfirmAction(null);
    } catch (err) {
      toast.error(getErrorMessage({ message: err }));
    } finally {
      setBusy(false);
    }
  };

  const CONFIRM_COPY = {
    approve: { title: 'Approve this provider?', message: 'They will be able to offer services and receive bookings.', label: 'Approve', variant: 'primary' },
    reject: { title: 'Reject this provider?', message: 'They will not be able to offer services until re-approved.', label: 'Reject', variant: 'danger' },
    block: { title: 'Block this provider?', message: 'They will be unable to log in or receive new bookings.', label: 'Block', variant: 'danger' },
    unblock: { title: 'Unblock this provider?', message: 'They will regain full access to their account.', label: 'Unblock', variant: 'primary' },
  };

  const details = providerDetails?.provider?._id === viewingId ? providerDetails : null;

  return (
    <div>
      <PageHeader title="Providers" subtitle="Approve new applications and manage existing providers." />

      <div className="mb-5 flex flex-wrap gap-3">
        <div className="min-w-[240px] flex-1">
          <Input icon={Search} placeholder="Search by name or email" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="w-52">
          <Select placeholder="All approval statuses" options={APPROVAL_OPTIONS} value={approvalStatus} onChange={(e) => setApprovalFilter(e.target.value)} />
        </div>
      </div>

      {status === 'loading' && providers.length === 0 ? (
        <PageLoader label="Loading providers..." />
      ) : providers.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="No providers found" description="Try a different search or filter." />
      ) : (
        <div className="card overflow-x-auto" style={{ padding: 0 }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-400">
                <th className="px-5 py-3 font-semibold">Provider</th>
                <th className="px-5 py-3 font-semibold">Approval</th>
                <th className="px-5 py-3 font-semibold">Account</th>
                <th className="px-5 py-3 font-semibold">Joined</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {providers.map((p) => (
                <tr key={p._id}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={p.profileImage} name={p.name} size="h-9 w-9" />
                      <div>
                        <p className="font-semibold text-ink-900">{p.name}</p>
                        <p className="text-xs text-ink-400">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`badge ${
                        p.approvalStatus === 'approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : p.approvalStatus === 'rejected'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {p.approvalStatus || 'pending'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`badge ${p.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{p.status}</span>
                  </td>
                  <td className="px-5 py-3 text-ink-500">{formatDate(p.createdAt)}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap justify-end gap-1">
                      <Button variant="ghost" size="sm" icon={Eye} onClick={() => setViewingId(p._id)}>
                        View
                      </Button>
                      {p.approvalStatus !== 'approved' && (
                        <Button variant="ghost" size="sm" icon={Check} className="text-emerald-600" onClick={() => setConfirmAction({ type: 'approve', provider: p })}>
                          Approve
                        </Button>
                      )}
                      {p.approvalStatus !== 'rejected' && (
                        <Button variant="ghost" size="sm" icon={X} className="text-rose-500" onClick={() => setConfirmAction({ type: 'reject', provider: p })}>
                          Reject
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={p.status === 'active' ? ShieldBan : ShieldCheck}
                        className={p.status === 'active' ? 'text-rose-500' : 'text-emerald-600'}
                        onClick={() => setConfirmAction({ type: p.status === 'active' ? 'block' : 'unblock', provider: p })}
                      >
                        {p.status === 'active' ? 'Block' : 'Unblock'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4">
            <Pagination meta={providersMeta} onPageChange={setPage} />
          </div>
        </div>
      )}

      <Modal isOpen={Boolean(viewingId)} onClose={() => setViewingId(null)} title="Provider details" size="xl">
        {!details ? (
          <PageLoader label="Loading..." />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Avatar src={details.provider.profileImage} name={details.provider.name} size="h-14 w-14" />
              <div>
                <p className="font-bold text-ink-900">{details.provider.name}</p>
                <p className="text-sm text-ink-500">{details.provider.email} · {details.provider.phone}</p>
                <p className="text-xs text-ink-400">{details.provider.location}</p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h4 className="mb-2 text-sm font-bold text-ink-900">Offered services ({details.services.length})</h4>
                <div className="max-h-56 space-y-2 overflow-y-auto">
                  {details.services.filter((s) => s.serviceId).map((s) => (
                    <div key={s._id} className="flex justify-between rounded-lg bg-ink-50 p-3 text-sm">
                      <span className="text-ink-700">{s.serviceId.name}</span>
                      <span className="font-bold text-ink-900">{formatCurrency(s.price)}</span>
                    </div>
                  ))}
                  {details.services.length === 0 && <p className="text-sm text-ink-400">No services offered yet.</p>}
                </div>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-bold text-ink-900">Reviews ({details.reviews.length})</h4>
                <div className="max-h-56 space-y-2 overflow-y-auto">
                  {details.reviews.map((r) => (
                    <div key={r._id} className="rounded-lg bg-ink-50 p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-ink-800">{r.customerId?.name}</span>
                        <RatingStars rating={r.rating} showValue={false} />
                      </div>
                      {r.comment && <p className="mt-1 text-xs text-ink-500">{r.comment}</p>}
                    </div>
                  ))}
                  {details.reviews.length === 0 && <p className="text-sm text-ink-400">No reviews yet.</p>}
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-bold text-ink-900">Bookings ({details.bookings.length})</h4>
              <div className="max-h-56 space-y-2 overflow-y-auto">
                {details.bookings.map((b) => (
                  <div key={b._id} className="flex items-center justify-between rounded-lg bg-ink-50 p-3 text-sm">
                    <span>
                      {b.serviceId?.name} · {b.customerId?.name}
                    </span>
                    <StatusBadge status={b.status} />
                  </div>
                ))}
                {details.bookings.length === 0 && <p className="text-sm text-ink-400">No bookings yet.</p>}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        onConfirm={runAction}
        isLoading={busy}
        variant={confirmAction ? CONFIRM_COPY[confirmAction.type].variant : 'primary'}
        title={confirmAction ? CONFIRM_COPY[confirmAction.type].title : ''}
        message={confirmAction ? CONFIRM_COPY[confirmAction.type].message : ''}
        confirmLabel={confirmAction ? CONFIRM_COPY[confirmAction.type].label : ''}
      />
    </div>
  );
};

export default ProvidersPage;
