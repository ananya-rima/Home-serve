import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { loginUser, setPendingOtp } from '../../features/auth/authSlice';
import { getErrorMessage } from '../../utils/formatters';
import { ROLE_HOME_PATH } from '../../utils/roleHome';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status } = useAppSelector((s) => s.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

 
  const resolveDestination = (role) => {
    const from = location.state?.from;
    const canReturn = from?.pathname && role === 'customer' && from.pathname.startsWith('/customer');
    return canReturn ? `${from.pathname}${from.search || ''}` : ROLE_HOME_PATH[role] || '/';
  };

  const onSubmit = async (values) => {
    try {
      const result = await dispatch(loginUser(values)).unwrap();
      toast.success('Welcome back!');
      navigate(resolveDestination(result.user.role));
    } catch (err) {
      
      if (typeof err === 'string' && err.toLowerCase().includes('not verified')) {
        dispatch(setPendingOtp({ email: values.email, otpExpiresInMinutes: 5 }));
        toast('Please verify your email to continue - we sent you a new code.');
        navigate('/verify-otp', { state: { from: location.state?.from } });
        return;
      }
      toast.error(getErrorMessage({ message: err }));
    }
  };

  return (
    <div className="animate-fadeIn">
      <h1 className="text-2xl font-bold text-ink-950">Welcome back</h1>
      <p className="mt-1.5 text-sm text-ink-500">Log in to continue to your HomeServe account.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <Input
          label="Email"
          type="email"
          icon={Mail}
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email', { required: 'Email is required' })}
        />
        <Input
          label="Password"
          type="password"
          icon={Lock}
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password', { required: 'Password is required' })}
        />

        <Button type="submit" className="w-full" isLoading={status === 'loading'}>
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        New to HomeServe?{' '}
        <Link to="/register" className="font-semibold text-brand-700 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
