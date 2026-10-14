import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ShieldCheck, Clock, Star, ArrowRight, Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchCategories } from '../../features/category/categorySlice';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const STEPS = [
  { icon: Search, title: 'Browse & Compare', text: 'Explore services and compare vetted local professionals.' },
  { icon: Clock, title: 'Book a Slot', text: 'Pick a date and time that fits your schedule in seconds.' },
  { icon: Wrench, title: 'Get It Done', text: 'Your pro arrives, does the job, and you pay with confidence.' },
];

const HomePage = () => {
  const dispatch = useAppDispatch();
  const { list: categories } = useAppSelector((s) => s.category);

  useEffect(() => {
    dispatch(fetchCategories({ limit: 8, status: 'active' }));
  }, [dispatch]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-gradient">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="container-page relative grid gap-10 py-20 lg:grid-cols-2 lg:py-28">
          <div className="text-white">
            <span className="badge bg-white/15 text-white">Trusted by 10,000+ homeowners</span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight sm:text-5xl">
              Home services, done right — at your doorstep.
            </h1>
            <p className="mt-5 max-w-lg text-base text-white/85">
              From AC repair to deep cleaning, book verified professionals in minutes. Transparent pricing, real
              reviews, zero hassle.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/services">
                <Button variant="accent" size="lg" icon={ArrowRight} className="flex-row-reverse">
                  Explore Services
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                >
                  Become a Provider
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              {[ShieldCheck, Star, Clock, Wrench].map((Icon, i) => (
                <div
                  key={i}
                  className={`rounded-2xl bg-white/10 p-6 backdrop-blur-md ${i % 2 === 1 ? 'mt-8' : ''}`}
                >
                  <Icon className="h-8 w-8 text-white" />
                  <p className="mt-3 text-sm font-semibold text-white">
                    {['Verified Pros', 'Top Rated', 'Fast Booking', 'Any Service'][i]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

     
      <section className="container-page py-16">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-ink-950">Popular Categories</h2>
            <p className="mt-1 text-sm text-ink-500">Pick a category to see available services near you.</p>
          </div>
          <Link to="/services" className="hidden text-sm font-semibold text-brand-700 hover:underline sm:block">
            View all
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.length === 0 &&
            Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-ink-100" />)}
          {categories.map((cat) => (
            <Link key={cat._id} to={`/services?category=${cat._id}`}>
              <Card className="h-28 flex flex-col justify-between hover:shadow-floating transition-shadow">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Wrench className="h-[18px] w-[18px]" />
                </div>
                <p className="text-sm font-semibold text-ink-800 line-clamp-1">{cat.name}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      
      <section className="bg-white py-16">
        <div className="container-page">
          <h2 className="text-center text-2xl font-bold text-ink-950">How HomeServe Works</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <Card key={step.title} className="relative text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white">
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-bold text-ink-900">{step.title}</h3>
                <p className="mt-2 text-sm text-ink-500">{step.text}</p>
                <span className="absolute right-4 top-4 font-display text-3xl font-extrabold text-ink-100">
                  0{i + 1}
                </span>
              </Card>
            ))}
          </div>
        </div>
      </section>

     
      <section className="container-page py-16">
        <div className="rounded-3xl bg-ink-950 px-8 py-14 text-center sm:px-16">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Ready to get things done around your home?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-white/70">
            Join thousands of customers who trust HomeServe for reliable, on-demand home services.
          </p>
          <Link to="/register">
            <Button variant="accent" size="lg" className="mt-7">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
