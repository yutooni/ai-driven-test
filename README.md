# AI-Driven Development Test

このリポジトリは、AI駆動開発アーキテクチャの実践例です。Claude Codeを使用して、guardrailベースの開発フローを検証しています。

## コンセプト

**AI（Claude Code）が実装担当、人間が設計・判断を担当**

- RFCで仕様を定義
- Guardrailでアーキテクチャルールを明文化
- AIが実装し、guardスクリプトで自動検証
- 人間は設計判断と最終承認に専念

## プロジェクト構成

```
.
├── docs/
│   ├── rfc/                    # 仕様定義（Request for Comments）
│   │   ├── 001_init.md
│   │   └── 002_add_message_echo.md
│   └── guardrails/             # アーキテクチャルール
│       ├── architecture.md     # 依存関係ルール
│       ├── coding_rules.md     # コーディング規約
│       └── acceptance_criteria.md
├── openapi/
│   └── openapi.yaml            # API契約（SSOT）
├── scripts/
│   └── guards/
│       └── judge.js            # アーキテクチャ検証スクリプト
├── src/
│   ├── domain/                 # ドメイン層（依存なし）
│   ├── usecase/                # ユースケース層
│   └── presentation/           # プレゼンテーション層
└── tests/                      # テスト
```

## アーキテクチャルール

### レイヤー依存関係

```
presentation → usecase → domain
```

- **domain**: 他層への依存禁止、外部I/O禁止、非決定性禁止
- **usecase**: domainのみ依存可、外部I/O禁止（orchestration層）
- **presentation**: usecaseのみ依存可（domainへの直接依存は禁止）

### 自動検証（Guards）

`npm run guard` で以下を検証：

1. **domain-purity**: domain層に外部依存がないか（express等）
2. **usecase-purity**: usecase層に外部I/O依存がないか（express, process.env, fetch, axios等）
3. **dependency-direction**: レイヤー依存方向が正しいか（presentation → usecase のみ、presentation → domain は禁止）
4. **openapi-consistency**: OpenAPI定義とrouter実装が一致するか
5. **domain-determinism**: domain層に非決定性コードがないか（Date.now, Math.random, process.env等）
6. **anti-shortcut**: 暫定対応コードがないか（any, @ts-ignore, .skip(), .only()等）

## 実装済み機能

### GET /health
ヘルスチェックエンドポイント

```bash
curl http://localhost:3000/health
# => {"status":"ok"}
```

### POST /messages
メッセージエコーエンドポイント

```bash
curl -X POST http://localhost:3000/messages \
  -H "Content-Type: application/json" \
  -d '{"message":"hello"}'
# => {"message":"hello"}
```

空文字の場合は400エラー:
```bash
curl -X POST http://localhost:3000/messages \
  -H "Content-Type: application/json" \
  -d '{"message":""}'
# => {"error":"message must not be empty"}
```

## セットアップ

```bash
npm install
```

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# テスト実行
npm test

# Lint
npm run lint

# 型チェック
npm run typecheck

# Guard実行（アーキテクチャ検証）
npm run guard
```

## 開発フロー

1. **RFC作成**: `docs/rfc/` に仕様を記述
2. **Guardrail確認**: `docs/guardrails/` のルールを確認
3. **実装**: Claude Codeが実装
4. **検証**: test/lint/typecheck/guard すべてGREEN
5. **コミット**: 人間が最終確認してコミット

## Guard検証例

### ❌ 違反例1: presentation層がdomainに直接依存

```typescript
// src/presentation/messagesHandler.ts
import { EchoMessage } from '../domain/EchoMessage.js'; // NG: usecaseを経由すべき
```

```bash
npm run guard
# ✗ guard:dependency-direction failed
#   - src/presentation/messagesHandler.ts: presentation must not depend on domain
```

### ❌ 違反例2: usecase層でprocess.env使用

```typescript
// src/usecase/EchoMessageUseCase.ts
const env = process.env.NODE_ENV; // NG: 外部I/O依存
```

```bash
npm run guard
# ✗ guard:usecase-purity failed
#   - src/usecase/EchoMessageUseCase.ts: external I/O dependency detected (process.env)
```

### ❌ 違反例3: domain層で非決定性コード

```typescript
// src/domain/EchoMessage.ts
const timestamp = Date.now(); // NG: 非決定的
```

```bash
npm run guard
# ✗ guard:domain-determinism failed
#   - src/domain/EchoMessage.ts: non-deterministic code detected (Date.now())
```

### ❌ 違反例4: テストにskip残存

```typescript
// tests/health.test.ts
it.skip('should return 200', async () => { // NG: 暫定対応
```

```bash
npm run guard
# ✗ guard:anti-shortcut failed
#   - tests/health.test.ts: shortcut detected (.skip()
```

### ✅ 正常例

```bash
npm run guard
# ✓ guard:domain-purity passed
# ✓ guard:usecase-purity passed
# ✓ guard:dependency-direction passed
# ✓ guard:openapi-consistency passed
# ✓ guard:domain-determinism passed
# ✓ guard:anti-shortcut passed
#
# ✓ All guard checks passed
```

## 特徴

### 1. 契約駆動開発
OpenAPI仕様を契約のSSOTとし、実装との整合性を自動検証

### 2. レイヤードアーキテクチャ
依存関係を明確にし、guardで自動検証

### 3. 厳密なレイヤー純粋性
- domain層: 外部依存なし、非決定性なし、完全にテスタブル
- usecase層: 外部I/Oなし、orchestration専念
- presentation層: usecaseのみ依存、domainへの直接アクセス禁止

### 4. AI協調開発
人間は設計・判断、AIは実装・検証を担当

## ライセンス

MIT

## 生成情報

🤖 Generated with [Claude Code](https://claude.com/claude-code)
