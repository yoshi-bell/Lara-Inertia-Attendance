# 🔵 メタ定義: このファイルの責務 (AIエージェント用)
> **AIエージェントへの指示 (Prompt Repetition Strategy):** 
> このファイルはプロジェクトの「設計図」であり「憲法」です。
> 実装を開始する前に、内容を**「合計2回」**読み込み、不変の原則（Inertiaモノリス・TypeScript徹底・テスト駆動）を完全に理解してください。

*   **役割:** プロジェクトの「仕様」「設計方針」「不変の原則」の定義。
*   **読むべきタイミング:** 新しい機能の実装、DB変更、または設計上の判断が必要な時。
*   **思考の優先順位:** 設計と方針に関して最優先。ここにある原則に反するコードを書いてはならない。
*   **詳細な実装ルール:** コーディング規約、設計パターン、テスト指針については、下部の **「ドキュメントナビゲーション」** に従い、`04_CODING_RULES.md`, `05_DESIGN_PATTERNS.md`, `06_TESTING_GUIDE.md` を参照すること。

---

# Lara-Inertia-Attendance ルールとアーキテクチャ (Rules & Architecture)

## ⚖️ プロジェクト憲法 (The Constitution)
> **警告:** 以下のルールは、本プロジェクトにおいて**最優先される絶対的な制約**である。
> AIエージェントは独自の判断でこれに違反する提案や実装を行ってはならない。

1.  **言語と対話の厳守 (Japanese Only Policy):**
    *   思考、応答、ユーザーとの対話、およびドキュメント記述はすべて**日本語**で行うこと。
    *   英語での応答は、コード内の識別子や技術用語を除き、原則禁止とする。
    *   Gitコミットメッセージは「日本語」かつ「プレフィックス（`feat:`, `fix:`, `docs:`, `test:`, `chore:`, `refactor:`）」を必ず使用すること。
2.  **型安全性の徹底 (Type Safety First):**
    *   フロントエンドは **TypeScript (TSX)** を必須とし、`any` 型の使用を原則禁止する。
    *   **サーバー駆動型 SSOT:** フロントエンドの型定義を手動で作成・保守してはならない。必ずバックエンドの Data クラスを一次情報（SSOT）とし、自動生成された型定義を利用すること。
    *   バックエンド（PHP）も型宣言（引数・戻り値）を徹底し、静的解析可能なコードを保つこと。
3.  **品質の保証 (Testing & Verification):**
    *   リファクタリングの過程で、既存機能のデグレードを防ぐため、必ず対応するテスト（Pest/PHPUnit または Playwright）を作成・実行すること。
4.  **モダンモノリスの原則 (Modern Monolith):**
    *   Laravel と React を **Inertia.js** で結合する。APIを分離せず、コントローラーから直接 `Inertia::render` でビューを返すこと。

---

## 🏗️ アーキテクチャと設計思想 (Architecture & Philosophy)

### アーキテクチャ: Inertia Monolith
*   **Backend:** Laravel 12 (PHP 8.4)
*   **Frontend:** React 19 + TypeScript + Tailwind CSS (Shadcn/ui)
*   **Bridge:** Inertia.js (APIレスなSPA体験)
*   **Build Tool:** Vite

### 認証 (Authentication)
*   **Laravel Breeze (Inertia/React)** を採用。
*   ステートフルなセッション認証（Cookie）を使用し、複雑なトークン管理を排除する。

### 開発方針
*   **技術スタックの刷新:** 
    *   Bladeテンプレートを廃止し、すべて **React (TypeScript)** で書き直す。
    *   コンポーネント指向（Atomic Design または 機能単位）でUIを構築する。
*   **ドキュメント駆動開発:**
    *   実装前に必ず設計をドキュメント化し、実装後にログを残すサイクルを徹底する。

---

## 🔒 技術仕様と重要ルール (Technical Specs & Rules)

### データベース設計
*   **マイグレーション:** Laravel 11/12 の標準構成に準拠し、必要に応じて旧プロジェクトのスキーマを移植・最適化する。
*   **モデル:** Eloquent モデルは型定義（PHP DocBlock や `cast`）を充実させる。

### バリデーション
*   **Backend:** FormRequest で厳密に検証。
*   **Frontend:** バックエンドのバリデーションエラーを Inertia が自動的に Props として受け取る機能を活用する。追加で Zod を用いたクライアントサイド検証も推奨。

---

## 📚 ドキュメントナビゲーション
AIエージェントは、現在のタスクに応じて以下のファイルを読み込むこと。

1.  **コーディング中:** `04_CODING_RULES.md`（命名、スタイル、ディレクトリ構造）
2.  **実装パターン検討中:** `05_DESIGN_PATTERNS.md`（設計、型ポリシー、バリデーション）
3.  **テスト作成中:** `06_TESTING_GUIDE.md`（テスト戦略、モック、各テストフレームワーク）

---

## 📂 ドキュメント構成 (Documentation Structure)

*   **`03_WORKFLOW.md`:** 開発の手順書・ロードマップ（作業時はこれを常に見る）。
*   **`04_CODING_RULES.md`:** コーディング規約（旧 99_OLD_IMPLEMENTATION_STANDARDS.md の一部）。
*   **`05_DESIGN_PATTERNS.md`:** 設計パターン（旧 99_OLD_IMPLEMENTATION_STANDARDS.md の一部）。
*   **`06_TESTING_GUIDE.md`:** テスト指針（旧 99_OLD_IMPLEMENTATION_STANDARDS.md の一部）。
*   **`07_DEV_LOG.md`:** 開発ログ。
*   **`01_AGENT_RECOVERY_MANUAL.md`:** エージェント復旧マニュアル。
