import AttendanceLayout from '@/Layouts/AttendanceLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

/**
 * メール認証待ち画面 (FN011, FN012 対応)
 *
 * 【設計意図】
 * 1. デザイン: 旧プロジェクト auth/verify-email.blade.php のフォントサイズ(24px)等を忠実に再現。
 * 2. 開発効率: 開発環境において、メールボックス (Mailpit) へ直接遷移できるボタンを設置。
 *
 * @param {Object} props
 * @param {string} [props.status] 再送ステータス
 * @returns {JSX.Element} メール認証案内コンポーネント
 */
export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    /**
     * 認証メールの再送リクエスト
     */
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <AttendanceLayout title="メール認証のご案内">
            <Head title="メール認証のご案内" />

            <div className="verify-email__content mx-auto text-center">
                {/* メインメッセージ (旧プロジェクトのデザイン数値を反映) */}
                <p className="mb-[62px] mt-[180px] text-[24px] font-bold leading-[1.2] text-black">
                    登録していただいたメールアドレスに
                    <br />
                    認証メールを送信しました。
                    <br />
                    メール認証を完了してください。
                </p>

                {/* 成功メッセージ (再送時) */}
                {status === 'verification-link-sent' && (
                    <div className="verify-email-form__success-message mb-5 rounded-[5px] border border-[#c3e6cb] bg-[#d4edda] p-[10px] text-[#155724]">
                        新しい認証リンクをあなたのメールアドレスに送信しました。
                    </div>
                )}

                {/* 
                  【Why: 開発効率の極大化】
                  ローカル開発環境 (Sail) において、認証メールを確認するために 
                  Mailpit (localhost:8025) へ即座にアクセスできるよう専用ボタンを設置。
                */}
                <div className="form__button mb-[62px]">
                    <a
                        href="http://localhost:8025"
                        target="_blank"
                        rel="noreferrer"
                        className="form__button--auth-link inline-block h-[70px] w-[256px] rounded-[10px] border border-black bg-[#D9D9D9] py-[18px] text-[24px] font-bold text-black transition-opacity hover:opacity-70"
                    >
                        認証はこちらから
                    </a>
                </div>

                {/* 認証メール再送フォーム */}
                <form onSubmit={submit} noValidate>
                    <button
                        type="submit"
                        disabled={processing}
                        className="login__button-submit text-[20px] text-[#0073CC] transition-opacity hover:opacity-70 disabled:opacity-50"
                    >
                        認証メールを再送する
                    </button>
                </form>
            </div>
        </AttendanceLayout>
    );
}
