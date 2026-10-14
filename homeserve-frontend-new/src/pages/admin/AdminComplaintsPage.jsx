import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { MessageSquareWarning } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchAdminComplaints, updateAdminComplaint } from '../../features/admin/adminSlice';
import { formatDate, formatDateTime, getErrorMessage } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ComplaintStatusBadge from '../../components/common/ComplaintStatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/ui/PageHeader';
import PageLoader from '../../components/ui/PageLoader';
import Pagination from '../../components/ui/Pagination';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'in-review', label: 'In Review' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' },
];

const AdminComplaintsPage = () => {
  const dispatch = useAppDispatch();
  const [params, setParams] = useSearchParams();
  const { complaints, complaintsMeta, status } = useAppSelector((s) => s.admin);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);

  const statusFilter = params.get('status') || '';

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm();

  useEffect(() => {
    dispatch(fetchAdminComplaints({ page, limit: 10, status: statusFilter || undefined }));
  }, [dispatch, page, statusFilter]);

  const setStatusFilter = (value) => {
    const next = new URLSearchParams(params);
    if (value) next.set('status', value);
    else next.delete('status');
    setParams(next, { replace: true });
    setPage(1);
  };

  const openEdit = (c) => {
    setEditing(c);
    reset({ status: c.status, adminRemark: c.adminRemark || '' });
  };

  const onSubmit = async (values) => {
    try {
      await dispatch(updateAdminComplaint({ id: editing._id, payload: values })).unwrap();
      toast.success('Complaint updated');
      setEditing(null);
    } catch (err) {
      toast.error(getErrorMessage({ message: err }));
    }
  };

  return (
    <div>
      <PageHeader title="Complaints" subtitle="Review and resolve customer complaints." />

      <div className="mb-5 w-52">
        <Select placeholder="All statuses" options={STATUS_OPTIONS} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
      </div>

      {status === 'loading' && complaints.length === 0 ? (
        <PageLoader label="Loading complaints..." />
      ) : complaints.length === 0 ? (
        <EmptyState icon={MessageSquareWarning} title="No complaints found" description="Complaints raised by customers will appear here." />
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => (
            <Card key={c._id} className="cursor-pointer transition-shadow hover:shadow-floating" onClick={() => openEdit(c)}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-ink-900">{c.subject}</h3>
                  <p className="mt-0.5 text-xs text-ink-400">
                    {c.customerId?.name} vs {c.providerId?.name} · {formatDate(c.bookingId?.bookingDate)} · Raised {formatDateTime(c.createdAt)}
                  </p>
                </div>
                <ComplaintStatusBadge status={c.status} />
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-ink-600">{c.description}</p>
            </Card>
          ))}
          <Pagination meta={complaintsMeta} onPageChange={setPage} />
        </div>
      )}

      <Modal
        isOpen={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Manage complaint"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
              Save
            </Button>
          </>
        }
      >
        {editing && (
          <div className="space-y-4">
            <div className="rounded-xl bg-ink-50 p-4 text-sm">
              <p className="font-bold text-ink-900">{editing.subject}</p>
              <p className="mt-1 text-ink-600">{editing.description}</p>
              <p className="mt-2 text-xs text-ink-400">
                {editing.customerId?.name} vs {editing.providerId?.name}
              </p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Select label="Status" options={STATUS_OPTIONS} {...register('status')} />
              <Textarea label="Resolution remark" placeholder="Notes visible to the customer..." {...register('adminRemark')} />
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminComplaintsPage;
