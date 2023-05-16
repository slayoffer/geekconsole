import type { ChangeEventHandler, InputHTMLAttributes } from 'react';

type InputProps = {
  className?: string;
  value?: string | number;
  onChange?: (value: string) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'>;

const BASE_INPUT_CLASSES =
  'block p-4 pl-10 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300';

export const Input = (props: InputProps) => {
  const {
    className = '',
    type = 'text',
    placeholder = '',
    value,
    onChange,
    ...otherProps
  } = props;

  const onChangeHandler: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { value } = event.target;
    onChange?.(value);
  };

  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={onChangeHandler}
      className={`${BASE_INPUT_CLASSES} ${className}`}
      {...otherProps}
    />
  );
};
