import clsx from 'clsx';

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('');

const Avatar = ({ src, name, size = 'h-10 w-10', className }) => {
  if (src) {
    return (
      <img
        src={src}
        alt={name || 'avatar'}
        className={clsx('rounded-full object-cover ring-2 ring-white', size, className)}
      />
    );
  }
  return (
    <div
      className={clsx(
        'flex items-center justify-center rounded-full bg-brand-gradient font-semibold text-white ring-2 ring-white',
        size,
        className
      )}
    >
      {getInitials(name) || '?'}
    </div>
  );
};

export default Avatar;
