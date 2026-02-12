import AttendanceLayout from '@/Layouts/AttendanceLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

/**
 * メール認証待ち画面 (FN011, FN012 対応)
 * 旧プロジェクト auth/verify-email.blade.php のデザインを忠実に再現
 */
export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

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

                {/* 開発環境用：Mailpitへの認証リンクボタン */}
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
