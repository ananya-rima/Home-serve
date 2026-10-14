import { useLocation } from 'react-router-dom';


export const useBasePath = () => {
  const { pathname } = useLocation();
  return pathname.startsWith('/customer') ? '/customer' : '';
};
