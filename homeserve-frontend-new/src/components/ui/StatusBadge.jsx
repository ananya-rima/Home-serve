import Badge from './Badge';
import { BOOKING_STATUS_LABEL, BOOKING_STATUS_STYLE } from '../../utils/constants';

const StatusBadge = ({ status }) => (
  <Badge className={BOOKING_STATUS_STYLE[status] || 'bg-ink-100 text-ink-600 ring-1 ring-ink-200'}>
    {BOOKING_STATUS_LABEL[status] || status}
  </Badge>
);

export default StatusBadge;
