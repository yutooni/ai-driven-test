# AI-Driven Development Template

このリポジトリは、**Claude Code を使った AI 駆動開発のテンプレート**です。RFC → 実装 → Guard による検証というサイクルを通じて、AI が実装しても守るべきアーキテクチャ境界を guardrail で強制します。

## 特徴

- ✅ **バックエンド（Express）** + **フロントエンド（Next.js + Storybook）** のフルスタック構成
- ✅ **11 個の Guard** によるアーキテクチャ自動検証（バックエンド 7 + フロントエンド 4）
- ✅ **RFC 駆動開発**: 仕様を docs/rfc/ に書き、Claude Code が実装
- ✅ **Guardrails**: AI が守るべきルールを docs/guardrails/ に明文化
- ✅ **Judge システム**: lint + typecheck + test + guard の統合検証

## クイックスタート

### バックエンド

```bash
cd backend
npm install
npm run dev  # http://localhost:3000
```

### フロントエンド

```bash
cd frontend
npm install
npm run dev       # Next.js: http://localhost:3001
npm run storybook # Storybook: http://localhost:6006
```

### 一括インストール

```bash
npm run install:all
```

### 全体検証

```bash
npm run judge:all  # バックエンド + フロントエンドの全 guard を実行
```

## このテンプレートの使い方

### 1. リポジトリをテンプレートとして使用

GitHub で「Use this template」をクリック、またはクローン:

```bash
git clone https://github.com/your-username/ai-driven-test.git
cd ai-driven-test
npm run install:all  # backend と frontend の両方をインストール
```

### 2. RFC を書く

新しい機能の仕様を `docs/rfc/` に記述します。

- **バックエンド**: `docs/rfc/005_your_feature.md`
- **フロントエンド**: `docs/rfc/102_your_component.md`

### 3. Claude Code に実装を依頼

```
「docs/rfc/005_your_feature.md を読んで実装してください」
```

Claude Code が以下を自動で行います：
1. RFC と guardrails を読む
2. 最小変更で実装
3. テストを追加
4. Judge で検証（lint + typecheck + test + guard）

### 4. Judge で検証

```bash
npm run judge:all  # すべて GREEN なら commit 可能
```

### 5. Commit & Push

```bash
git add .
git commit -m "Add new feature"
git push
```

CI で再度 Judge が実行され、GREEN なら merge 可能です。

### 6. テンプレートをリセットして自分のプロジェクトを始める

テンプレートのサンプル実装を削除して、ゼロから始める場合：

```bash
# バックエンドのサンプル実装を削除
rm -rf backend/src/domain/EchoMessage.ts
rm -rf backend/src/domain/MessageRepository.ts
rm -rf backend/src/usecase/EchoMessageUseCase.ts
rm -rf backend/src/usecase/TimeProvider.ts
rm -rf backend/src/presentation/messagesHandler.ts
rm -rf backend/src/presentation/SystemTimeProvider.ts
rm -rf backend/tests/messages.test.ts

# フロントエンドのサンプル実装を削除
rm -rf frontend/src/components/Button.tsx
rm -rf frontend/src/components/Button.stories.tsx
rm -rf frontend/src/components/Button.test.tsx
rm -rf frontend/src/components/NoteEditor.tsx
rm -rf frontend/src/components/NoteEditor.stories.tsx
rm -rf frontend/src/components/NoteEditor.test.tsx

# サンプル RFC を削除
rm -rf docs/rfc/002_add_message_echo.md
rm -rf docs/rfc/003_prevent_duplicate_message.md
rm -rf docs/rfc/004_prevent_duplicate_message_within_cooldown.md
rm -rf docs/rfc/101_note_editor_component.md

# OpenAPI からサンプルルートを削除
# backend/openapi/openapi.yaml を編集して /messages を削除

# router.ts から /messages ルートを削除
# backend/src/presentation/router.ts を編集

# 必要最小限のファイルを残す
# - backend/src/domain/Result.ts (Result<T> 型定義)
# - backend/src/usecase/repositories.ts (Repository パターンの例)
# - backend/src/presentation/router.ts (/health のみ残す)
# - backend/tests/health.test.ts
# - docs/rfc/001_init.md
# - docs/guardrails/ (すべて残す)
# - frontend/src/app/ (page.tsx, layout.tsx を残す)
```

