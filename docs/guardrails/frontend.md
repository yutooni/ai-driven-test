# Frontend Guardrails

このドキュメントはフロントエンド開発における guardrail（ガードレール）を定義します。

## 基本原則

### 1. Storybook を UI の SSOT（Single Source of Truth）として扱う

- すべてのコンポーネントは Storybook に story を持つ
- story がない UI コンポーネントは作成しない
- story を書くことで、コンポーネントの仕様と使い方を明文化する

### 2. コンポーネントの props は TypeScript で厳密に型定義する

- props の型定義は必須
- `any` 型の使用禁止
- optional props には `?` を明示する
- default props は明確にする

### 3. コンポーネントの責務を明確にする

- 1つのコンポーネントは1つの責務を持つ
- presentation component と container component を分離する
- ビジネスロジックは container component または hooks に集約する

### 4. Tailwind CSS を使ったスタイリング

- Tailwind CSS のユーティリティクラスを使う
- カスタム CSS は最小限にする
- デザインシステムに従う（色、サイズ、スペーシングなど）

### 5. テスタビリティを確保する

- コンポーネントは props の変更に対して予測可能な挙動をする
- 外部依存（API呼び出し、ブラウザAPI）は props または hooks で注入する
- Story を使って様々な状態を再現できるようにする

## Story 作成ルール

### Story ファイル名
- コンポーネント名と同じディレクトリに配置
- `ComponentName.stories.tsx` の形式

### Story 必須要素
1. **Default Story**: 基本的な使い方を示す
2. **Variants**: variant がある場合はすべて story にする
3. **States**: loading, disabled, error などの状態を story にする
4. **Edge Cases**: 空文字、長文、特殊文字などのエッジケースを story にする

### Story 例

```typescript
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

export const Disabled: Story = {
  args: {
    variant: 'primary',
    children: 'Button',
    disabled: true,
  },
};
```

## コンポーネント作成ルール

### ファイル構成
```
src/components/
├── Button/
│   ├── Button.tsx
│   ├── Button.stories.tsx
│   └── Button.test.tsx  (必要に応じて)
```

### コンポーネントの型定義

```typescript
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

export const Button = ({ variant, children, onClick, disabled }: ButtonProps) => {
  // implementation
};
```

## 禁止事項

### 1. Story なしコンポーネントの作成禁止
新しいコンポーネントを作成する際は、必ず story を同時に作成する。

### 2. any 型の使用禁止
props の型定義で `any` を使わない。型が不明な場合は `unknown` を使う。

### 3. inline styles の使用禁止
`style` prop での inline styles は使わない。Tailwind CSS のユーティリティクラスを使う。

例外: 動的な値（API から取得した色など）は inline styles 可。

### 4. 暫定対応コードの禁止
- `@ts-ignore`, `@ts-expect-error` は使わない
- `// TODO temporary`, `// FIXME temporary` は使わない

### 5. グローバル状態の直接参照禁止
コンポーネント内で直接グローバル状態を参照しない。props または hooks 経由で渡す。

## テストルール

### 最小限のテスト
- コンポーネントが正しくレンダリングされるか
- props の変更に対して正しく反応するか
- イベントハンドラが正しく呼ばれるか

### Story を使ったテスト
Storybook の play function を使って、インタラクションテストを書く。

```typescript
export const ClickTest: Story = {
  args: {
    variant: 'primary',
    children: 'Click me',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await userEvent.click(button);
  },
};
```

## Judge 検証内容

フロントエンドの `npm run judge` では以下を検証します：

1. **lint**: ESLint による静的解析
2. **typecheck**: TypeScript の型チェック
3. **test**: Vitest によるユニットテスト
4. **build-storybook**: Storybook のビルド成功確認
5. **guard**: フロントエンド guardrail チェック
   - **story-required**: すべてのコンポーネントに story が存在するか
   - **no-data-fetch-in-presentational**: presentational component に fetch/axios/useSWR が含まれていないか
   - **ui-anti-shortcut**: any/@ts-ignore/@ts-expect-error/.skip/.only/TODO temporary が含まれていないか
   - **component-layering**: page.tsx が composition に寄っているか（JSX行数≤15、className使用数≤5）

すべて GREEN で初めて commit 可能です。

## 受け入れ条件

新しいコンポーネントを追加する際の受け入れ条件：

- [ ] コンポーネントの props に型定義がある
- [ ] story ファイルが存在する
- [ ] story に Default, Variants, States が含まれている
- [ ] `npm run judge` がすべて GREEN
- [ ] Storybook で視覚的に確認できる

## 今後の拡張

- Chromatic による visual regression test
- Accessibility (a11y) チェック
- Performance モニタリング
- E2E テスト (Playwright)

これらは必要に応じて guardrail に追加します。
