import React from 'react';

export interface NoteEditorProps {
  /**
   * テキストエリアの値
   */
  value: string;
  /**
   * 値が変更されたときのハンドラ
   */
  onChange: (value: string) => void;
  /**
   * ラベルテキスト
   */
  label?: string;
  /**
   * プレースホルダーテキスト
   */
  placeholder?: string;
  /**
   * 無効化状態
   */
  disabled?: boolean;
}

export const NoteEditor = ({
  value,
  onChange,
  label,
  placeholder,
  disabled = false,
}: NoteEditorProps) => {
  const id = React.useId();

  const baseStyles =
    'w-full min-h-[200px] px-4 py-3 rounded-lg border-2 transition-colors resize-vertical font-sans';

  const stateStyles = disabled
    ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
    : 'border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400';

  const textarea = (
    <textarea
      id={label ? id : undefined}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`${baseStyles} ${stateStyles}`}
    />
  );

  if (label) {
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
        {textarea}
      </div>
    );
  }

  return textarea;
};
