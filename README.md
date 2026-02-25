# Lara-Inertia-Attendance

旧勤怠管理アプリ（Blade版）を、最新の技術スタック（Laravel 12 / Inertia.js / React / TypeScript）でフルリファクタリングしたモダンモノリス・アプリケーションです。

## 🚀 リファクタリングによる進化ポイント
本プロジェクトは、単なる機能の移植にとどめず、保守性とユーザー体験を高めるためのリファクタリングを実施しました。

- **モダンモノリス構成:** Inertia.js を採用し、API 分離の手間を省きつつ SPA (Single Page Application) のような高速な操作感を実現。
- **サーバー駆動型 SSOT:** `spatie/laravel-data` を導入。バックエンドの Data Object を一次情報とし、TypeScript 型定義を自動生成するパイプラインを確立。
- **型安全性とランタイム検証:** 
    - フロントエンド・バックエンド共に TypeScript と厳格な型定義を導入。
    - **Zod 統合:** 静的型定義に加え、実行時バリデーションを認証・勤怠修正の全フォームに導入。
    - **メッセージ一元管理:** 独自の JSON 基盤により、フロント・バック両層のエラーメッセージを完全に同期。
- **UI/UX のアップグレード:** 
    - Shadcn UI を導入し、直感的な日付・月選択ピッカー（DatePicker / MonthPicker）を独自実装。
    - **抽象化された表示基盤:** 汎用データテーブル (`AppDataTable`) を開発し、プロジェクト内の全一覧表示を一元管理。
- **高度なビジネスロジック:** 
    - 24時間を超える勤務や、深夜0時を跨ぐ休憩時間も正確に算出する「深夜勤務対応ロジック」を搭載。
    - リダイレクト先などの重要設定を `config/project.php` に集約し、保守性を確保。
- **品質保証の徹底:** 
    - **GitHub Actions (CI)** による継続的インテグレーション。
    - **Playwright** によるブラウザ自動テスト (E2E)。
    - **Vitest** による「生きたモック」を活用したコンポーネント単体テスト。
    - 合計 **135 件** のテストケースを 100% カバー。

---

## 🛠 使用技術 (Tech Stack)

### Backend
- **Framework:** Laravel 12 (PHP 8.4)
- **Data Layer:** `spatie/laravel-data` (DTO)
- **Authentication:** Laravel Breeze (Inertia/React版)
- **Database:** MySQL 8.0
- **Quality:** Laravel Pint, PHPUnit (Feature Test)

### Frontend
- **Library:** React 19
- **Language:** TypeScript (Strict Mode)
- **Validation:** Zod
- **Bridge:** Inertia.js v2
- **Styling:** Tailwind CSS, Shadcn/ui
- **Quality:** ESLint, Prettier, Vitest (Unit Test), Playwright (E2E Test)

---

## 📖 機能一覧

### 1. 一般ユーザー機能
- **打刻機能:** 出勤、退勤、休憩入、休憩戻のリアルタイム打刻。
- **勤怠一覧:** 月次カレンダー表示。月選択ピッカーによる直感的な月移動。
- **修正申請:** 過去の勤怠に対する詳細確認と、管理者への修正申請フロー。
- **メール認証:** 会員登録時の本人確認プロセス。

### 2. 管理者機能
- **日次勤怠管理:** 全ユーザーの当日データを一覧表示。日付選択ピッカーによる日別確認。
- **スタッフ管理:** 全一般ユーザーの一覧表示と、スタッフ別の月次詳細閲覧。
- **CSVエクスポート:** 各スタッフの月次勤怠データを Excel 対応形式 (CP932) で出力。
- **申請承認フロー:** ユーザーからの修正申請を一括管理し、ワンクリックで承認・データ反映。

---

## 📦 環境構築

### 前提条件
- Docker / Docker Desktop
- Git

### 1. セットアップ

```bash
# リポジトリをクローン
git clone git@github.com:yoshi-bell/Lara-Inertia-Attendance.git
cd Lara-Inertia-Attendance

# ライブラリのインストール
docker run --rm \
    -u "$(id -u):$(id -g)" \
    -v "$(pwd):/var/www/html" \
    -w /var/www/html \
    laravelsail/php84-composer:latest \
    composer install --ignore-platform-reqs

# .env の作成
cp .env.example .env

# Sail の起動
./vendor/bin/sail up -d

# アプリケーションキーの生成
./vendor/bin/sail php artisan key:generate

# データベースの構築と日本語テストデータの生成
./vendor/bin/sail php artisan migrate:fresh --seed

# フロントエンドのビルド
./vendor/bin/sail npm install
./vendor/bin/sail npm run build

# E2E テスト用のブラウザをインストール (初回のみ)
./vendor/bin/sail npx playwright install
```

### 2. 各ツールへのアクセス
- **アプリケーション:** [http://localhost](http://localhost)
- **Mailpit (メール確認):** [http://localhost:8025](http://localhost:8025)
- **phpMyAdmin:** [http://localhost:8080](http://localhost:8080)

---

## 🧪 テストと品質管理

堅牢なアプリケーションを維持するため、多層的な自動テストを導入しています。

### テスト実行
```bash
# 全てのバックエンドテスト (Feature / Model)
./vendor/bin/sail test

# フロントエンド単体テスト (Vitest)
./vendor/bin/sail npm run test:unit

# E2E テスト (Playwright)
./vendor/bin/sail npm run test:e2e
```

### GitHub Actions (CI)
GitHub へプッシュ・PR作成を行うたびに、以下の工程が自動実行されます。
1. **Lint:** PHP (Pint) / JS (ESLint) の整形・規約チェック
2. **Build:** TypeScript のコンパイルおよび Vite ビルド
3. **Tests:** PHPUnit / Vitest / Playwright の全 **135 件** のテスト実行

---

## 👤 テストユーザー

シーディングにより、以下の日本語テストデータが作成されます。

- **管理者**
  - メール: `admin@example.com`
  - パスワード: `adminpass`
- **一般ユーザー (30名)**
  - メール: `test1@example.com` 〜 `test30@example.com`
  - パスワード: `usertest`

---

## 🛡 ライセンス
[MIT license](https://opensource.org/licenses/MIT).
