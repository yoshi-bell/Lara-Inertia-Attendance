# 戦略的リファクタリング・ロードマップ (Strategic Refactoring Roadmap)

本プロジェクトの保守性・堅牢性、および開発効率（DX）を最大化するためのロードマップです。
特に「ドキュメント駆動開発」と「自動化」を軸に、プロフェッショナルな開発プロセスへの進化を目指します。

---

## 🚀 Step 1: 基盤整理 (完了済み)

- **[Frontend] URLクエリパラメータ構築の共通化:** `buildQueryParams` 作成。
- **[Frontend] SWRデータフェッチ処理の汎用化:** `useData<T>` フック作成。

## 🎯 Step 2: 開発者体験 (DX) の革新 (完了済み)

- **[Fullstack] OpenAPIによる型定義の自動同期システム:** Scribe + openapi-typescript 導入。

## 🛡️ Step 3: 品質強化 (完了済み)

- **[Frontend] Zodによるバリデーション:** スキーマ定義とランタイム検証。
- **[Frontend] テストコードの any 型撲滅:** モックの型安全性向上。

---

## 💎 Step 3.5: 型安全性の深化 (Advanced TypeScript)

TypeScriptの高度な機能（型ガード、共用体、ユーティリティ型）を活用し、コンパイルレベルでの安全性と設計品質をさらに高めます。

### 6. カスタム型ガード (User-Defined Type Guards) の導入

- **内容:** `isApiError(error): error is ApiError` のような型ガード関数を作成し、`try-catch` ブロック内での `any` や `as` キャストを排除する。
- **効果:** エラーハンドリングの型安全性が保証され、安全なプロパティアクセスが可能になる。

### 7. Utility Types (Pick, Omit, Partial) の積極利用

- **内容:** `ShopCardProps` などのコンポーネントProps定義において、`interface` を再定義するのではなく、`Pick<Shop, 'id' | 'name'>` 等を用いて元の型から派生させる。
- **効果:** 大元の型（OpenAPI生成型）が変更された際の影響範囲を最小化し、DRY（Don't Repeat Yourself）原則を徹底する。

### 8. Discriminated Unions（判別可能な共用体）による状態管理

- **内容:** `useData` などの戻り値を、`{ isLoading: true, data: undefined } | { isLoading: false, data: T }` のように排他な状態として定義し直す。
- **効果:** 「ローディング中なのにデータを使おうとする」といった論理的矛盾を、コンパイルエラーとして検知可能にする。

---

## 🏆 Step 4: さらなる高みへ (Expert TypeScript)

高度な型安全性と設計パターンです。

### 9. Branded Types (Nominal Typing) の導入

- **内容:** `number` 型のIDを `ShopId`, `UserId` といった「ブランド化された型」として定義し、異なる種類のID同士の誤代入をコンパイルエラーにする。
- **効果:** プリミティブ型に依存したバグ（引数の順序間違いなど）を静的に防ぐ。実務レベルの高い安全性アピールになる。

### 10. Single Source of Truth (Zod Schema Inference)

- **内容:** `src/types/index.ts` の手動型定義を廃止し、`src/lib/schemas.ts` のZodスキーマから `z.infer<typeof schema>` で型を自動生成して利用する。
- **効果:** 「バリデーションロジック」と「型定義」の二重管理を解消。仕様変更時の修正漏れがゼロになる。

### 11. Polymorphic Components (as props pattern)

- **内容:** `Button` や `Text` などの汎用コンポーネントを作成し、`<Text as="h1">` や `<Button as={Link}>` のようにレンダリング要素を動的に、かつ型安全に変更できるコンポーネントを実装する。
- **効果:** Reactの高度な型パターンの理解を示し、再利用性の高いUI設計能力を証明する。

---

## 🛠️ Step 5: 継続的改善 (Maintenance)

優先度は低いが、長期的な保守性のために実施を検討する項目です。

### 12. [Frontend] フォーム実装の刷新 (React Hook Form)

- **内容:** `useState` 管理のフォームを `react-hook-form` + `zod` へ移行。
- **効果:** 複雑なフォームバリデーションの管理を簡潔かつ宣言的にする。

### 13. [Frontend] TypeScript設定のさらなる厳格化

- **内容:** `noUnusedLocals` 等のオプションを `tsconfig.json` に追加。
- **効果:** 未使用コードの混入を自動で防ぎ、コードベースを常に清潔に保つ。
