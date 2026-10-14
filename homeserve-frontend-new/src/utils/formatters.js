import { format, parseISO } from 'date-fns';

export const formatDate = (dateStr, pattern = 'dd MMM yyyy') => {
  if (!dateStr) return '-';
  try {
    return format(typeof dateStr === 'string' ? parseISO(dateStr) : dateStr, pattern);
  } catch {
    return '-';
  }
};

export const formatDateTime = (dateStr) => formatDate(dateStr, 'dd MMM yyyy, hh:mm a');

export const formatCurrency = (amount) => {
  const value = Number(amount || 0);
  return `Rs ${value.toLocaleString('en-IN')}`;
};

export const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.';


export const formatTimeSlot = (slot) => {
  if (!slot) return '-';
  const [h, m] = slot.split(':').map(Number);
  if (Number.isNaN(h)) return slot;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m || 0).padStart(2, '0')} ${suffix}`;
};


export const formatLongDate = (yyyyMmDd) => {
  if (!yyyyMmDd) return '-';
  return new Date(`${yyyyMmDd}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const todayISO = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
