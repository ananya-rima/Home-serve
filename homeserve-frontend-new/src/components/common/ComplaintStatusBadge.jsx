import Badge from '../ui/Badge';
import { COMPLAINT_STATUS_LABEL, COMPLAINT_STATUS_STYLE } from '../../utils/constants';

const ComplaintStatusBadge = ({ status }) => (
  <Badge className={COMPLAINT_STATUS_STYLE[status] || 'bg-ink-100 text-ink-600'}>
    {COMPLAINT_STATUS_LABEL[status] || status}
  </Badge>
);

export default ComplaintStatusBadge;
