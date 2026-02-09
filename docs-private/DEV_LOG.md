# Lara-Inertia-Attendance 開発ログ (Development Log)

## 概要

このドキュメントは、旧勤怠アプリ（Laravel 8 / Blade）を、最新の技術スタック（Laravel 12 / Inertia / React / TypeScript）へリファクタリングするプロセス、技術的決定事項、および学習の軌跡を記録するものです。

---

## 2026-02-06: プロジェクト始動とドキュメント基盤の確立

### 1. プロジェクトの目的と方針

- **目的:** 既存の勤怠アプリを現代的なアーキテクチャで再構築し、保守性とユーザー体験を向上させる。
- **基本方針:**
    - **Inertia.js によるモダンモノリス:** API分離の手間を省きつつ、SPAのような高速な操作感を実現。
    - **TypeScript の徹底:** フロントエンド・バックエンド共に型安全性を追求。
    - **ドキュメント駆動開発:** `lara-next-reserve` で確立した「憲法・法律・マニュアル」の仕組みを継承し、AIとの高度な協働を維持する。

### 2. 環境構築とドキュメント整備

- **Laravel 12 初期化:** `curl` コマンドを使用して最新の Laravel Sail 環境を構築。
- **ドキュメント移植と最適化:**
    - `RULES_AND_ARCHITECTURE.md` (憲法): Inertia モノリス構成に合わせて刷新。
    - `IMPLEMENTATION_STANDARDS.md` (実装標準): 旧コーディング規約をリネーム。型自動生成や Hybrid バリデーションの方針を明文化。論理式の括弧使用ルールを追加。
    - `WORKFLOW.md` (ロードマップ): リファクタリング用の 5 Phase ロードマップを策定。
    - `AGENT_RECOVERY_MANUAL.md` (復旧手順): 新環境の検証項目へ更新。
- **Laravel Breeze (Inertia/React) の導入:**
    - `breeze:install react --typescript` を実行し、認証基盤と React 環境を構築。
    - **技術的課題と解決:** `npm install` 時に Vite 7 と `@types/node` のバージョン不整合による `ERESOLVE` エラーに遭遇。`@types/node@latest` の明示的インストールと `--legacy-peer-deps` フラグの使用により、依存関係を正常に解消。
    - **動作確認:** ユーザー登録からダッシュボード表示までの一連の SPA 動作を確認。
- **品質管理ツール (Lint/Format) の設定:**
    - **PHP:** Laravel Pint を導入し、Laravel 標準スタイルでの自動整形を確認。
    - **React/TypeScript:** Prettier (Tailwindプラグイン付) と ESLint (Flat Config) を導入。
    - **プロジェクト憲法の反映:** ESLint において `any` 型の使用を禁止し、Prettier でクラス名の自動並び替えを強制。

### 3. データとモデルの移行 (Phase 2)

- **マイグレーションの移植:**
    - 旧プロジェクトから `attendances`, `rests`, `attendance_corrections`, `rest_corrections` のテーブル定義を移植。
    - 最新の無名クラスマイグレーション形式へリファクタリングして適用。
- **`users` テーブルの拡張:** 管理者機能を見据え、`is_admin` カラムを初期マイグレーションに追加。
- **データベース構築:** `migrate:fresh` により、全7テーブル（認証系含む）の構築が正常に完了したことを確認。
- **Eloquent モデルの移植:**
    - `Attendance`, `Rest`, `AttendanceCorrection`, `RestCorrection` の各モデルを新規作成。
    - 旧プロジェクトからリレーションおよびビジネスロジック（計算アクセサ）を忠実に移植。
- **シーディング基盤の構築:**
    - 旧プロジェクトの `UserSeeder`, `AttendancesTableSeeder`, `AttendanceCorrectionSeeder` を移植。
    - **安定性の確保:** 工夫によるデグレードを避けるため、旧プロジェクトのランダムデータ生成ロジック（昨日を起点に過去60日分）をそのまま再現。
    - **データ投入成功:** 約1300件の勤怠・休憩データ、および約80件の修正申請データを生成し、開発環境を整えた。

### 4. 一般ユーザー機能の実装 (Phase 3)

