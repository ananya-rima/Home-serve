import { Clock, XCircle } from 'lucide-react';


const ApprovalBanner = ({ user }) => {
  if (!user || user.isApproved) return null;

  const rejected = user.approvalStatus === 'rejected';
  const Icon = rejected ? XCircle : Clock;

  return (
    <div
      className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 ${
        rejected ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-amber-200 bg-amber-50 text-amber-800'
      }`}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="text-sm">
        <p className="font-bold">{rejected ? 'Your provider application was rejected' : 'Your account is awaiting admin approval'}</p>
        <p className="mt-0.5 opacity-90">
          {rejected
            ? 'You can\'t offer services or accept bookings. Please contact support for more information.'
            : 'Until you\'re approved you can complete your profile, but you can\'t offer services or receive bookings yet.'}
        </p>
      </div>
    </div>
  );
};

export default ApprovalBanner;
