import { Link } from '@remix-run/react';
import { type RemixLinkProps } from '@remix-run/react/dist/components';
import { type ReactNode } from 'react';

type AppLinkVariant = 'primary' | 'secondary' | 'unstyled';

type AppLinkVariantsStylesType = Record<AppLinkVariant, string>;

type AppLinkProps = {
  className?: string;
  variant?: AppLinkVariant;
  children: ReactNode;
} & RemixLinkProps;

const AppLinkVariantsStyles: AppLinkVariantsStylesType = {
  primary:
    'text-gray-900 bg-[--primary-color] hover:bg-[--primary-color]/90 focus:ring-2 focus:outline-none focus:ring-[--primary-color]/50 font-bold rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center',
  secondary:
    'text-white bg-[--secondary-color] hover:bg-[--secondary-color]/90 focus:ring-2 focus:outline-none focus:ring-[--secondary-color]/50 font-bold rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center',
  unstyled: '',
};

export const AppLink = (props: AppLinkProps) => {
  const {
    className = '',
    variant = 'primary',
    to,
    children,
    ...otherProps
  } = props;

  const AppLinkClassNames =
    className !== ''
      ? `${AppLinkVariantsStyles[variant]} ${className}`
      : AppLinkVariantsStyles[variant];

  return (
    <Link to={to} className={AppLinkClassNames} {...otherProps}>
      {children}
    </Link>
  );
};
