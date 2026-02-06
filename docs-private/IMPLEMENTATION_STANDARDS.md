# 🟢 メタ定義: このファイルの責務 (AIエージェント用)
> **AIエージェントへの指示 (Prompt Repetition Strategy):** 
> このファイルはプロジェクトの「詳細な実装ルール」を定義しています。
> 実装作業（コーディング、リファクタリング、レビュー）を行う際に読み込み、スタイルや規約を遵守してください。

*   **役割:** コーディング規約、コメント規則、命名規則、フレームワーク特有の実装パターンの定義。
*   **読むべきタイミング:** 実装タスク開始時、またはコードレビュー時。
*   **思考の優先順位:** `RULES_AND_ARCHITECTURE.md` の「憲法」に従いつつ、本書の「法律」を守る。

---

# Lara-Inertia-Attendance コーディングガイドライン (Coding Guidelines)

## 🎨 実装ガイドライン (Implementation Guidelines)

### フロントエンド (React / Inertia.js / Tailwind CSS)
*   **TypeScript Strict:** 全ての TSX ファイルで厳格な型定義を行い、`any` を原則禁止する。
*   **Inertia Links:** ページ遷移には Inertia の `<Link>` コンポーネントを使用し、SPA 特有の滑らかな遷移を実現する。
*   **自動整形:** `prettier-plugin-tailwindcss` を適用し、クラス名の並び順を統一する。
*   **スタイリング:** モバイルファーストを徹底し、ユーティリティクラスに直接記述する。`@apply` は原則禁止。
*   **Shadcn/ui 活用:** UI コンポーネントには Shadcn/ui を積極的に採用し、一貫性のあるデザインを高速に構築する。

### バックエンド (Laravel)
*   **命名規則:** クラス名は `PascalCase`、メソッド・変数は `camelCase`、DBカラムは `snake_case` を厳守。
*   **クリーンコード:** コントローラーの責務を最小限に抑える（Thin Controller）。
    *   バリデーション → `FormRequest`
    *   ビジネスロジック・クエリ → `Service`
    *   レスポンス整形 → `JsonResource`

### 🛠️ 共通ルール (Common Rules)
* **論理式の明示的なグルーピング:** 演算子の優先順位（`&&` と `||` の強弱など）に依存せず、括弧 `()` を使用して判定の塊を明示する。
    * **Bad:** `return isAxiosError(e) && e.response !== undefined;`
    * **Good:** `return isAxiosError(e) && (e.response !== undefined);`

---

## 📝 コメント規則 (Commenting Rules)
コードの可読性と保守性を高めるため、以下のルールを遵守する。

### 1. 意図を語る (Intent over Implementation)
*   **悪い例:** コードを見れば分かることをそのまま書く。
    ```javascript
    // iを1増やす
    i++;
    ```
*   **良い例:** 「なぜ」その処理が必要なのか、背景や目的を書く。
    ```javascript
    // 配列の次の要素に移動するためにインデックスをインクリメント
    i++;
    ```

### 2. ドキュメンテーションコメント (DocBlocks)
*   公開メソッド（Service, Controller, Hooks）には、IDEの補完や他の開発者の理解を助けるために JSDoc / PHPDoc を記述する。
*   `@param`, `@return`, `@throws` などを活用し、入出力と例外を明確にする。

```php
/**
 * 指定された条件で店舗を検索する。
 * 
 * @param array $filters 検索条件（area_id, genre_id, name）
 * @return Collection 検索結果の店舗リスト
 */
public function getFilteredShops(array $filters): Collection
```

### 3. 特殊コメントタグ
実装上の注意点や技術的負債を明示するために、以下のタグを使用する。

*   `TODO:` 後で実装・修正が必要な箇所。
*   `FIXME:` 既知の不具合があり、修正が必要な箇所。
*   `WARNING:` 注意が必要な実装や、非推奨な使用法。
*   `NOTE:` 実装の背景や、一見奇妙に見えるコードの理由説明（重要）。

