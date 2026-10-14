import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';

const ROLE_HOME = {
  customer: '/customer/services',
  provider: '/provider/dashboard',
  admin: '/admin/dashboard',
};


const GuestRoute = () => {
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);

  if (isAuthenticated && user) {
    return <Navigate to={ROLE_HOME[user.role] || '/'} replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
