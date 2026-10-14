export const ROLES = {
  CUSTOMER: 'customer',
  PROVIDER: 'provider',
  ADMIN: 'admin',
};

export const BOOKING_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  ON_THE_WAY: 'OnTheWay',
  STARTED: 'Started',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
};

export const BOOKING_STATUS_LABEL = {
  Pending: 'Pending',
  Confirmed: 'Confirmed',
  OnTheWay: 'On The Way',
  Started: 'In Progress',
  Completed: 'Completed',
  Rejected: 'Rejected',
  Cancelled: 'Cancelled',
};


export const BOOKING_STATUS_STYLE = {
  Pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  Confirmed: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  OnTheWay: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
  Started: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
  Completed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  Rejected: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
  Cancelled: 'bg-ink-100 text-ink-600 ring-1 ring-ink-200',
};

export const WEEK_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const TOKEN_STORAGE_KEY = 'homeserve_access_token';
export const REFRESH_STORAGE_KEY = 'homeserve_refresh_token';
export const USER_STORAGE_KEY = 'homeserve_user';

export const COMPLAINT_STATUS_LABEL = {
  open: 'Open',
  'in-review': 'In Review',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

export const COMPLAINT_STATUS_STYLE = {
  open: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  'in-review': 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  resolved: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
};


export const COMPLAINT_ELIGIBLE_STATUSES = ['Confirmed', 'OnTheWay', 'Started', 'Completed', 'Cancelled', 'Rejected'];


export const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
];
