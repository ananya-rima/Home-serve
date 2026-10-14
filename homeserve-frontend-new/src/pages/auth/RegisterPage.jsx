import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Phone, MapPin, Briefcase } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { registerUser } from '../../features/auth/authSlice';
import { getErrorMessage } from '../../utils/formatters';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const ROLE_TABS = [
  { value: 'customer', label: 'I need a service' },
  { value: 'provider', label: 'I provide services' },
];

const RegisterPage = () => {
  const [role, setRole] = useState('customer');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status } = useAppSelector((s) => s.auth);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (values) => {
    try {
      const payload = { ...values, role };
      if (role === 'provider') {
        payload.skills = values.skills ? values.skills.split(',').map((s) => s.trim()) : [];
        payload.serviceAreas = values.serviceAreas ? values.serviceAreas.split(',').map((s) => s.trim()) : [];
      }
      await dispatch(registerUser(payload)).unwrap();
      toast.success('Account created! Check your email for a verification code.');
      navigate('/verify-otp');
    } catch (err) {
      toast.error(getErrorMessage({ message: err }));
    }
  };

  return (
    <div className="animate-fadeIn">
      <h1 className="text-2xl font-bold text-ink-950">Create your account</h1>
      <p className="mt-1.5 text-sm text-ink-500">Join HomeServe as a customer or a service provider.</p>

      <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-ink-100 p-1">
        {ROLE_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setRole(tab.value)}
            className={`rounded-lg py-2 text-sm font-semibold transition ${
              role === tab.value ? 'bg-white text-brand-700 shadow-soft' : 'text-ink-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <Input
          label="Full Name"
          icon={User}
          placeholder="Jane Doe"
          error={errors.name?.message}
          {...register('name', { required: 'Name is required' })}
        />
        <Input
          label="Email"
          type="email"
          icon={Mail}
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email', { required: 'Email is required' })}
        />
        <Input
          label="Phone"
          icon={Phone}
          placeholder="017XXXXXXXX"
          error={errors.phone?.message}
          {...register('phone', { required: 'Phone is required' })}
        />

        {role === 'provider' && (
          <div className="space-y-4 rounded-xl border border-brand-100 bg-brand-50/50 p-4 animate-fadeIn">
            <Input
              label="Location"
              icon={MapPin}
              placeholder="e.g. Dhanmondi, Dhaka"
              {...register('location')}
            />
            <Input
              label="Years of Experience"
              type="number"
              icon={Briefcase}
              placeholder="3"
              {...register('experience')}
            />
            <Input label="Skills (comma separated)" placeholder="AC Repair, Wiring" {...register('skills')} />
            <Input
              label="Service Areas (comma separated)"
              placeholder="Dhanmondi, Mirpur"
              {...register('serviceAreas')}
            />
            <p className="text-xs text-ink-500">
              Your account will need admin approval before you can start accepting bookings.
            </p>
          </div>
        )}

        <Input
          label="Password"
          type="password"
          icon={Lock}
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'At least 6 characters' } })}
        />
        <Input
          label="Confirm Password"
          type="password"
          icon={Lock}
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (v) => v === password || 'Passwords do not match',
          })}
        />

        <Button type="submit" className="w-full" isLoading={status === 'loading'}>
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-700 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
