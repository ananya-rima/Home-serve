import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { bumpRealtimeTick } from '../../features/ui/uiSlice';
import { socket } from '../../api/socket';

const RealtimeBridge = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      socket.disconnect();
      return undefined;
    }

    socket.connect();

    const onBookingEvent = (data) => {
      toast(data.message);
      dispatch(bumpRealtimeTick());
    };
    socket.on('booking:new', onBookingEvent);
    socket.on('booking:updated', onBookingEvent);

    return () => {
      socket.off('booking:new', onBookingEvent);
      socket.off('booking:updated', onBookingEvent);
    };
  }, [isAuthenticated, dispatch]);

  return null;
};

export default RealtimeBridge;