# Lara-Inertia-Attendance 開発ログ (Development Log)

## 概要
このドキュメントは、旧勤怠アプリ（Laravel 8 / Blade）を、最新の技術スタック（Laravel 12 / Inertia / React / TypeScript）へリファクタリングするプロセス、技術的決定事項、および学習の軌跡を記録するものです。

---

## 2026-02-06: プロジェクト始動とドキュメント基盤の確立

### 1. プロジェクトの目的と方針
*   **目的:** 既存の勤怠アプリを現代的なアーキテクチャで再構築し、保守性とユーザー体験を向上させる。
*   **基本方針:**
    *   **Inertia.js によるモダンモノリス:** API分離の手間を省きつつ、SPAのような高速な操作感を実現。
    *   **TypeScript の徹底:** フロントエンド・バックエンド共に型安全性を追求。
    *   **ドキュメント駆動開発:** `lara-next-reserve` で確立した「憲法・法律・マニュアル」の仕組みを継承し、AIとの高度な協働を維持する。

### 2. 環境構築とドキュメント整備
*   **Laravel 12 初期化:** `curl` コマンドを使用して最新の Laravel Sail 環境を構築。
*   **ドキュメント移植と最適化:** 
    *   `RULES_AND_ARCHITECTURE.md` (憲法): Inertia モノリス構成に合わせて刷新。
    *   `IMPLEMENTATION_STANDARDS.md` (実装標準): 旧コーディング規約をリネーム。型自動生成や Hybrid バリデーションの方針を明文化。論理式の括弧使用ルールを追加。
    *   `WORKFLOW.md` (ロードマップ): リファクタリング用の 5 Phase ロードマップを策定。
    *   `AGENT_RECOVERY_MANUAL.md` (復旧手順): 新環境の検証項目へ更新。
*   **Laravel Breeze (Inertia/React) の導入:**
    *   `breeze:install react --typescript` を実行し、認証基盤と React 環境を構築。
    *   **技術的課題と解決:** `npm install` 時に Vite 7 と `@types/node` のバージョン不整合による `ERESOLVE` エラーに遭遇。`@types/node@latest` の明示的インストールと `--legacy-peer-deps` フラグの使用により、依存関係を正常に解消。
    *   **動作確認:** ユーザー登録からダッシュボード表示までの一連の SPA 動作を確認。
*   **品質管理ツール (Lint/Format) の設定:**
    *   **PHP:** Laravel Pint を導入し、Laravel 標準スタイルでの自動整形を確認。
    *   **React/TypeScript:** Prettier (Tailwindプラグイン付) と ESLint (Flat Config) を導入。
    *   **プロジェクト憲法の反映:** ESLint において `any` 型の使用を禁止し、Prettier でクラス名の自動並び替えを強制。

### 3. データとモデルの移行 (Phase 2)
*   **マイグレーションの移植:** 
    *   旧プロジェクトから `attendances`, `rests`, `attendance_corrections`, `rest_corrections` のテーブル定義を移植。
    *   最新の無名クラスマイグレーション形式へリファクタリングして適用。
*   **`users` テーブルの拡張:** 管理者機能を見据え、`is_admin` カラムを初期マイグレーションに追加。
*   **データベース構築:** `migrate:fresh` により、全7テーブル（認証系含む）の構築が正常に完了したことを確認。

### 4. 次のステップ
*   Eloquent モデルの作成とリレーション定義（旧プロジェクトからの移植）。
*   PHP DocBlock による型定義の整備。
*   開発用シーダーの作成。