- **フロントエンド基盤の強化 (Shadcn/ui):**
    - Shadcn/ui を導入し、モダンな UI コンポーネント（Button, Input, Card 等）を利用可能にした。
    - **設計判断:** ディレクトリ構造を整理。React コンポーネントは大文字開始（`Components`, `Pages`）、ロジック・ユーティリティは小文字開始（`lib`, `types`）という慣習を確立し、`IMPLEMENTATION_STANDARDS.md` を更新。
- **認証画面のリファクタリング:**
    - `Login.tsx`, `Register.tsx` を Shadcn/ui を使用して再構築。
    - 旧プロジェクトのデザイン（タイトル、ラベル、リンク構成）を忠実に再現しつつ、UI 品質を向上させた。
- **打刻機能（Attendance/Index）の実装:**
    - **フロントエンド:** React の `useEffect` を用いたリアルタイムクロックを実装。Shadcn/ui の `Card` や `Button` を活用し、旧プロジェクトのデザインをモダンに再現。
    - **バックエンド:** `AttendanceService` を新設し、打刻ロジック（二重出勤防止、休憩中退勤不可など）を集約。コントローラーの肥大化を防ぎつつ、旧プロジェクトの仕様を完全移植。
    - **Inertia 連携:** `router.post` を活用し、SPA 特有の高速な状態遷移（打刻後のボタン切り替わり）を実現。

### 2026-02-06 (続き): 勤怠一覧機能の構築とレイアウトの刷新

#### 1. デザイン再現のためのレイアウト刷新

- **設計判断:** Laravel Breeze 標準の `AuthenticatedLayout` は白系統のデザインであり、旧プロジェクトの「黒ヘッダー」「背景色 #F0EFF2」を再現するには構造的な乖離が大きかったため、学習も兼ねて `AttendanceLayout.tsx` を新規作成。
- **実装内容:**
    - 旧プロジェクトの `common.css` および `app.blade.php` の構造を React (Tailwind CSS) で忠実に再現。
    - 黒いヘッダー、ロゴ画像、シンプルなテキストリンクによるナビゲーションを実装。
    - `title` と `headerContent` を Props として受け取る設計にすることで、各ページ固有のヘッダー要素（月次ナビゲーションなど）を柔軟に差し込めるようにした。
- **ロゴの移植:** 旧プロジェクトから `logo.svg` を `public/images/` に移植。

#### 2. 勤怠一覧ページ（Attendance/List）の実装

- **Shadcn/ui の活用:** `Table` コンポーネント群を使用し、アクセシビリティと保守性を確保。
- **デザインの再現:** 旧プロジェクトの `attendance-list.css` のトンマナを Tailwind クラスで再現。
    - `tracking-[3px]` による文字間隔の調整。
    - `border-b-[3px]` や `#E1E1E1` を用いたボーダーの再現。
    - `rounded-[10px]` による角丸の適用。
- **月次ナビゲーション:** `AttendanceLayout` の `headerContent` を利用し、前月・翌月への切り替えリンクを実装。`router.get` による月指定の遷移を実現。

#### 3. ルーティングとコントローラーの拡張

- **詳細画面の準備:** `routes/web.php` に詳細表示用ルートを追加。
- **コントローラー:** `AttendanceController` に `show` メソッドを追加し、詳細ページ（`Attendance/Detail`）へのレンダリングを定義。

### 2026-02-09: TypeScript 型定義ポリシーの厳格化と勤怠詳細ページの実装

#### 1. TypeScript 偏差値向上を目指した「最強の法律」の策定

- **背景:** スコアの向上とプロジェクトの堅牢性確保のため、型定義ポリシーを大幅に強化。
- **実装内容:**
    - `IMPLEMENTATION_STANDARDS.md` を更新し、`any` 禁止、`unknown` + 型ガードの義務化、`as const` による定数一元管理、Zod との統合、命名規則 (`[Component]Props`) を明文化。
    - `resources/js/types/models.d.ts` を新設し、SSOT (Single Source of Truth) の原則に基づく中央集権的な型管理を開始。
- **効果:** AI エージェントへの指示が「型システム」レベルで厳格化され、開発品質の底上げを実現。

#### 2. 勤怠詳細ページ（Attendance/Detail）のモダンリファクタリング

