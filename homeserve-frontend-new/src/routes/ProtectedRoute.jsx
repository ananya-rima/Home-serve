import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';


const ROLE_HOME = {
  customer: '/customer/services',
  provider: '/provider/dashboard',
  admin: '/admin/dashboard',
};

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role] || '/'} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
