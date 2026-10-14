import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { User, Phone, Mail, CalendarDays, ShieldCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchCustomerProfile, updateCustomerProfile } from '../../features/customer/customerSlice';
import { fetchCurrentUser } from '../../features/auth/authSlice';
import { formatDate, getErrorMessage } from '../../utils/formatters';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import PageHeader from '../../components/ui/PageHeader';
import PageLoader from '../../components/ui/PageLoader';
import ImageUploadInput from '../../components/common/ImageUploadInput';

const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector((s) => s.customer);
  const [imageFile, setImageFile] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    dispatch(fetchCustomerProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) reset({ name: profile.name, phone: profile.phone });
  }, [profile, reset]);

  const onSubmit = async (values) => {
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('phone', values.phone);
      if (imageFile) formData.append('profileImage', imageFile);

      await dispatch(updateCustomerProfile(formData)).unwrap();
      await dispatch(fetchCurrentUser()); 
      setImageFile(null);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(getErrorMessage({ message: err }));
    }
  };

  if (!profile) return <PageLoader label="Loading profile..." />;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="My Profile" subtitle="Manage your personal information." />

      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <Card className="flex flex-col items-center text-center">
          <Avatar src={profile.profileImage} name={profile.name} size="h-24 w-24 text-2xl" />
          <h2 className="mt-4 text-lg font-bold text-ink-900">{profile.name}</h2>
          <p className="text-sm text-ink-500">{profile.email}</p>
          <div className="mt-5 w-full space-y-2 border-t border-ink-100 pt-4 text-left text-sm">
            <p className="flex items-center gap-2 text-ink-600">
              <CalendarDays className="h-4 w-4 text-ink-400" /> Member since {formatDate(profile.createdAt, 'MMM yyyy')}
            </p>
            <p className="flex items-center gap-2 text-ink-600">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Account <b className="capitalize">{profile.status}</b>
            </p>
          </div>
        </Card>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <ImageUploadInput label="Profile photo" currentImageUrl={profile.profileImage} onChange={setImageFile} />
            <Input label="Full name" icon={User} error={errors.name?.message} {...register('name', { required: 'Name is required' })} />
            <Input label="Phone" icon={Phone} error={errors.phone?.message} {...register('phone', { required: 'Phone is required' })} />
            <Input label="Email" icon={Mail} value={profile.email} disabled hint="Email can't be changed" readOnly />
            <div className="flex justify-end">
              <Button type="submit" isLoading={isSubmitting}>
                Save changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