あるいは、**段階的にサンプルを置き換える**方法もあります：

1. サンプル実装を残したまま、新しい RFC を追加
2. Claude Code に実装させる
3. Judge で GREEN を確認
4. 動作確認後、サンプル実装を削除

この方法なら、テンプレートの使い方を学びながら、徐々に自分のプロジェクトに置き換えられます。

## 開発フロー

### バックエンド開発フロー

1. **RFC を書く**: `docs/rfc/` に実装したい機能の仕様を記述
2. **Claude Code が実装する**: RFC と guardrails を読み、最小変更で実装
3. **npm run judge:backend で判定する**: lint, typecheck, test, guard すべてが GREEN であることを確認
4. **commit & push**: CI で再度検証し、GREEN なら merge 可能

### フロントエンド開発フロー

1. **RFC を書く**: `docs/rfc/101_*.md` のようにコンポーネント仕様を記述
2. **Claude Code が実装する**: コンポーネント + story + test を自動生成
3. **npm run judge:frontend で判定する**: lint, typecheck, test, build-storybook, guard すべてが GREEN であることを確認
4. **Storybook で視覚確認**: `npm run storybook` で UI を確認
5. **commit & push**: CI で再度検証し、GREEN なら merge 可能

## アーキテクチャ概要

### バックエンド: 3層アーキテクチャ

```
presentation → usecase → domain
```

- **domain**: 他層への依存禁止、外部I/O禁止、非決定性禁止、純粋な業務ロジック
- **usecase**: domain のみ依存可、外部I/O禁止、orchestration 層
- **presentation**: usecase のみ依存可（domain への直接依存は禁止）、HTTP やフレームワーク依存

### フロントエンド: コンポーネント駆動開発

```
page.tsx (composition) → components (presentation)
```

- **src/app/page.tsx**: コンポーネントの組み合わせ（composition）に専念
- **src/components/**: UI 実装（props で制御、データ取得禁止）
- **Storybook**: UI の SSOT（Single Source of Truth）

### RFC / OpenAPI / Guardrails / Guards / Judge の役割

- **RFC** (`docs/rfc/`): 実装する機能の仕様を記述。Claude Code がこれを読んで実装する
- **OpenAPI** (`openapi/openapi.yaml`): API 契約の SSOT。router との整合性を guard が検証
- **Guardrails** (`docs/guardrails/`): アーキテクチャルールを明文化。Claude Code が遵守すべき制約
- **Guards** (`scripts/guards/judge.js`): アーキテクチャルールの自動検証スクリプト
- **Judge** (`npm run judge`): lint + typecheck + test + guard の統合コマンド。すべて GREEN で初めて commit 可能

## Guard 一覧

### バックエンド Guard (7 つ)

`npm run guard` で以下を自動実行します。

#### 1. domain-purity
domain 層に外部依存（express 等）がないかチェック。domain 層は純粋な業務ロジックのみを持つべきです。

#### 2. usecase-purity
usecase 層に外部 I/O 依存（express, process.env, fetch, axios 等）がないかチェック。usecase 層は orchestration 専念で、I/O は presentation 層で行います。

#### 3. dependency-direction
レイヤー依存方向が `presentation → usecase → domain` の順であることをチェック。presentation が domain に直接依存することを禁止します。

#### 4. openapi-consistency
OpenAPI 定義と router 実装が双方向で一致するかチェック。OpenAPI に定義されているが実装されていないルート、または実装されているが OpenAPI に記載されていないルートを検出します。

#### 5. domain-determinism
domain 層に非決定的コード（Date.now(), Math.random(), process.env 等）がないかチェック。domain 層は決定論的であるべきで、時刻や乱数は外部から注入します。

#### 6. anti-shortcut
暫定対応コード（any, @ts-ignore, .skip(), .only(), TODO temporary 等）がないかチェック。技術的負債の蓄積を防ぎます。

#### 7. result-enforcement
Repository インターフェースのメソッドが `Result<T>` または `Promise<Result<T>>` を返すことをチェック。一貫したエラーハンドリングを強制します。

### フロントエンド Guard (4 つ)

`cd frontend && npm run guard` で以下を自動実行します。

#### 1. story-required
すべてのコンポーネント（src/components/**/*.tsx）に対応する .stories.tsx が存在するかチェック。Storybook を UI の SSOT として扱います。

