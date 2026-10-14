import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, SlidersHorizontal, X, UserX } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { discoverProviders } from '../../features/provider/providerSlice';
import { fetchServices } from '../../features/service/serviceSlice';
import { useBasePath } from '../../hooks/useBasePath';
import { useDebounce } from '../../hooks/useDebounce';
import ProviderCard from '../../components/common/ProviderCard';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';

const RATING_OPTIONS = [
  { value: '3', label: '3★ & above' },
  { value: '4', label: '4★ & above' },
  { value: '4.5', label: '4.5★ & above' },
];

const SORT_OPTIONS = [
  { value: '', label: 'Newest' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price', label: 'Price: Low to High' },
];

const ProvidersPage = () => {
  const dispatch = useAppDispatch();
  const base = useBasePath();
  const [params, setParams] = useSearchParams();
  const { discoverList, discoverMeta, status } = useAppSelector((s) => s.provider);
  const services = useAppSelector((s) => s.service.list);
  const [showFilters, setShowFilters] = useState(false);

  const serviceId = params.get('service') || '';
  const minRating = params.get('minRating') || '';
  const sort = params.get('sort') || '';
  const page = Number(params.get('page') || 1);

  const [location, setLocation] = useState(params.get('location') || '');
  const [maxPrice, setMaxPrice] = useState(params.get('maxPrice') || '');
  const [experience, setExperience] = useState(params.get('experience') || '');
  const dLocation = useDebounce(location, 450);
  const dMaxPrice = useDebounce(maxPrice, 500);
  const dExperience = useDebounce(experience, 500);

  const updateParams = (changes, keepPage = false) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => {
      if (v === '' || v === undefined || v === null) next.delete(k);
      else next.set(k, v);
    });
    if (!keepPage) next.delete('page');
    setParams(next, { replace: true });
  };

  useEffect(() => {
    if (dLocation !== (params.get('location') || '')) updateParams({ location: dLocation });
    
  }, [dLocation]);
  useEffect(() => {
    if (dMaxPrice !== (params.get('maxPrice') || '')) updateParams({ maxPrice: dMaxPrice });
    
  }, [dMaxPrice]);
  useEffect(() => {
    if (dExperience !== (params.get('experience') || '')) updateParams({ experience: dExperience });
    
  }, [dExperience]);

  
  useEffect(() => {
    dispatch(fetchServices({ limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      discoverProviders({
        page,
        limit: 9,
        service: serviceId || undefined,
        location: params.get('location') || undefined,
        minRating: minRating || undefined,
        maxPrice: params.get('maxPrice') || undefined,
        experience: params.get('experience') || undefined,
        sort: sort || undefined,
      })
    );
  }, [dispatch, params, page, serviceId, minRating, sort]);

  
  const providers = useMemo(() => {
    const map = new Map();
    discoverList.forEach((item) => {
      const existing = map.get(item.provider._id);
      if (!existing || item.price < existing.price) map.set(item.provider._id, item);
    });
    return [...map.values()];
  }, [discoverList]);

  const clearAll = () => {
    setLocation('');
    setMaxPrice('');
    setExperience('');
    setParams({}, { replace: true });
  };

  const hasFilters = Boolean(serviceId || minRating || sort || location || maxPrice || experience);
  const serviceOptions = services.map((s) => ({ value: s._id, label: s.name }));

  return (
    <div>
      <PageHeader title="Find Providers" subtitle="Compare rated, approved professionals and pick the one that suits you." />

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="min-w-[220px] flex-1">
          <Input icon={MapPin} placeholder="Filter by location (e.g. Dhanmondi)" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div className="w-full sm:w-52">
          <Select options={SORT_OPTIONS} value={sort} onChange={(e) => updateParams({ sort: e.target.value })} />
        </div>
        <Button variant="outline" icon={SlidersHorizontal} className="lg:hidden" onClick={() => setShowFilters((v) => !v)}>
          Filters
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
          <Card className="space-y-5 lg:sticky lg:top-24">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-ink-900">Filters</h3>
              {hasFilters && (
                <button onClick={clearAll} className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:underline">
                  <X className="h-3.5 w-3.5" /> Clear
                </button>
              )}
            </div>
            <Select
              label="Service"
              placeholder="Any service"
              options={serviceOptions}
              value={serviceId}
              onChange={(e) => updateParams({ service: e.target.value })}
            />
            <Select
              label="Minimum rating"
              placeholder="Any rating"
              options={RATING_OPTIONS}
              value={minRating}
              onChange={(e) => updateParams({ minRating: e.target.value })}
            />
            <Input label="Max price (Rs)" type="number" min="0" placeholder="e.g. 1500" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
            <Input label="Min experience (years)" type="number" min="0" placeholder="e.g. 2" value={experience} onChange={(e) => setExperience(e.target.value)} />
            {!serviceId && (
              <p className="text-xs text-ink-400">Select a service to see exact prices and book directly from this list.</p>
            )}
          </Card>
        </aside>

        <section>
          {status === 'loading' && providers.length === 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl bg-ink-100" />
              ))}
            </div>
          ) : providers.length === 0 ? (
            <EmptyState
              icon={UserX}
              title="No providers match your filters"
              description="Try widening your filters or removing the service selection."
              actionLabel={hasFilters ? 'Clear filters' : undefined}
              onAction={clearAll}
            />
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {providers.map((item) => (
                  <ProviderCard
                    key={item._id}
                    item={item}
                    to={`${base}/providers/${item.provider._id}`}
                    serviceId={serviceId || undefined}
                    priceLabel={serviceId ? 'Price' : 'From'}
                  />
                ))}
              </div>
              <div className="mt-8">
                <Pagination meta={discoverMeta} onPageChange={(p) => updateParams({ page: p }, true)} />
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProvidersPage;
