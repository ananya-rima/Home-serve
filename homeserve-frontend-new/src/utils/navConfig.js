import {
  LayoutDashboard,
  Wrench,
  CalendarClock,
  Wallet,
  Star,
  UserCircle,
  MapPin,
  ClipboardList,
  ListChecks,
  CheckCircle2,
  Users,
  ShieldCheck,
  LayoutGrid,
  Package,
  CalendarCheck,
  MessageSquareWarning,
  BarChart3,
} from 'lucide-react';

export const CUSTOMER_NAV = [
  { label: 'Browse Services', to: '/customer/services', icon: LayoutGrid },
  { label: 'Find Providers', to: '/customer/providers', icon: Users },
  { label: 'My Bookings', to: '/customer/bookings', icon: CalendarClock },
  { label: 'Addresses', to: '/customer/addresses', icon: MapPin },
  { label: 'My Reviews', to: '/customer/reviews', icon: Star },
  { label: 'Complaints', to: '/customer/complaints', icon: MessageSquareWarning },
  { label: 'Profile', to: '/customer/profile', icon: UserCircle },
];

export const PROVIDER_NAV = [
  { label: 'Dashboard', to: '/provider/dashboard', icon: LayoutDashboard },
  { label: 'My Services', to: '/provider/services', icon: Wrench },
  { label: 'Availability', to: '/provider/availability', icon: CalendarClock },
  { label: 'Booking Requests', to: '/provider/bookings/requests', icon: ClipboardList },
  { label: 'Active Bookings', to: '/provider/bookings/active', icon: ListChecks },
  { label: 'Completed Bookings', to: '/provider/bookings/completed', icon: CheckCircle2 },
  { label: 'Earnings', to: '/provider/earnings', icon: Wallet },
  { label: 'Reviews', to: '/provider/reviews', icon: Star },
  { label: 'Profile', to: '/provider/profile', icon: UserCircle },
];

export const ADMIN_NAV = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Customers', to: '/admin/customers', icon: Users },
  { label: 'Providers', to: '/admin/providers', icon: ShieldCheck },
  { label: 'Categories', to: '/admin/categories', icon: LayoutGrid },
  { label: 'Services', to: '/admin/services', icon: Package },
  { label: 'Bookings', to: '/admin/bookings', icon: CalendarCheck },
  { label: 'Reviews', to: '/admin/reviews', icon: Star },
  { label: 'Complaints', to: '/admin/complaints', icon: MessageSquareWarning },
  { label: 'Reports', to: '/admin/reports', icon: BarChart3 },
];
