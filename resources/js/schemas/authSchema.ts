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