#### 2. no-data-fetch-in-presentational
presentational component に fetch/axios/useSWR/useQuery が含まれていないかチェック。データ取得は props 経由で受け取るべきです。

#### 3. ui-anti-shortcut
any/@ts-ignore/@ts-expect-error/.skip/.only/TODO temporary が含まれていないかチェック。フロントエンドの技術的負債を防ぎます。

#### 4. component-layering
page.tsx が composition に寄っているかチェック（JSX 行数≤15、className 使用数≤5）。UI 実装は src/components に分離すべきです。

## コマンド一覧

### バックエンド

```bash
cd backend

# 開発サーバー起動
npm run dev

# テスト実行
npm test

# Lint
npm run lint

# 型チェック
npm run typecheck

# Guard 実行（アーキテクチャ検証）
npm run guard

# Judge（lint + typecheck + test + guard）
npm run judge
```

### フロントエンド

```bash
cd frontend

# 開発サーバー起動
npm run dev

# Storybook 起動
npm run storybook

# テスト実行
npm test

# Lint
npm run lint

# 型チェック
npm run typecheck

# Guard 実行
npm run guard

# Judge（lint + typecheck + test + build-storybook + guard）
npm run judge
```

### 全体

```bash
# バックエンド + フロントエンドの Judge を実行
npm run judge:all
```

## 実装されている機能

### バックエンド API

#### GET /health

ヘルスチェックエンドポイント

```bash
curl http://localhost:3000/health
# => {"status":"ok"}
```

#### POST /messages

メッセージエコーエンドポイント

```bash
curl -X POST http://localhost:3000/messages \
  -H "Content-Type: application/json" \
  -d '{"message":"hello"}'
# => {"message":"hello"}
```

**空文字の場合は 400**:
```bash
curl -X POST http://localhost:3000/messages \
  -H "Content-Type: application/json" \
  -d '{"message":""}'
# => {"error":"message must not be empty"}
```

**同一メッセージを 5 秒以内に再送した場合は 409**:
```bash
curl -X POST http://localhost:3000/messages \
  -H "Content-Type: application/json" \
  -d '{"message":"hello"}'
# => {"message":"hello"}

curl -X POST http://localhost:3000/messages \
  -H "Content-Type: application/json" \
  -d '{"message":"hello"}'
# => {"error":"duplicate message detected"}  (409 Conflict)
```

5 秒経過後は再送可能です。

### フロントエンド UI

#### Button コンポーネント

primary/secondary バリアント、disabled 状態を持つボタンコンポーネント

```typescript
<Button variant="primary" onClick={handleClick}>
  Submit
</Button>
```

Storybook で確認: http://localhost:6006/?path=/story/components-button--primary

#### NoteEditor コンポーネント

label、placeholder、disabled 状態を持つテキストエリアコンポーネント

```typescript
<NoteEditor
  label="学習ノート"
  value={note}
  onChange={setNote}
  placeholder="ここに学習ノートを入力してください..."
/>
```

Storybook で確認: http://localhost:6006/?path=/story/components-noteeditor--default

## Result<T> パターン

Repository インターフェースは `Result<T>` 型を返します。これにより：

- **一貫したエラーハンドリング**: 例外に頼らず、成功/失敗を型で表現
- **明示的なエラー処理**: 呼び出し側は必ず `ok` をチェックする必要がある
- **テスタビリティ**: 例外をスローしないため、テストが書きやすい

