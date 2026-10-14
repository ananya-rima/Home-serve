import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Tag, MapPin, Briefcase, Wrench, UserX } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchServiceById, clearCurrentService } from '../../features/service/serviceSlice';
import { useBasePath } from '../../hooks/useBasePath';
import { formatCurrency } from '../../utils/formatters';
import BookNowButton from '../../components/common/BookNowButton';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import PageLoader from '../../components/ui/PageLoader';

const ServiceDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const base = useBasePath();
  const { current, status, error } = useAppSelector((s) => s.service);

  useEffect(() => {
    dispatch(fetchServiceById(id));
    return () => {
      dispatch(clearCurrentService());
    };
  }, [dispatch, id]);

  const service = current?.service?._id === id ? current.service : null;
  const providers = service ? current.providers : [];

  if (!service) {
    if (status === 'failed') {
      return <EmptyState icon={Wrench} title="Service not found" description={error} />;
    }
    return <PageLoader label="Loading service..." />;
  }

  const inactive = service.status !== 'active';

  return (
    <div>
      <Link to={`${base}/services`} className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Back to services
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card padded={false} className="overflow-hidden">
            <div className="h-64 w-full bg-brand-gradient sm:h-80">
              {service.image ? (
                <img src={service.image} alt={service.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-white/80">
                  <Wrench className="h-16 w-16" />
                </div>
              )}
            </div>
            <div className="p-6">
              {service.categoryId?.name && <span className="badge bg-brand-50 text-brand-700">{service.categoryId.name}</span>}
              <h1 className="mt-3 text-2xl font-extrabold text-ink-950">{service.name}</h1>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-600">
                {service.description || 'No description provided for this service yet.'}
              </p>
            </div>
          </Card>

          <div>
            <h2 className="mb-4 text-lg font-bold text-ink-900">Available Providers ({providers.length})</h2>
            {providers.length === 0 ? (
              <EmptyState
                icon={UserX}
                title="No providers available yet"
                description="No approved provider currently offers this service. Please check back soon."
              />
            ) : (
              <div className="space-y-3">
                {providers.map((p) => (
                  <Card key={p._id} className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={p.provider.profileImage} name={p.provider.name} size="h-12 w-12" />
                      <div>
                        <p className="font-bold text-ink-900">{p.provider.name}</p>
                        <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
                          {p.provider.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" /> {p.provider.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3.5 w-3.5" /> {p.experience || 0} yrs
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-display text-xl font-extrabold text-brand-700">{formatCurrency(p.price)}</p>
                      <Link to={`${base}/providers/${p.provider._id}`}>
                        <Button variant="outline" size="sm">
                          Profile
                        </Button>
                      </Link>
                      <BookNowButton size="sm" serviceId={service._id} providerId={p.provider._id} disabled={inactive} />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside>
          <Card className="space-y-4 lg:sticky lg:top-24">
            <div>
              <p className="text-xs uppercase tracking-wide text-ink-400">Starting price</p>
              <p className="font-display text-3xl font-extrabold text-brand-700">{formatCurrency(service.basePrice)}</p>
              <p className="mt-1 text-xs text-ink-400">Final price is set by the provider you choose.</p>
            </div>
            <div className="space-y-3 border-t border-ink-100 pt-4 text-sm">
              <p className="flex items-center gap-3 text-ink-600">
                <Clock className="h-4 w-4 text-ink-400" /> Approx. duration: <b className="text-ink-800">{service.duration} min</b>
              </p>
              <p className="flex items-center gap-3 text-ink-600">
                <Tag className="h-4 w-4 text-ink-400" /> Category: <b className="text-ink-800">{service.categoryId?.name || '-'}</b>
              </p>
            </div>
            {inactive && (
              <p className="rounded-lg bg-amber-50 p-3 text-xs font-medium text-amber-700">
                This service is currently unavailable for booking.
              </p>
            )}
            <p className="text-xs text-ink-400">Choose a provider from the list to continue with your booking.</p>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default ServiceDetailsPage;
