import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, LayoutGrid, Pencil, Trash2, Power } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
} from '../../features/category/categorySlice';
import { getErrorMessage } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import ImageUploadInput from '../../components/common/ImageUploadInput';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/ui/PageHeader';
import PageLoader from '../../components/ui/PageLoader';
import Textarea from '../../components/ui/Textarea';

const CategoriesPage = () => {
  const dispatch = useAppDispatch();
  const { list: categories, status } = useAppSelector((s) => s.category);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    dispatch(fetchCategories({ limit: 100 }));
  }, [dispatch]);

  const openCreate = () => {
    setEditing(null);
    setImageFile(null);
    reset({ name: '', description: '' });
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setImageFile(null);
    reset({ name: cat.name, description: cat.description });
    setModalOpen(true);
  };

  const onSubmit = async (values) => {
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('description', values.description || '');
      if (imageFile) formData.append('image', imageFile);

      if (editing) {
        await dispatch(updateCategory({ id: editing._id, formData })).unwrap();
        toast.success('Category updated');
      } else {
        await dispatch(createCategory(formData)).unwrap();
        toast.success('Category created');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(getErrorMessage({ message: err }));
    }
  };

  const handleToggle = async (cat) => {
    try {
      await dispatch(toggleCategoryStatus(cat._id)).unwrap();
      toast.success('Status updated');
    } catch (err) {
      toast.error(getErrorMessage({ message: err }));
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await dispatch(deleteCategory(deleting._id)).unwrap();
      toast.success('Category deleted');
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
        title="Categories"
        subtitle="Organize services under categories customers can browse."
        actions={
          <Button icon={Plus} onClick={openCreate}>
            New category
          </Button>
        }
      />

      {status === 'loading' && categories.length === 0 ? (
        <PageLoader label="Loading categories..." />
      ) : categories.length === 0 ? (
        <EmptyState icon={LayoutGrid} title="No categories yet" description="Create your first category to start adding services." actionLabel="New category" onAction={openCreate} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div key={cat._id} className="card overflow-hidden" style={{ padding: 0 }}>
              <div className="h-28 w-full bg-brand-gradient">
                {cat.image && <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" />}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-ink-900">{cat.name}</h3>
                  <span className={`badge ${cat.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-ink-100 text-ink-500'}`}>{cat.status}</span>
                </div>
                {cat.description && <p className="mt-1 line-clamp-2 text-xs text-ink-500">{cat.description}</p>}
                <div className="mt-4 flex gap-1 border-t border-ink-100 pt-3">
                  <Button variant="outline" size="sm" icon={Pencil} onClick={() => openEdit(cat)} className="flex-1">
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" icon={Power} onClick={() => handleToggle(cat)}>
                    Toggle
                  </Button>
                  <Button variant="ghost" size="sm" icon={Trash2} className="text-rose-500" onClick={() => setDeleting(cat)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit category' : 'New category'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
              {editing ? 'Save changes' : 'Create category'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <ImageUploadInput label="Category image" shape="square" currentImageUrl={editing?.image} onChange={setImageFile} />
          <Input label="Name" error={errors.name?.message} {...register('name', { required: 'Name is required' })} />
          <Textarea label="Description" {...register('description')} />
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        isLoading={busy}
        title="Delete this category?"
        message="This only works if no services are linked to it. Consider deactivating instead."
        confirmLabel="Delete"
      />
    </div>
  );
};

export default CategoriesPage;
