import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { User, Phone, MapPin, Briefcase, FileText, CalendarDays, Star } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchProviderProfile, updateProviderProfile } from '../../features/provider/providerSlice';
import { fetchCurrentUser } from '../../features/auth/authSlice';
import { formatDate, getErrorMessage } from '../../utils/formatters';
import ApprovalBanner from '../../components/common/ApprovalBanner';
import ImageUploadInput from '../../components/common/ImageUploadInput';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import PageHeader from '../../components/ui/PageHeader';
import PageLoader from '../../components/ui/PageLoader';
import RatingStars from '../../components/ui/RatingStars';
import Textarea from '../../components/ui/Textarea';

const ProviderProfilePage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { profile, completedJobs, ratingSummary } = useAppSelector((s) => s.provider);
  const [imageFile, setImageFile] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    dispatch(fetchProviderProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        phone: profile.phone,
        location: profile.location,
        experience: profile.experience,
        description: profile.description,
        skills: profile.skills?.join(', '),
        serviceAreas: profile.serviceAreas?.join(', '),
      });
    }
  }, [profile, reset]);

  const onSubmit = async (values) => {
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('phone', values.phone);
      formData.append('location', values.location || '');
      formData.append('experience', values.experience || 0);
      formData.append('description', values.description || '');
      (values.skills || '').split(',').map((s) => s.trim()).filter(Boolean).forEach((s) => formData.append('skills', s));
      (values.serviceAreas || '').split(',').map((s) => s.trim()).filter(Boolean).forEach((s) => formData.append('serviceAreas', s));
      if (imageFile) formData.append('profileImage', imageFile);

      await dispatch(updateProviderProfile(formData)).unwrap();
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
      <PageHeader title="My Profile" subtitle="This is what customers see before they book you." />
      <ApprovalBanner user={user} />

      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <Card className="flex flex-col items-center text-center">
          <Avatar src={profile.profileImage} name={profile.name} size="h-24 w-24 text-2xl" />
          <h2 className="mt-4 text-lg font-bold text-ink-900">{profile.name}</h2>
          <p className="text-sm text-ink-500">{profile.email}</p>
          <div className="mt-4">
            <RatingStars rating={ratingSummary.avgRating} />
            <p className="mt-1 text-xs text-ink-400">{ratingSummary.totalReviews} reviews</p>
          </div>
          <div className="mt-5 w-full space-y-2 border-t border-ink-100 pt-4 text-left text-sm">
            <p className="flex items-center gap-2 text-ink-600">
              <CalendarDays className="h-4 w-4 text-ink-400" /> Joined {formatDate(profile.createdAt, 'MMM yyyy')}
            </p>
            <p className="flex items-center gap-2 text-ink-600">
              <Star className="h-4 w-4 text-ink-400" /> {completedJobs} jobs completed
            </p>
            <p className="text-ink-600">
              Status:{' '}
              <span className={`font-semibold ${profile.isApproved ? 'text-emerald-600' : 'text-amber-600'}`}>
                {profile.isApproved ? 'Approved' : profile.approvalStatus || 'Pending'}
              </span>
            </p>
          </div>
        </Card>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <ImageUploadInput label="Profile photo" currentImageUrl={profile.profileImage} onChange={setImageFile} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Full name" icon={User} error={errors.name?.message} {...register('name', { required: 'Name is required' })} />
              <Input label="Phone" icon={Phone} error={errors.phone?.message} {...register('phone', { required: 'Phone is required' })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Location" icon={MapPin} placeholder="e.g. Dhanmondi, Dhaka" {...register('location')} />
              <Input label="Years of experience" type="number" min="0" icon={Briefcase} {...register('experience')} />
            </div>
            <Textarea label="About you" icon={FileText} placeholder="Tell customers about your expertise..." {...register('description')} />
            <Input label="Skills (comma separated)" placeholder="AC Repair, Wiring" {...register('skills')} />
            <Input label="Service areas (comma separated)" placeholder="Dhanmondi, Mirpur" {...register('serviceAreas')} />
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

export default ProviderProfilePage;