- **型設計:** 新ポリシーに基づき、`useForm<CorrectionForm>` のジェネリクス明示や、モデル型の継承・交差型を駆使した厳密な Props 定義を実施。
- **レイアウト課題と解決:**
    - Shadcn UI のデフォルトスタイル（`w-full`, `display: flex`）が旧デザインの再現（固定幅ラベル等）と衝突する問題に直面。
    - **技術的判断:** フレームワークの干渉を排除するため、標準の `input`, `textarea` タグへ原点回帰。
    - **決定打:** Tailwind の JIT ビルドや Flexbox の自動計算に依存せず、`style` 属性（インラインスタイル）でピクセル単位の幅 (`256px`) を強制適用。これにより、最も堅牢な方法でレイアウトを固定。
- **機能実装:**
    - 既存の休憩データから動的にフォーム値を生成するロジックを実装。
    - 「承認待ち申請」の有無による動的な UI 切り替え（編集不可状態の視覚的表現）を実現。

### 2026-02-09 (続き): 修正申請機能のバックエンド実装

#### 1. FormRequest の移植と強化
- `AttendanceCorrectionRequest` を作成。
- 旧プロジェクトのバリデーションロジック（出退勤の順序チェック、休憩時間の重複チェック）を完全移植。
- PHP 8.4 の型定義と Route Model Binding を活用して記述を最適化。

#### 2. Service層の実装とトラブルシューティング
- `CorrectionService` を実装し、トランザクションを用いた安全なデータ保存（申請本体 + 休憩修正）を実現。
- **エラー解決:** `Field 'requester_id' doesn't have a default value` エラーが発生。
    - **原因:** 新プロジェクト作成時にカラム名を `user_id` に変更しようとしたが、DBスキーマは旧プロジェクトの `requester_id` のままであったため不整合が発生。
    - **対処:** 旧プロジェクトの仕様を「正」とし、サービス側の記述を `requester_id` に修正して解決。

#### 3. コントローラーとルーティング
- `AttendanceController@storeCorrection` を実装し、申請完了後のリダイレクトとフラッシュメッセージを設定。
- `POST /attendance/{attendance}/correction` ルートを開通。

#### 4. フロントエンドの UX 改善とバリデーション強化
- **エラー表示の網羅:** `Detail.tsx` において、出退勤および休憩時間の各入力項目に対してバリデーションエラーメッセージの表示処理を追加。動的なキー名 (`rests.1.start_time` 等) に対応。
- **入力制限の厳格化:** `input[type="time"]` へのキーボード入力を無効化 (`onKeyDown`) し、クリック時に標準ピッカーを強制起動 (`showPicker`) させることで、誤入力を防ぎ UX を向上させた。
- **ブラウザバリデーションの無効化:** `noValidate` を追加し、サーバーサイドのバリデーション結果を確実に表示するように調整。

### 2026-02-10: 申請一覧ページの実装と基本設計書への完全準拠

#### 1. 申請一覧ページ (US009) の構築
- **共通コンポーネント化:** 管理者機能での再利用を見据え、`CorrectionList.tsx` を共通コンポーネントとして実装。承認待ち/承認済みのタブ切り替え機能を統合。
- **Inertia 連携:** クエリパラメータ (`status`) による表示データの動的なフィルタリングを実現。
- **UI 再現:** 旧プロジェクトのテーブル構造とタブデザインを Shadcn UI Table と Tailwind で再現。

#### 2. 基本設計書に基づくルーティングの精査・修正
- **パスの完全一致:** `web.php` を基本設計書 (CSV) および旧プロジェクトの定義と突き合わせ、詳細画面 (`/attendance/detail/{id}`) や申請一覧 (`/stamp_correction_request/list`)、送信パス (`/attendances/correction/{id}`) を正確に反映。
- **整合性の確保:** ナビゲーションリンクおよび `Detail.tsx` 内の `route()` 名を一斉に修正し、設計書通りの URL 体系を確立。

#### 3. セキュリティとプライバシーの配慮
- `docs-private/project-detail` フォルダを Git 管理から除外し、リモートリポジトリから削除することで機密情報を保護。

### 5. 次のステップ
- Phase 4: 管理者機能の実装（管理者認証・マルチガード）。
- 管理者用日次勤怠一覧および承認フローの構築。

- 管理者用機能（承認フロー）の構築。
- 月次ナビゲーションにおける「月選択（カレンダー）」機能の強化。