### 4. 自己文書化コード (Self-Documenting Code)
コメントを書く前に、まずコード自体を分かりやすくできないか検討する（Refactor First）。

*   **変数名:** `const d = 86400;` ではなく `const SECONDS_PER_DAY = 86400;` とする。
*   **関数抽出:** 複雑な条件式 (`if (x && y || z)`) は、意味のある名前の関数 (`if (isValidUser(user))`) に抽出する。

---

## 📂 ディレクトリ構造と責務 (Directory Structure)

### フロントエンド (`resources/js`)
*   `Pages/`: Inertia ページコンポーネント（コントローラーから直接呼び出される）。
*   `Components/`: 再利用可能な UI コンポーネント。
*   `Layouts/`: 共通レイアウト（ヘッダー、サイドバー等）。
*   `Types/`: TypeScript 型定義。
*   `Lib/`: ユーティリティ、外部ライブラリ設定。

### バックエンド (`app`)
*   `Http/Controllers/`: リクエスト受付と `Inertia::render` によるビュー返却。
*   `Http/Requests/`: FormRequest によるバリデーション。
*   `Services/`: ビジネスロジック、複雑なクエリの集約。
*   `Models/`: Eloquent モデル、リレーション、キャスト定義。

---

## 🏗️ 標準アーキテクチャ・パターン (Standard Patterns)

### 1. サーバー駆動の型安全 × 自動生成 (Server-Driven Type Safety)
*   **ツール:** `spatie/laravel-data` + `spatie/typescript-transformer` (または類似ツール)
*   **実装:** バックエンドの DTO/Resource から TypeScript の型定義 (`types/generated.d.ts`) を自動生成する。
*   **効果:** PHP側の変更が即座にReactの型エラーとして検知され、手動定義による不整合をゼロにする。

### 2. Hybridバリデーション (UX & Security)
*   **即時チェック (UX):** 入力時に `Zod` で軽微なミス（必須、形式）をクライアントサイドで弾き、快適な操作感を提供する。
*   **最終チェック (Security):** 送信後は `FormRequest` で厳密なチェック（DB重複確認など）を行い、堅牢性を担保する。
*   **連携:** Inertia がサーバーサイドのエラーを受け取り、Zod のエラーと合わせて表示する。

### 3. Service層とDTOによるデータフローの統一
*   **パターン:** Service は配列ではなく「型付きの DTO」を返す。
*   **フロー:** `Controller` → `Service` → `DTO` → `Inertia` → `React Props`
*   **効果:** ロジックを分離しつつ、Service から React まで一直線に型がつながる開発体験を実現する。

---

## 🧪 テスト実装ガイドライン (Testing Guidelines)

### 1. Backend: 統合テスト (Pest / PHPUnit)
*   **Props 検証:** `assertInertia` ヘルパーを使用し、コントローラーが正しい React コンポーネントを呼び出し、期待通りのデータ（Props）を渡しているかを検証する。
*   **ビジネスロジック:** Service ククラスの単体テストを優先し、DB 状態の遷移を確実にチェックする。

### 2. Frontend: E2E テスト (Playwright)
*   **戦略:** `npx playwright test` による高速な並列実行を基本とし、失敗時は `--workers=1` で競合（Flaky）を切り分ける「2段階戦略」を継承する。
*   **目的:** ログイン、打刻、承認といったユーザーの主要なジャーニーが一貫して成功することを保証する。

### 3. 型安全性の維持と妥協点
*   **原則:** テストコードにおいても TypeScript の型定義を適用し、不整合を早期に検知する。`any` 型は極力排除し、`vi.Mock` や適切なインターフェースを使用すること。
*   **例外的な `any` の許容:** 
    *   Inertia や外部ライブラリの型定義が極めて複雑で、モックの型合わせに過大な工数を要する場合は、実務的な判断として `any` の使用を許容する。
    *   その際は、該当箇所のみ `// eslint-disable-next-line @typescript-eslint/no-explicit-any` を使用して、意図的な使用であることを明示する。
    *   **「型を完璧に合わせること」よりも「テストが網羅されていること」を優先する。**
