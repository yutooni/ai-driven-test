import React from 'react';

export interface ButtonProps {
  /**
   * ボタンのバリアント
   */
  variant: 'primary' | 'secondary';
  /**
   * ボタンのラベル
   */
  children: React.ReactNode;
  /**
   * クリックハンドラ
   */
  onClick?: () => void;
  /**
   * 無効化状態
   */
  disabled?: boolean;
}

export const Button = ({
  variant,
  children,
  onClick,
  disabled = false,
}: ButtonProps) => {
  const baseStyles =
    'px-4 py-2 rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantStyles = {
    primary:
      'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300',
    secondary:
      'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 disabled:bg-gray-100',
  };

  return (
    <button
      type="button"
      className={`${baseStyles} ${variantStyles[variant]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