```typescript
export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };
```

例:
```typescript
const result = repository.isDuplicate(message, currentTime, cooldownMs);
if (!result.ok) {
  // エラーハンドリング
  return { success: false, error: 'duplicate' };
}
const isDuplicate = result.value; // ok: true の場合のみアクセス可能
```

## プロジェクト構成

```
.
├── backend/                    # バックエンド
│   ├── src/
│   │   ├── domain/             # ドメイン層（依存なし）
│   │   │   ├── EchoMessage.ts
│   │   │   ├── MessageRepository.ts
│   │   │   └── Result.ts
│   │   ├── usecase/            # ユースケース層
│   │   │   ├── EchoMessageUseCase.ts
│   │   │   ├── TimeProvider.ts
│   │   │   └── repositories.ts
│   │   └── presentation/       # プレゼンテーション層
│   │       ├── router.ts
│   │       ├── healthHandler.ts
│   │       ├── messagesHandler.ts
│   │       └── SystemTimeProvider.ts
│   ├── tests/
│   │   ├── health.test.ts
│   │   └── messages.test.ts
│   ├── scripts/guards/         # バックエンド guard スクリプト
│   │   └── judge.js
│   ├── openapi/
│   │   └── openapi.yaml        # API契約（SSOT）
│   ├── logs/
│   └── package.json
├── frontend/                   # フロントエンド
│   ├── .storybook/             # Storybook 設定
│   ├── scripts/guards/         # フロントエンド guard スクリプト
│   ├── src/
│   │   ├── app/                # Next.js App Router
│   │   └── components/         # UI コンポーネント
│   ├── logs/
│   └── package.json
├── docs/
│   ├── rfc/                    # 仕様定義（Request for Comments）
│   │   ├── 001-004: バックエンド RFC
│   │   └── 101: フロントエンド RFC
│   └── guardrails/             # アーキテクチャルール
│       ├── architecture.md     # 依存関係ルール（バックエンド）
│       ├── coding_rules.md     # コーディング規約（バックエンド）
│       ├── acceptance_criteria.md
│       └── frontend.md         # フロントエンド guardrail
├── .github/workflows/          # CI/CD
│   └── ci.yml
├── CLAUDE.md                   # Claude Code への指示書
├── README.md
└── package.json                # ルート orchestration
```

## Guard 違反例と修正例

### ❌ 違反例1: presentation 層が domain に直接依存

```typescript
// src/presentation/messagesHandler.ts
import { InMemoryMessageRepository } from '../domain/MessageRepository.js'; // NG
```

```bash
npm run guard
# ✗ guard:dependency-direction failed
#   - src/presentation/messagesHandler.ts: presentation must not depend on domain
```

**修正**: usecase 層を経由して repository を取得する

### ❌ 違反例2: usecase 層で process.env 使用

```typescript
// src/usecase/EchoMessageUseCase.ts
const env = process.env.NODE_ENV; // NG
```

```bash
npm run guard
# ✗ guard:usecase-purity failed
#   - src/usecase/EchoMessageUseCase.ts: external I/O dependency detected (process.env)
```

**修正**: 環境変数は presentation 層で読み、usecase に注入する

### ❌ 違反例3: domain 層で非決定性コード

```typescript
// src/domain/EchoMessage.ts
const timestamp = Date.now(); // NG
```

```bash
npm run guard
# ✗ guard:domain-determinism failed
#   - src/domain/EchoMessage.ts: non-deterministic code detected (Date.now())
```

**修正**: TimeProvider を usecase 層で定義し、presentation 層から注入する

### ❌ 違反例4: Repository が生の戻り値を返す

```typescript
// src/domain/MessageRepository.ts
export interface MessageRepository {
  isDuplicate(message: string): boolean; // NG: Result<boolean> にすべき
}
```

```bash
npm run guard
# ✗ guard:result-enforcement failed
#   - src/domain/MessageRepository.ts: method 'isDuplicate' returns 'boolean' instead of Result<T>
```

