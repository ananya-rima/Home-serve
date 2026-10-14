import clsx from 'clsx';

const Badge = ({ children, className }) => (
  <span className={clsx('badge', className)}>{children}</span>
);

export default Badge;
