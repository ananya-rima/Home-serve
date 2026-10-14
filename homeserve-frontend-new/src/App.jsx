import { useEffect } from 'react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAppDispatch } from './app/hooks';
import { fetchCurrentUser, clearSession } from './features/auth/authSlice';
import { SESSION_EXPIRED_EVENT } from './api/axiosClient';
import AppRoutes from './routes/AppRoutes';
import { storage } from './utils/storage';
import RealtimeBridge from './components/common/RealTimeBridge';

const SessionWatcher = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleExpired = () => {
      dispatch(clearSession());
      navigate('/login');
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
  }, [dispatch, navigate]);

  return null;
};


const SessionBootstrap = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (storage.getAccessToken()) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <SessionBootstrap>
        <SessionWatcher />
        <RealtimeBridge />
        <AppRoutes />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: '12px',
              background: '#16181c',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 500,
            },
          }}
        />
      </SessionBootstrap>
    </BrowserRouter>
  );
}

export default App;
