import clsx from 'clsx';

const Card = ({ children, className, padded = true, ...props }) => (
  <div className={clsx('card', padded && 'p-5 sm:p-6', className)} {...props}>
    {children}
  </div>
);

export default Card;
