import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CalendarPlus } from 'lucide-react';
import Button from '../ui/Button';
import { useAppSelector } from '../../app/hooks';


const BookNowButton = ({ serviceId, providerId, size = 'md', label = 'Book Now', disabled, className }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);

  const handleClick = () => {
    const target = { pathname: '/customer/book', search: `?serviceId=${serviceId}&providerId=${providerId}` };
    if (!isAuthenticated) {
      toast('Please log in to book a service');
      navigate('/login', { state: { from: target } });
      return;
    }
    if (user?.role !== 'customer') {
      toast.error('Only customer accounts can book services');
      return;
    }
    navigate(`${target.pathname}${target.search}`);
  };

  return (
    <Button variant="accent" size={size} icon={CalendarPlus} onClick={handleClick} disabled={disabled} className={className}>
      {label}
    </Button>
  );
};

export default BookNowButton;
