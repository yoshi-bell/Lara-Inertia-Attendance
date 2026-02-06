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

### 3. 次のステップ
*   Phase 1: 基盤再構築を開始。Inertia.js および Laravel Breeze の導入。
