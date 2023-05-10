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

const BASE_APPLINK_CLASSES =
  'text-gray-900 focus:ring-2 focus:outline-none font-bold rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center';

const AppLinkVariantsStyles: AppLinkVariantsStylesType = {
  primary: `${BASE_APPLINK_CLASSES} bg-[--primary-color] hover:bg-[--primary-color]/90 focus:ring-[--primary-color]/50`,
  secondary: `${BASE_APPLINK_CLASSES} bg-[--secondary-color] hover:bg-[--secondary-color]/90 focus:ring-[--secondary-color]/50`,
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
