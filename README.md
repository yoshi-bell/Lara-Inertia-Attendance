# Lara-Inertia-Attendance

旧勤怠管理アプリ（Blade版）を、最新の技術スタック（Laravel 12 / Inertia.js / React / TypeScript）でフルリファクタリングしたモダンモノリス・アプリケーションです。

## 🚀 リファクタリングによる進化ポイント

本プロジェクトは、単なる機能の移植にとどまらず、保守性とユーザー体験を極限まで高めるためのリファクタリングを実施しています。

- **モダンモノリス構成:** Inertia.js を採用し、API 分離の手間を省きつつ SPA (Single Page Application) のような高速な操作感を実現。
- **型安全性の追求:** フロントエンド・バックエンド共に TypeScript と厳格な型定義を導入し、ランタイムエラーを未然に防ぐ堅牢なコードベースを構築。
- **UI/UX のアップグレード:** Shadcn UI を導入。ネイティブ入力を排除し、直感的な日付・月選択ピッカー（DatePicker / MonthPicker）を自作。
- **高度なビジネスロジック:** 
    - 24時間を超える勤務や、深夜0時を跨ぐ休憩時間も正確に算出する「深夜勤務対応ロジック」を搭載。
    - リダイレクト先などの重要設定を `config/project.php` に集約し、高いメンテナンス性を確保。
- **コンポーネント指向:** 勤怠テーブルやナビゲーションを共通パーツ化し、DRY（Don't Repeat Yourself）原則を徹底。

---

## 🛠 使用技術 (Tech Stack)

### Backend
- **Framework:** Laravel 12 (PHP 8.4)
- **Authentication:** Laravel Breeze (Inertia版)
- **Database:** MySQL 8.0
- **Dev Tool:** Laravel Sail (Docker), Laravel Pint

### Frontend
- **Library:** React 19
- **Language:** TypeScript (Strict Mode)
- **Bridge:** Inertia.js v2
- **Styling:** Tailwind CSS, Shadcn/ui
- **Icons:** Lucide React

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
./vendor/bin/sail npm run dev
```

### 2. 各ツールへのアクセス
- **アプリケーション:** [http://localhost](http://localhost)
- **Mailpit (メール確認):** [http://localhost:8025](http://localhost:8025)
- **phpMyAdmin:** [http://localhost:8080](http://localhost:8080)

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
