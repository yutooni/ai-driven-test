import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
      description: 'ボタンのバリアント',
    },
    children: {
      control: 'text',
      description: 'ボタンのラベル',
    },
    disabled: {
      control: 'boolean',
      description: '無効化状態',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Button',
  },
};

export const PrimaryDisabled: Story = {
  args: {
    variant: 'primary',
    children: 'Button',
    disabled: true,
  },
};

export const SecondaryDisabled: Story = {
  args: {
    variant: 'secondary',
    children: 'Button',
    disabled: true,
  },
};

export const LongText: Story = {
  args: {
    variant: 'primary',
    children: 'これは非常に長いボタンのテキストです',
  },
};
