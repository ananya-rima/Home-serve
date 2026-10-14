import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShieldCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { verifyOtp, resendOtp } from '../../features/auth/authSlice';
import { getErrorMessage } from '../../utils/formatters';
import { ROLE_HOME_PATH } from '../../utils/roleHome';
import Button from '../../components/ui/Button';

const OTP_LENGTH = 6;

const VerifyOtpPage = () => {
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [resendCooldown, setResendCooldown] = useState(30);
  const inputRefs = useRef([]);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { pendingOtp, status } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (!pendingOtp) {
      navigate('/login');
    }
  }, [pendingOtp, navigate]);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...digits];
    next[index] = value.slice(-1);
    setDigits(next);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    setDigits(pasted.split('').concat(Array(OTP_LENGTH).fill('')).slice(0, OTP_LENGTH));
  };

  const otp = digits.join('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== OTP_LENGTH) {
      toast.error('Enter the complete 6-digit code');
      return;
    }
    try {
      const result = await dispatch(verifyOtp({ email: pendingOtp.email, otp })).unwrap();
      toast.success('Login successful!');
      const from = location.state?.from;
      const canReturn = from?.pathname && result.user.role === 'customer' && from.pathname.startsWith('/customer');
      navigate(canReturn ? `${from.pathname}${from.search || ''}` : ROLE_HOME_PATH[result.user.role] || '/');
    } catch (err) {
      toast.error(getErrorMessage({ message: err }));
    }
  };

  const handleResend = async () => {
    try {
      await dispatch(resendOtp({ email: pendingOtp.email })).unwrap();
      toast.success('A new OTP has been sent');
      setResendCooldown(30);
    } catch (err) {
      toast.error(getErrorMessage({ message: err }));
    }
  };

  if (!pendingOtp) return null;

  return (
    <div className="animate-fadeIn">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <ShieldCheck className="h-6 w-6" />
      </div>
      <h1 className="mt-4 text-2xl font-bold text-ink-950">Verify your email</h1>
      <p className="mt-1.5 text-sm text-ink-500">
        Enter the 6-digit code sent to <span className="font-semibold text-ink-800">{pendingOtp.email}</span>. It expires in{' '}
        {pendingOtp.otpExpiresInMinutes} minutes.
      </p>

      <form onSubmit={handleSubmit} className="mt-8">
        <div className="flex justify-between gap-2" onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              maxLength={1}
              inputMode="numeric"
              className="h-14 w-12 rounded-xl border border-ink-200 text-center text-xl font-bold text-ink-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/40"
            />
          ))}
        </div>

        <Button type="submit" className="mt-6 w-full" isLoading={status === 'loading'}>
          Verify & Continue
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Didn't get the code?{' '}
        <button
          onClick={handleResend}
          disabled={resendCooldown > 0}
          className="font-semibold text-brand-700 hover:underline disabled:cursor-not-allowed disabled:text-ink-400 disabled:no-underline"
        >
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
        </button>
      </p>
    </div>
  );
};

export default VerifyOtpPage;
