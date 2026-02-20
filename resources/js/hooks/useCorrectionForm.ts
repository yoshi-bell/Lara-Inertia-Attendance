/* cspell:ignore inertiajs */
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { Attendance } from '@/types/models';
import { isAttendance } from '@/lib/utils';
import { performZodValidation } from '@/lib/validation';
import {
    correctionSchema,
    type CorrectionFormType,
} from '@/schemas/correctionSchema';

interface UseCorrectionFormProps {
    attendance: Attendance;
    isAdmin: boolean;
}

/**
 * Attendance 型に reason プロパティを許容するための拡張型定義
 * (SSOT の Data Object 側で定義されるのが理想だが、フロントエンドで一時的に扱うための定義)
 */
type AttendanceWithOptionalReason = Attendance & {
    reason?: string | null;
};

/**
 * 勤怠修正フォームの共通ロジックを管理するカスタムフック
 */
export function useCorrectionForm({
    attendance,
    isAdmin,
}: UseCorrectionFormProps) {
    // 【型ガードの活用例】開発中の誤ったデータ注入を早期検知（コンソール警告）
    if (import.meta.env.DEV && !isAttendance(attendance)) {
        console.warn(
            'Warning: useCorrectionForm received invalid attendance data.'
        );
    }

    // 最新の attendance データから初期値を生成する関数
    const getInitialValues = (att: Attendance): CorrectionFormType => {
        const extendedAtt = att as AttendanceWithOptionalReason;

        return {
            requested_start_time: att.start_time_hi || '',
            requested_end_time: att.end_time_hi || '',
            rests: (att.rests || []).reduce(
                (acc, rest) => ({
                    ...acc,
                    [rest.id]: {
                        start_time: rest.start_time_hi || '',
                        end_time: rest.end_time_hi || '',
                    },
                }),
                { new: { start_time: '', end_time: '' } }
            ),
            // 拡張した型定義経由で安全にアクセス
            reason: extendedAtt.reason ?? '',
        };
    };

    const form = useForm<CorrectionFormType>(getInitialValues(attendance));

    /**
     * ステート同期ロジック
     * 親コンポーネント側で attendance が更新された際、フォームの値を最新化する。
     */
    useEffect(() => {
        form.setData(getInitialValues(attendance));
        form.clearErrors();
    }, [attendance.updated_at]);

    /**
     * フロントエンドバリデーションの実行
     */
    const validate = () => {
        form.clearErrors();
        const result = correctionSchema.safeParse(form.data);

        // 共通ユーティリティを使用。
        // 勤怠修正は複数の不備（重複と範囲外など）を同時に知らせる必要があるため、全メッセージを結合表示する。
        return performZodValidation(
            result,
            form.setError as (path: string, message: string) => void,
            { joinMessages: true }
        );
    };

    /**
     * 送信処理のラップ
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // 送信前にフロントエンドバリデーションを実行
        if (!validate()) return;

        const options = { preserveScroll: true };
        if (isAdmin) {
            form.put(route('admin.attendance.update', attendance.id), options);
        } else {
            form.post(
                route('attendances.correction.store', attendance.id),
                options
            );
        }
    };

    return {
        ...form,
        validate,
        handleSubmit,
    };
}
