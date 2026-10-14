import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Wrench, Pencil, Trash2, Clock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchMyServices,
  addOfferedService,
  updateMyService,
  removeMyService,
} from '../../features/provider/providerSlice';
import { fetchServices } from '../../features/service/serviceSlice';
import { formatCurrency, getErrorMessage } from '../../utils/formatters';
import ApprovalBanner from '../../components/common/ApprovalBanner';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/ui/PageHeader';
import PageLoader from '../../components/ui/PageLoader';
import Select from '../../components/ui/Select';

const MyServicesPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { myServices, status } = useAppSelector((s) => s.provider);
  const allServices = useAppSelector((s) => s.service.list);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    dispatch(fetchMyServices());
    dispatch(fetchServices({ limit: 200, status: 'active' }));
  }, [dispatch]);

  const offeredServiceIds = useMemo(() => new Set(myServices.map((ps) => ps.serviceId?._id)), [myServices]);
  const availableToAdd = allServices.filter((s) => !offeredServiceIds.has(s._id));

  const openAdd = () => {
    setEditing(null);
    reset({ serviceId: '', price: '', experience: '' });
    setModalOpen(true);
  };

  const openEdit = (ps) => {
    setEditing(ps);
    reset({ price: ps.price, status: ps.status });
    setModalOpen(true);
  };

  const onSubmit = async (values) => {
    try {
      if (editing) {
        await dispatch(updateMyService({ id: editing._id, payload: { price: Number(values.price), status: values.status } })).unwrap();
        toast.success('Service updated');
      } else {
        await dispatch(addOfferedService({ serviceId: values.serviceId, price: Number(values.price), experience: Number(values.experience) || 0 })).unwrap();
        toast.success('Service added to your profile');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(getErrorMessage({ message: err }));
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await dispatch(removeMyService(deleting._id)).unwrap();
      toast.success('Service removed');
      setDeleting(null);
    } catch (err) {
      toast.error(getErrorMessage({ message: err }));
    } finally {
      setBusy(false);
    }
  };

  if (!user?.isApproved) {
    return (
      <div>
        <PageHeader title="My Services" subtitle="Offer services from the admin catalogue with your own price." />
        <ApprovalBanner user={user} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="My Services"
        subtitle="Offer services from the admin catalogue with your own price."
        actions={
          <Button icon={Plus} onClick={openAdd} disabled={availableToAdd.length === 0}>
            Add service
          </Button>
        }
      />

      {status === 'loading' && myServices.length === 0 ? (
        <PageLoader label="Loading your services..." />
      ) : myServices.length === 0 ? (
        <EmptyState icon={Wrench} title="You haven't offered any services yet" description="Add a service from the catalogue to start receiving bookings." actionLabel="Add your first service" onAction={openAdd} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myServices
            .filter((ps) => ps.serviceId)
            .map((ps) => (
              <Card key={ps._id}>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-ink-900">{ps.serviceId.name}</h3>
                  <span className={`badge ${ps.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-ink-100 text-ink-500'}`}>{ps.status}</span>
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-500">
                  <Clock className="h-3.5 w-3.5" /> {ps.serviceId.duration} min · base {formatCurrency(ps.serviceId.basePrice)}
                </p>
                <p className="mt-3 font-display text-2xl font-extrabold text-brand-700">{formatCurrency(ps.price)}</p>
                <div className="mt-4 flex gap-2 border-t border-ink-100 pt-4">
                  <Button variant="outline" size="sm" icon={Pencil} onClick={() => openEdit(ps)} className="flex-1">
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" icon={Trash2} className="text-rose-500" onClick={() => setDeleting(ps)}>
                    Remove
                  </Button>
                </div>
              </Card>
            ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit service pricing' : 'Add a service'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
              {editing ? 'Save changes' : 'Add service'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!editing && (
            <Select
              label="Service"
              placeholder="Choose from catalogue"
              options={availableToAdd.map((s) => ({ value: s._id, label: `${s.name} (base ${formatCurrency(s.basePrice)})` }))}
              error={errors.serviceId?.message}
              {...register('serviceId', { required: 'Please select a service' })}
            />
          )}
          <Input label="Your price (Rs)" type="number" min="0" error={errors.price?.message} {...register('price', { required: 'Price is required' })} />
          {!editing && <Input label="Years of experience with this service" type="number" min="0" {...register('experience')} />}
          {editing && (
            <Select label="Status" options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} {...register('status')} />
          )}
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        isLoading={busy}
        title="Remove this service?"
        message="Customers will no longer be able to book this service from you."
        confirmLabel="Remove"
      />
    </div>
  );
};

export default MyServicesPage;
