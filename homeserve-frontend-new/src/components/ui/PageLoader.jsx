import Spinner from './Spinner';

const PageLoader = ({ label = 'Loading...' }) => (
  <div className="flex min-h-[40vh] w-full flex-col items-center justify-center gap-3">
    <Spinner size="h-8 w-8" />
    <p className="text-sm text-ink-500">{label}</p>
  </div>
);

export default PageLoader;
