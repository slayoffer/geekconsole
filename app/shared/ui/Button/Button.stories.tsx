import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './Button';

const meta = {
  title: 'Shared/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    variant: 'primary',
    children: 'Test',
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
  },
};

export const Small: Story = {
  args: {
    size: 'small',
  },
};

export const Basic: Story = {
  args: {
    size: 'basic',
  },
};

export const Large: Story = {
  args: {
    size: 'large',
  },
};
