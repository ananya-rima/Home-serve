import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Home, Briefcase, MapPin, Plus, Pencil, Trash2, Star } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../../features/customer/customerSlice';
import { getErrorMessage } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/ui/PageHeader';
import PageLoader from '../../components/ui/PageLoader';
import Select from '../../components/ui/Select';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const LABEL_ICON = { Home, Office: Briefcase, Other: MapPin };
const LABEL_OPTIONS = ['Home', 'Office', 'Other'].map((l) => ({ value: l, label: l }));
const EMPTY = { label: 'Home', houseNo: '', street: '', area: '', city: '', state: '', pincode: '', isDefault: false };

const AddressesPage = () => {
  const dispatch = useAppDispatch();
  const { addresses, status } = useAppSelector((s) => s.customer);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: EMPTY });

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  const openCreate = () => {
    setEditing(null);
    reset(EMPTY);
    setModalOpen(true);
  };

  const openEdit = (address) => {
    setEditing(address);
    reset({ ...EMPTY, ...address });
    setModalOpen(true);
  };

  const onSubmit = async (values) => {
    try {
      const payload = {
        label: values.label,
        houseNo: values.houseNo,
        street: values.street,
        area: values.area,
        city: values.city,
        state: values.state,
        pincode: values.pincode,
        isDefault: Boolean(values.isDefault),
      };
      if (editing) {
        await dispatch(updateAddress({ id: editing._id, payload })).unwrap();
        toast.success('Address updated');
      } else {
        await dispatch(createAddress(payload)).unwrap();
        toast.success('Address added');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(getErrorMessage({ message: err }));
    }
  };

  const handleDefault = async (id) => {
    try {
      await dispatch(setDefaultAddress(id)).unwrap();
      toast.success('Default address updated');
    } catch (err) {
      toast.error(getErrorMessage({ message: err }));
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await dispatch(deleteAddress(deleting._id)).unwrap();
      toast.success('Address deleted');
      setDeleting(null);
    } catch (err) {
      toast.error(getErrorMessage({ message: err }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="My Addresses"
        subtitle="Save places where you'd like services delivered."
        actions={
          <Button icon={Plus} onClick={openCreate}>
            Add address
          </Button>
        }
      />

      {status === 'loading' && addresses.length === 0 ? (
        <PageLoader label="Loading addresses..." />
      ) : addresses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No addresses yet"
          description="Add your home or office address to make booking faster."
          actionLabel="Add your first address"
          onAction={openCreate}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => {
            const Icon = LABEL_ICON[a.label] || MapPin;
            return (
              <Card key={a._id} className={a.isDefault ? 'ring-2 ring-brand-500' : ''}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-bold text-ink-900">{a.label}</p>
                      {a.isDefault && <span className="badge bg-brand-100 text-brand-700">Default</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(a)} className="rounded-lg p-2 text-ink-400 hover:bg-ink-100 hover:text-ink-700" aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeleting(a)} className="rounded-lg p-2 text-ink-400 hover:bg-rose-50 hover:text-rose-600" aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="mt-4 text-sm text-ink-600">
                  {a.houseNo}, {a.street}
                  <br />
                  {a.area}, {a.city}, {a.state} - {a.pincode}
                </p>
                {!a.isDefault && (
                  <Button variant="subtle" size="sm" icon={Star} className="mt-4" onClick={() => handleDefault(a._id)}>
                    Make default
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit address' : 'Add new address'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
              {editing ? 'Save changes' : 'Add address'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select label="Label" options={LABEL_OPTIONS} {...register('label')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="House / Flat no." error={errors.houseNo?.message} {...register('houseNo', { required: 'Required' })} />
            <Input label="Street" error={errors.street?.message} {...register('street', { required: 'Required' })} />
          </div>
          <Input label="Area" error={errors.area?.message} {...register('area', { required: 'Required' })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="City" error={errors.city?.message} {...register('city', { required: 'Required' })} />
            <Input label="State" error={errors.state?.message} {...register('state', { required: 'Required' })} />
          </div>
          <Input label="Pincode" error={errors.pincode?.message} {...register('pincode', { required: 'Required' })} />
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink-700">
            <input type="checkbox" className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-400" {...register('isDefault')} />
            Set as my default address
          </label>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        isLoading={busy}
        title="Delete this address?"
        message="This address will be removed from your account. Existing bookings are not affected."
        confirmLabel="Delete"
      />
    </div>
  );
};

export default AddressesPage;
