import { z } from 'zod';
import { formatMessage } from '@/lib/utils';
import messages from '@/constants/validation_messages.json';

/**
 * ログインフォームのバリデーションスキーマ
 */
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, messages.EMAIL_REQUIRED)
        .email(messages.EMAIL_FORMAT),
    password: z.string().min(1, messages.PASSWORD_REQUIRED),
});

/**
 * 会員登録フォームのバリデーションスキーマ
 */
export const registerSchema = z
    .object({
        name: z
            .string()
            .min(1, messages.NAME_REQUIRED)
            .max(255, formatMessage(messages.MAX_LENGTH, { max: 255 })),
        email: z
            .string()
            .min(1, messages.EMAIL_REQUIRED)
            .email(messages.EMAIL_FORMAT)
            .max(255, formatMessage(messages.MAX_LENGTH, { max: 255 })),
        password: z
            .string()
            .min(1, messages.PASSWORD_REQUIRED)
            .min(8, formatMessage(messages.PASSWORD_MIN, { min: 8 })),
        password_confirmation: z
            .string()
            .min(1, messages.PASSWORD_CONFIRM_REQUIRED),
    })
    .superRefine((data, ctx) => {
        if (data.password !== data.password_confirmation) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: messages.PASSWORD_CONFIRMED,
                path: ['password_confirmation'],
            });
        }
    });

/**
 * 型の抽出
 */
export type LoginFormType = z.infer<typeof loginSchema>;
export type RegisterFormType = z.infer<typeof registerSchema>;

/**
 * パスワードリセット要求フォームのバリデーションスキーマ
 */
export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .min(1, messages.EMAIL_REQUIRED)
        .email(messages.EMAIL_FORMAT),
});

/**
 * パスワード再設定フォームのバリデーションスキーマ
 */
export const resetPasswordSchema = z
    .object({
        token: z.string(),
        email: z
            .string()
            .min(1, messages.EMAIL_REQUIRED)
            .email(messages.EMAIL_FORMAT),
        password: z
            .string()
            .min(1, messages.PASSWORD_REQUIRED)
            .min(8, formatMessage(messages.PASSWORD_MIN, { min: 8 })),
        password_confirmation: z
            .string()
            .min(1, messages.PASSWORD_CONFIRM_REQUIRED),
    })
    .superRefine((data, ctx) => {
        if (data.password !== data.password_confirmation) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: messages.PASSWORD_CONFIRMED,
                path: ['password_confirmation'],
            });
        }
    });

/**
 * パスワード確認フォームのバリデーションスキーマ
 */
export const confirmPasswordSchema = z.object({
    password: z.string().min(1, messages.PASSWORD_REQUIRED),
});

export type ForgotPasswordFormType = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormType = z.infer<typeof resetPasswordSchema>;
export type ConfirmPasswordFormType = z.infer<typeof confirmPasswordSchema>;
