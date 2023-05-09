import type { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';

import { AppLink } from './AppLink';

const meta = {
  title: 'Shared/AppLink',
  component: AppLink,
  tags: ['autodocs'],
  args: {
    to: 'test',
    children: 'Test Text',
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
} satisfies Meta<typeof AppLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
};

export const Unstyled: Story = {
  args: {
    variant: 'unstyled',
  },
};
