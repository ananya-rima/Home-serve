import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, PackageSearch } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchServices } from '../../features/service/serviceSlice';
import { fetchCategories } from '../../features/category/categorySlice';
import { useBasePath } from '../../hooks/useBasePath';
import { useDebounce } from '../../hooks/useDebounce';
import ServiceCard from '../../components/common/ServiceCard';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';

const SORT_OPTIONS = [
  { value: '', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

const ServicesPage = () => {
  const dispatch = useAppDispatch();
  const base = useBasePath();
  const [params, setParams] = useSearchParams();
  const { list, meta, status } = useAppSelector((s) => s.service);
  const categories = useAppSelector((s) => s.category.list);
  const [showFilters, setShowFilters] = useState(false);

  const category = params.get('category') || '';
  const sort = params.get('sort') || '';
  const page = Number(params.get('page') || 1);

 
  const [search, setSearch] = useState(params.get('search') || '');
  const [minPrice, setMinPrice] = useState(params.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(params.get('maxPrice') || '');
  const dSearch = useDebounce(search, 400);
  const dMin = useDebounce(minPrice, 500);
  const dMax = useDebounce(maxPrice, 500);

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
    if (dSearch !== (params.get('search') || '')) updateParams({ search: dSearch });
    
  }, [dSearch]);
  useEffect(() => {
    if (dMin !== (params.get('minPrice') || '')) updateParams({ minPrice: dMin });
   
  }, [dMin]);
  useEffect(() => {
    if (dMax !== (params.get('maxPrice') || '')) updateParams({ maxPrice: dMax });
    
  }, [dMax]);

  useEffect(() => {
    dispatch(fetchCategories({ limit: 100, status: 'active' }));
  }, [dispatch]);

  useEffect(() => {
    const query = {
      page,
      limit: 9,
      search: params.get('search') || undefined,
      category: category || undefined,
      minPrice: params.get('minPrice') || undefined,
      maxPrice: params.get('maxPrice') || undefined,
      sort: sort || undefined,
    };
    dispatch(fetchServices(query));
  }, [dispatch, params, page, category, sort]);

  const clearAll = () => {
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    setParams({}, { replace: true });
  };

  const hasFilters = Boolean(category || sort || search || minPrice || maxPrice);
  const categoryOptions = categories.map((c) => ({ value: c._id, label: c.name }));

  return (
    <div>
      <PageHeader title="Browse Services" subtitle="Find the right service for your home, then pick a trusted professional." />

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="min-w-[220px] flex-1">
          <Input icon={Search} placeholder="Search services (e.g. AC, plumbing)" value={search} onChange={(e) => setSearch(e.target.value)} />
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
              label="Category"
              placeholder="All categories"
              options={categoryOptions}
              value={category}
              onChange={(e) => updateParams({ category: e.target.value })}
            />
            <div>
              <p className="mb-1.5 text-sm font-medium text-ink-700">Price range (Rs)</p>
              <div className="grid grid-cols-2 gap-2">
                <Input type="number" min="0" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                <Input type="number" min="0" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
              </div>
            </div>
          </Card>
        </aside>

        <section>
          {status === 'loading' && list.length === 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-72 animate-pulse rounded-2xl bg-ink-100" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="No services found"
              description="Try a different keyword or adjust your filters."
              actionLabel={hasFilters ? 'Clear filters' : undefined}
              onAction={clearAll}
            />
          ) : (
            <>
              <p className="mb-4 text-sm text-ink-500">
                Showing <span className="font-semibold text-ink-800">{list.length}</span> of {meta?.total ?? list.length} services
              </p>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {list.map((service) => (
                  <ServiceCard key={service._id} service={service} to={`${base}/services/${service._id}`} />
                ))}
              </div>
              <div className="mt-8">
                <Pagination meta={meta} onPageChange={(p) => updateParams({ page: p }, true)} />
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default ServicesPage;
