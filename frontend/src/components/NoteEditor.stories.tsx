import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { NoteEditor, NoteEditorProps } from './NoteEditor';

const meta = {
  title: 'Components/NoteEditor',
  component: NoteEditor,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'テキストエリアの値',
    },
    label: {
      control: 'text',
      description: 'ラベルテキスト',
    },
    placeholder: {
      control: 'text',
      description: 'プレースホルダーテキスト',
    },
    disabled: {
      control: 'boolean',
      description: '無効化状態',
    },
    onChange: {
      action: 'changed',
      description: '値が変更されたときのハンドラ',
    },
  },
} satisfies Meta<typeof NoteEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper component to handle state
const NoteEditorWrapper = (args: NoteEditorProps) => {
  const [value, setValue] = useState(args.value || '');

  return (
    <NoteEditor
      {...args}
      value={value}
      onChange={(newValue) => {
        setValue(newValue);
        args.onChange?.(newValue);
      }}
    />
  );
};

export const Default: Story = {
  render: (args) => <NoteEditorWrapper {...args} />,
  args: {
    value: '',
    onChange: () => {},
    label: '学習ノート',
    placeholder: 'ここに学習ノートを入力してください...',
  },
};

export const Disabled: Story = {
  render: (args) => <NoteEditorWrapper {...args} />,
  args: {
    value: '',
    onChange: () => {},
    label: '学習ノート（無効）',
    placeholder: 'ここに学習ノートを入力してください...',
    disabled: true,
  },
};

export const WithInitialValue: Story = {
  render: (args) => <NoteEditorWrapper {...args} />,
  args: {
    value: 'これは既存のノート内容です。\n\n複数行のテキストも表示できます。',
    onChange: () => {},
    label: '学習ノート',
    placeholder: 'ここに学習ノートを入力してください...',
  },
};

export const LongText: Story = {
  render: (args) => <NoteEditorWrapper {...args} />,
  args: {
    value:
      'これは非常に長いテキストの例です。\n\n'.repeat(10) +
      '実際の学習ノートでは、長文が入力されることも想定されます。',
    onChange: () => {},
    label: '学習ノート（長文）',
    placeholder: 'ここに学習ノートを入力してください...',
  },
};

export const WithoutLabel: Story = {
  render: (args) => <NoteEditorWrapper {...args} />,
  args: {
    value: '',
    onChange: () => {},
    placeholder: 'ここに学習ノートを入力してください...',
  },
};