**修正**: `Result<boolean>` を返すように変更する

### ❌ 違反例5: コンポーネントに story がない

```typescript
// frontend/src/components/NewComponent.tsx
export const NewComponent = () => <div>New</div>;
```

```bash
cd frontend && npm run guard
# ✗ guard:story-required failed
#   - src/components/NewComponent.tsx: missing story file
```

**修正**: `NewComponent.stories.tsx` を作成する

### ❌ 違反例6: コンポーネントで fetch を使用

```typescript
// frontend/src/components/UserList.tsx
useEffect(() => {
  fetch('/api/users').then(/* ... */); // NG
}, []);
```

```bash
cd frontend && npm run guard
# ✗ guard:no-data-fetch-in-presentational failed
#   - src/components/UserList.tsx: data fetching detected (fetch()
```

**修正**: データは props で受け取る

### ❌ 違反例7: page.tsx に UI を直接実装

```typescript
// frontend/src/app/page.tsx
export default function Home() {
  return (
    <main className="...">
      <div className="...">
        <header className="...">
          {/* 20行以上の JSX、10個以上の className */}
        </header>
      </div>
    </main>
  );
}
```

```bash
cd frontend && npm run guard
# ✗ guard:component-layering failed
#   - src/app/page.tsx: too many JSX lines (23 > 15). Extract UI to components.
#   - src/app/page.tsx: too many className usages (15 > 5). Extract UI to components.
```

**修正**: UI を `src/components/` に抽出し、page.tsx では composition のみを行う

### ✅ 正常例

```bash
npm run judge:all
# > ai-driven-test@1.0.0 judge:all
# > npm run judge:backend && npm run judge:frontend
#
# Backend:
# ✓ lint passed
# ✓ typecheck passed
# ✓ 7 tests passed
# ✓ guard:domain-purity passed
# ✓ guard:usecase-purity passed
# ✓ guard:dependency-direction passed
# ✓ guard:openapi-consistency passed
# ✓ guard:domain-determinism passed
# ✓ guard:anti-shortcut passed
# ✓ guard:result-enforcement passed
#
# Frontend:
# ✓ lint passed
# ✓ typecheck passed
# ✓ 14 tests passed
# ✓ build-storybook passed
# ✓ guard:story-required passed
# ✓ guard:no-data-fetch-in-presentational passed
# ✓ guard:ui-anti-shortcut passed
# ✓ guard:component-layering passed
#
# ✓ All checks passed
```

## CI/CD

GitHub Actions で以下を自動実行します：

- `npm run judge:backend` (lint + typecheck + test + guard)
- `npm run judge:frontend` (lint + typecheck + test + build-storybook + guard)

すべて GREEN でなければ merge できません。

## 技術スタック

### バックエンド
- Node.js + TypeScript
- Express
- Vitest (テスト)
- ESLint + TypeScript Compiler

### フロントエンド
- Next.js 15 (App Router)
- React 19
- Storybook 10 (Vite builder)
- Tailwind CSS
- Vitest + Testing Library

## 今後の拡張候補

- ユーザー認証（RFC 005 として定義予定）
- データベース永続化（現在は in-memory）
- ログ出力の標準化
- メトリクス収集
- より複雑な業務ルールの追加
- Visual Regression Test (Chromatic)
- Accessibility (a11y) チェック
- E2E テスト (Playwright)

これらは RFC を書き、guardrails を満たす形で実装されます。

## リポジトリの位置づけ

このリポジトリは本番用の完成品ではなく、**AI 駆動開発のテンプレート**です。

- Guard によってアーキテクチャが守られるか
- AI が RFC を読んで正しく実装できるか
- Result<T> パターンがエラーハンドリングに有効か
- OpenAPI を SSOT として扱えるか
- Storybook を UI の SSOT として扱えるか

これらを検証し、実践するためのテンプレートとして位置づけています。

## ライセンス

MIT

## 生成情報

🤖 Generated with [Claude Code](https://claude.com/claude-code)
