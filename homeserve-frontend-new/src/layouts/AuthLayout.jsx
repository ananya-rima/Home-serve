import { Outlet } from 'react-router-dom';
import { CalendarDays, Check, Star } from 'lucide-react';
import clsx from 'clsx';
import Logo from '../components/common/Logo';

const PROGRESS_STEPS = [
  { label: 'Confirmed', done: true },
  { label: 'On the way', done: true },
  { label: 'Started', done: false },
  { label: 'Done', done: false },
];


const ProductPreview = () => (
  <div className="relative mt-10 h-[330px] max-w-md">
   
    <div className="absolute left-0 top-0 w-72 -rotate-2 rounded-2xl bg-white p-4 text-ink-900 shadow-floating">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Your booking</span>
        <span className="badge bg-sky-50 text-sky-700 ring-1 ring-sky-200">Confirmed</span>
      </div>
      <p className="mt-2 font-display text-base font-bold">AC General Service</p>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-500">
        <CalendarDays className="h-3.5 w-3.5" /> Sat, 14 Mar · 10:00 AM
      </p>
    </div>

   
    <div className="absolute right-0 top-[92px] w-64 rotate-2 rounded-2xl bg-white p-4 text-ink-900 shadow-floating">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-white">AD</span>
        <div>
          <p className="text-sm font-bold">Arjun Das</p>
          <p className="flex items-center gap-1 text-xs text-ink-500">
            <Star className="h-3 w-3 fill-accent-500 text-accent-500" /> 4.9 · AC Technician
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-3 text-xs">
        <span className="text-ink-500">Service price</span>
        <span className="font-bold text-brand-700">Rs 750</span>
      </div>
    </div>

   
    <div className="absolute bottom-0 left-6 w-72 rounded-2xl bg-brand-900 p-4 ring-1 ring-white/15">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">Live job progress</p>
      <div className="mt-3 flex items-start justify-between">
        {PROGRESS_STEPS.map((step, i) => (
          <div key={step.label} className="relative flex flex-1 flex-col items-center">
            {i > 0 && (
              <span
                className={clsx('absolute right-1/2 top-[11px] h-0.5 w-full', step.done ? 'bg-brand-300' : 'bg-white/15')}
              />
            )}
            <span
              className={clsx(
                'relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2',
                step.done ? 'border-brand-300 bg-brand-300 text-brand-950' : 'border-white/25 bg-brand-900 text-transparent'
              )}
            >
              <Check className="h-3.5 w-3.5" />
            </span>
            <span className={clsx('mt-1.5 text-[10px] font-medium', step.done ? 'text-white' : 'text-white/40')}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AuthLayout = () => (
  <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
    <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-950 p-12 lg:flex">
     
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />

      <Logo className="relative z-10 [&_span]:text-white" />

      <div className="relative z-10">
        <h2 className="max-w-md font-display text-4xl font-extrabold leading-tight text-white">
          Book trusted home pros in a few taps.
        </h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-white/65">
          Compare verified providers, pick a time that suits you, and follow your job from request to completion.
        </p>
        <ProductPreview />
      </div>

      <p className="relative z-10 text-xs text-white/40">© {new Date().getFullYear()} HomeServe</p>
    </div>

    <div className="flex items-center justify-center bg-ink-50 p-6 sm:p-10">
      <div className="w-full max-w-md">
        <div className="mb-8 lg:hidden">
          <Logo />
        </div>
        <Outlet />
      </div>
    </div>
  </div>
);

export default AuthLayout;
