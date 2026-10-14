import { Routes, Route, Navigate } from 'react-router-dom';

import PublicLayout from '../layouts/PublicLayout';
import PublicPageContainer from '../layouts/PublicPageContainer';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import GuestRoute from './GuestRoute';
import ProtectedRoute from './ProtectedRoute';

import { CUSTOMER_NAV, PROVIDER_NAV, ADMIN_NAV } from '../utils/navConfig';


import HomePage from '../pages/shared/HomePage';
import NotFoundPage from '../pages/shared/NotFoundPage';
import ServicesPage from '../pages/shared/ServicesPage';
import ServiceDetailsPage from '../pages/shared/ServiceDetailsPage';
import ProvidersPage from '../pages/shared/ProvidersPage';
import ProviderDetailsPage from '../pages/shared/ProviderDetailsPage';


import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import VerifyOtpPage from '../pages/auth/VerifyOtpPage';


import BookingPage from '../pages/customer/BookingPage';
import BookingConfirmationPage from '../pages/customer/BookingConfirmationPage';
import MyBookingsPage from '../pages/customer/MyBookingsPage';
import BookingDetailsPage from '../pages/customer/BookingDetailsPage';
import AddressesPage from '../pages/customer/AddressesPage';
import ReviewsPage from '../pages/customer/ReviewsPage';
import ComplaintsPage from '../pages/customer/ComplaintsPage';
import ProfilePage from '../pages/customer/ProfilePage';


import ProviderDashboardPage from '../pages/provider/DashboardPage';
import ProviderProfilePage from '../pages/provider/ProviderProfilePage';
import MyServicesPage from '../pages/provider/MyServicesPage';
import AvailabilityPage from '../pages/provider/AvailabilityPage';
import BookingRequestsPage from '../pages/provider/BookingRequestsPage';
import ActiveBookingsPage from '../pages/provider/ActiveBookingsPage';
import CompletedBookingsPage from '../pages/provider/CompletedBookingsPage';
import EarningsPage from '../pages/provider/EarningsPage';
import ProviderReviewsPage from '../pages/provider/ProviderReviewsPage';


import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import CustomersPage from '../pages/admin/CustomersPage';
import AdminProvidersPage from '../pages/admin/ProvidersPage';
import CategoriesPage from '../pages/admin/CategoriesPage';
import AdminServicesPage from '../pages/admin/AdminServicesPage';
import AdminBookingsPage from '../pages/admin/AdminBookingsPage';
import AdminReviewsPage from '../pages/admin/AdminReviewsPage';
import AdminComplaintsPage from '../pages/admin/AdminComplaintsPage';
import ReportsPage from '../pages/admin/ReportsPage';
import AdminProfilePage from '../pages/admin/AdminProfilePage';

const AppRoutes = () => (
  <Routes>
    
    <Route element={<PublicLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route element={<PublicPageContainer />}>
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:id" element={<ServiceDetailsPage />} />
        <Route path="/providers" element={<ProvidersPage />} />
        <Route path="/providers/:id" element={<ProviderDetailsPage />} />
      </Route>
    </Route>

    
    <Route element={<GuestRoute />}>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
      </Route>
    </Route>

   
    <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
      <Route path="/customer" element={<DashboardLayout navItems={CUSTOMER_NAV} roleLabel="Customer" />}>
        <Route index element={<Navigate to="services" replace />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="services/:id" element={<ServiceDetailsPage />} />
        <Route path="providers" element={<ProvidersPage />} />
        <Route path="providers/:id" element={<ProviderDetailsPage />} />
        <Route path="book" element={<BookingPage />} />
        <Route path="bookings" element={<MyBookingsPage />} />
        <Route path="bookings/:id" element={<BookingDetailsPage />} />
        <Route path="bookings/:id/confirmation" element={<BookingConfirmationPage />} />
        <Route path="addresses" element={<AddressesPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="complaints" element={<ComplaintsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Route>

    
    <Route element={<ProtectedRoute allowedRoles={['provider']} />}>
      <Route path="/provider" element={<DashboardLayout navItems={PROVIDER_NAV} roleLabel="Provider" />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ProviderDashboardPage />} />
        <Route path="services" element={<MyServicesPage />} />
        <Route path="availability" element={<AvailabilityPage />} />
        <Route path="bookings/requests" element={<BookingRequestsPage />} />
        <Route path="bookings/active" element={<ActiveBookingsPage />} />
        <Route path="bookings/completed" element={<CompletedBookingsPage />} />
        <Route path="earnings" element={<EarningsPage />} />
        <Route path="reviews" element={<ProviderReviewsPage />} />
        <Route path="profile" element={<ProviderProfilePage />} />
      </Route>
    </Route>

   
    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
      <Route path="/admin" element={<DashboardLayout navItems={ADMIN_NAV} roleLabel="Admin" />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="providers" element={<AdminProvidersPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="services" element={<AdminServicesPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
        <Route path="complaints" element={<AdminComplaintsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="profile" element={<AdminProfilePage />} />
      </Route>
    </Route>

    <Route path="/404" element={<NotFoundPage />} />
    <Route path="*" element={<Navigate to="/404" replace />} />
  </Routes>
);

export default AppRoutes;
