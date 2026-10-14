import { Link } from 'react-router-dom';
import { Clock, Wrench } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const ServiceCard = ({ service, to }) => (
  <Link
    to={to}
    className="group card flex flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-floating"
  >
    <div className="relative h-40 w-full overflow-hidden bg-brand-gradient">
      {service.image ? (
        <img
          src={service.image}
          alt={service.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-white/80">
          <Wrench className="h-10 w-10" />
        </div>
      )}
      {service.categoryId?.name && (
        <span className="badge absolute left-3 top-3 bg-white/90 text-brand-700 backdrop-blur">
          {service.categoryId.name}
        </span>
      )}
    </div>
    <div className="flex flex-1 flex-col p-4">
      <h3 className="line-clamp-1 text-base font-bold text-ink-900">{service.name}</h3>
      <p className="mt-1 line-clamp-2 flex-1 text-sm text-ink-500">{service.description || 'Professional service at your doorstep.'}</p>
      <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-ink-400">Starting at</p>
          <p className="font-display text-lg font-extrabold text-brand-700">{formatCurrency(service.basePrice)}</p>
        </div>
        <span className="flex items-center gap-1 text-xs font-medium text-ink-500">
          <Clock className="h-3.5 w-3.5" /> {service.duration} min
        </span>
      </div>
    </div>
  </Link>
);

export default ServiceCard;
