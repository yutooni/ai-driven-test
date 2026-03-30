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

- **domain**: 他層への依存禁止、外部I/O禁止
- **usecase**: domainのみ依存可
- **presentation**: usecase, domainに依存可

### 自動検証（Guards）

`npm run guard` で以下を検証：

1. **domain-purity**: domain層に外部依存がないか
2. **dependency-direction**: レイヤー依存方向が正しいか
3. **openapi-consistency**: OpenAPI定義とrouter実装が一致するか

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

### ❌ 違反例1: domain層がpresentationに依存

```typescript
// src/domain/EchoMessage.ts
import { messagesHandler } from '../presentation/messagesHandler.js'; // NG
```

```bash
npm run guard
# ✗ guard:dependency-direction failed
#   - src/domain/EchoMessage.ts: domain must not depend on presentation
```

### ❌ 違反例2: OpenAPI未定義のroute実装

```typescript
// src/presentation/router.ts
router.get('/undocumented', handler); // OpenAPIに未記載
```

```bash
npm run guard
# ✗ guard:openapi-consistency failed
#   - Router implements GET /undocumented but it's not documented in OpenAPI
```

### ✅ 正常例

```bash
npm run guard
# ✓ guard:domain-purity passed
# ✓ guard:dependency-direction passed
# ✓ guard:openapi-consistency passed
#
# ✓ All guard checks passed
```

## 特徴

### 1. 契約駆動開発
OpenAPI仕様を契約のSSOTとし、実装との整合性を自動検証

### 2. レイヤードアーキテクチャ
依存関係を明確にし、guardで自動検証

### 3. ドメイン純粋性
domain層は外部依存を持たず、テスタブルで移植性が高い

### 4. AI協調開発
人間は設計・判断、AIは実装・検証を担当

## ライセンス

MIT

## 生成情報

🤖 Generated with [Claude Code](https://claude.com/claude-code)
