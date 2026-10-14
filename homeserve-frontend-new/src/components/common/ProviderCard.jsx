import { Link } from 'react-router-dom';
import { MapPin, Briefcase } from 'lucide-react';
import Avatar from '../ui/Avatar';
import RatingStars from '../ui/RatingStars';
import Button from '../ui/Button';
import BookNowButton from './BookNowButton';
import { formatCurrency } from '../../utils/formatters';


const ProviderCard = ({ item, to, serviceId, priceLabel = 'From' }) => {
  const { provider } = item;
  return (
    <div className="card flex flex-col p-5 transition-shadow hover:shadow-floating">
      <div className="flex items-start gap-3">
        <Avatar src={provider.profileImage} name={provider.name} size="h-14 w-14" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-ink-900">{provider.name}</h3>
          <RatingStars rating={item.avgRating} />
          <p className="mt-0.5 text-xs text-ink-400">
            {item.reviewCount} review{item.reviewCount === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-1.5 text-sm text-ink-600">
        {provider.location && (
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-ink-400" /> {provider.location}
          </p>
        )}
        <p className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-ink-400" /> {item.experience || 0} yrs experience
        </p>
      </div>

      {provider.skills?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {provider.skills.slice(0, 3).map((s) => (
            <span key={s} className="badge bg-ink-100 text-ink-600">
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-ink-100 pt-4">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-ink-400">{priceLabel}</p>
          <p className="font-display text-lg font-extrabold text-brand-700">{formatCurrency(item.price)}</p>
        </div>
        <div className="flex gap-2">
          <Link to={to}>
            <Button variant="outline" size="sm">
              Profile
            </Button>
          </Link>
          {serviceId && <BookNowButton size="sm" serviceId={serviceId} providerId={provider._id} label="Book" />}
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;
