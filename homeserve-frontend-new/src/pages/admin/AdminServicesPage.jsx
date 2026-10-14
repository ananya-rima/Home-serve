import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Package, Pencil, Trash2, Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchServices, createService, updateService, deleteService } from '../../features/service/serviceSlice';
import { fetchCategories } from '../../features/category/categorySlice';
import { useDebounce } from '../../hooks/useDebounce';
import { formatCurrency, getErrorMessage } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import ImageUploadInput from '../../components/common/ImageUploadInput';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/ui/PageHeader';
import PageLoader from '../../components/ui/PageLoader';
import Pagination from '../../components/ui/Pagination';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';

const AdminServicesPage = () => {
  const dispatch = useAppDispatch();
  const { list: services, meta, status } = useAppSelector((s) => s.service);
  const categories = useAppSelector((s) => s.category.list);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const dSearch = useDebounce(search, 400);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    dispatch(fetchCategories({ limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchServices({ page, limit: 9, search: dSearch || undefined, status: undefined }));
  }, [dispatch, page, dSearch]);

  const openCreate = () => {
    setEditing(null);
    setImageFile(null);
    reset({ name: '', categoryId: '', basePrice: '', duration: '', description: '', status: 'active' });
    setModalOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setImageFile(null);
    reset({
      name: s.name,
      categoryId: s.categoryId?._id || s.categoryId,
      basePrice: s.basePrice,
      duration: s.duration,
      description: s.description,
      status: s.status,
    });
    setModalOpen(true);
  };

  const onSubmit = async (values) => {
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('categoryId', values.categoryId);
      formData.append('basePrice', values.basePrice);
      formData.append('duration', values.duration);
      formData.append('description', values.description || '');
      formData.append('status', values.status || 'active');
      if (imageFile) formData.append('image', imageFile);

      if (editing) {
        await dispatch(updateService({ id: editing._id, formData })).unwrap();
        toast.success('Service updated');
      } else {
        await dispatch(createService(formData)).unwrap();
        toast.success('Service created');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(getErrorMessage({ message: err }));
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await dispatch(deleteService(deleting._id)).unwrap();
      toast.success('Service deleted');
      setDeleting(null);
    } catch (err) {
      toast.error(getErrorMessage({ message: err }));
    } finally {
      setBusy(false);
    }
  };

  const categoryOptions = categories.map((c) => ({ value: c._id, label: c.name }));

  return (
    <div>
      <PageHeader
        title="Services"
        subtitle="Manage the full service catalogue providers can offer."
        actions={
          <Button icon={Plus} onClick={openCreate}>
            New service
          </Button>
        }
      />

      <div className="mb-5 max-w-sm">
        <Input icon={Search} placeholder="Search services" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>

      {status === 'loading' && services.length === 0 ? (
        <PageLoader label="Loading services..." />
      ) : services.length === 0 ? (
        <EmptyState icon={Package} title="No services found" description="Create your first service to get started." actionLabel="New service" onAction={openCreate} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <div key={s._id} className="card overflow-hidden" style={{ padding: 0 }}>
                <div className="h-28 w-full bg-brand-gradient">{s.image && <img src={s.image} alt={s.name} className="h-full w-full object-cover" />}</div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-ink-900">{s.name}</h3>
                    <span className={`badge ${s.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-ink-100 text-ink-500'}`}>{s.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-ink-400">{s.categoryId?.name}</p>
                  <p className="mt-2 font-display text-xl font-extrabold text-brand-700">{formatCurrency(s.basePrice)}</p>
                  <div className="mt-4 flex gap-1 border-t border-ink-100 pt-3">
                    <Button variant="outline" size="sm" icon={Pencil} onClick={() => openEdit(s)} className="flex-1">
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" icon={Trash2} className="text-rose-500" onClick={() => setDeleting(s)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Pagination meta={meta} onPageChange={setPage} />
          </div>
        </>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit service' : 'New service'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
              {editing ? 'Save changes' : 'Create service'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <ImageUploadInput label="Service image" shape="square" currentImageUrl={editing?.image} onChange={setImageFile} />
          <Input label="Name" error={errors.name?.message} {...register('name', { required: 'Name is required' })} />
          <Select label="Category" placeholder="Select category" options={categoryOptions} error={errors.categoryId?.message} {...register('categoryId', { required: 'Category is required' })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Base price (Rs)" type="number" min="0" error={errors.basePrice?.message} {...register('basePrice', { required: 'Required' })} />
            <Input label="Duration (min)" type="number" min="1" error={errors.duration?.message} {...register('duration', { required: 'Required' })} />
          </div>
          <Textarea label="Description" {...register('description')} />
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
        title="Delete this service?"
        message="Providers offering this service will no longer be able to accept bookings for it."
        confirmLabel="Delete"
      />
    </div>
  );
};

export default AdminServicesPage;
