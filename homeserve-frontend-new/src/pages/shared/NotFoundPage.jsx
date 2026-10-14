import { Link } from 'react-router-dom';
import { CompassIcon } from 'lucide-react';
import Button from '../../components/ui/Button';

const NotFoundPage = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-ink-50 px-4 text-center">
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
      <CompassIcon className="h-8 w-8" />
    </div>
    <h1 className="mt-6 font-display text-4xl font-extrabold text-ink-950">404</h1>
    <p className="mt-2 text-ink-500">The page you're looking for doesn't exist or has moved.</p>
    <Link to="/">
      <Button className="mt-6">Back to Home</Button>
    </Link>
  </div>
);

export default NotFoundPage;
