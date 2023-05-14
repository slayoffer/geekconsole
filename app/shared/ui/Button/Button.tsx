import { type ButtonHTMLAttributes, type ReactNode, useMemo } from 'react';
import { exhaustiveCheck } from '~/shared/lib/utils';

type ButtonSize = 'small' | 'basic' | 'large';

type ButtonVariant = 'primary';

type ButtonProps = {
  children: ReactNode;
  className?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const BASE_BUTTON_CLASSES = 'focus:ring-4 focus:outline-none rounded-lg';

const getVariantClasses = (variant: ButtonVariant) => {
  switch (variant) {
    case 'primary': {
      return 'bg-[--primary-color] text-color-900 hover:bg-[--primary-color]/90 focus:ring-[--primary-color]/50 font-bold';
    }
    default:
      exhaustiveCheck(variant);
  }
};

const getSizeClasses = (size: ButtonSize) => {
  switch (size) {
    case 'small': {
      return 'h-8 px-4 text-sm';
    }
    case 'basic': {
      return 'h-10 px-5';
    }
    case 'large': {
      return 'h-12 px-6 text-lg';
    }
    default:
      exhaustiveCheck(size);
  }
};

export const Button = (props: ButtonProps) => {
  const {
    children,
    className = '',
    size = 'basic',
    variant = 'primary',
    ...otherProps
  } = props;

  const computedClasses = useMemo(() => {
    const sizeClass = getSizeClasses(size);
    const variantClass = getVariantClasses(variant);

    return [sizeClass, variantClass, className].join(' ');
  }, [size, variant, className]);

  return (
    <button
      className={`${BASE_BUTTON_CLASSES} ${computedClasses}`}
      {...otherProps}
    >
      {children}
    </button>
  );
};
