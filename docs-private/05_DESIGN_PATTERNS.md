# 🟢 メタ定義: このファイルの責務 (AIエージェント用)
> **AIエージェントへの指示 (Prompt Repetition Strategy):** 
> このファイルは「機能実装の設計パターンと堅牢性」の正解を定義しています。
> 新機能の設計、型定義、バリデーションロジックの構築、Service層の実装時に必ず読み込んでください。

*   **役割:** TypeScript 型ポリシー、Service/DTO パターン、バリデーション戦略、アーキテクチャパターンの定義。
*   **読むべきタイミング:** 設計フェーズ、型定義時、バックエンドロジック構築時。

---

# Lara-Inertia-Attendance 設計パターン (Design Patterns)

## 🛡️ TypeScript 型定義ポリシー (Type Safety Policy)
* **any 禁止:** `any` 型の使用を原則禁止。不明な場合は `unknown` + 型ガードを使用。
* **SSOT (Single Source of Truth):** `resources/js/types/models.d.ts` を唯一の正解とし、型を中央集権化する。
*   **Inertia × TypeScript:**
    *   **ジェネリクス必須:** `useForm<T>`, `usePage<PageProps>` のように型引数を明示し、送信データとエラーメッセージの型を厳格に管理する。
    *   **PageProps の継承:** 全てのページコンポーネント（`Pages/` 配下）の Props は、共通の `PageProps` 型を継承し、Inertia 共有データ（auth, flash等）への型安全なアクセスを保証する。
    *   **usePage の型付け:** `usePage<PageProps>()` を使用し、グローバルな共有データにアクセスする際も型を効かせる。

* **Utility Types の活用:** 新しい型を作る際は、手動で再定義せず `Pick`, `Omit`, `Partial` 等を用いて既存モデルから派生させる。
* **定数管理:** ステータス等は `as const` で管理し、Union Types を自動生成する。
* **コンポーネント型:** Props 型は `[Component Name]Props` と命名しエクスポートする。

---

## 🏗️ アーキテクチャ・パターン

### 1. Service層とDTOによるデータフロー
*   **パターン:** `Controller` → `Service` → `DTO` → `Inertia` → `React Props`
*   Service は配列ではなく「型付きの DTO」を返し、フロントエンドまで型を繋げる。

### 2. Hybridバリデーション
*   **UX:** フロントエンドで `Zod` による即時チェック。
*   **Security:** バックエンドで `FormRequest` による厳密なチェック。
*   **連携:** Inertia を通じてサーバーサイドエラーを UI に反映。

---

## 🔒 サーバー駆動の型安全
*   バックエンドのモデルや DTO の変更が、TypeScript の型定義に自動反映される（または手動で同期される）仕組みを重視する。
