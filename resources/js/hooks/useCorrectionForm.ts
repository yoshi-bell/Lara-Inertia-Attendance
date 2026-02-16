import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { Attendance, Rest } from '@/types/models';

/**
 * 修正申請フォームのデータ構造定義
 */
export interface CorrectionFormType {
    requested_start_time: string;
    requested_end_time: string;
    rests: Record<
        string | number,
        {
            start_time: string;
            end_time: string;
        }
    >;
    reason: string;
}

interface UseCorrectionFormProps {
    attendance: Attendance & { rests: Rest[] };
    isAdmin: boolean;
}

/**
 * 勤怠修正フォームの共通ロジックを管理するカスタムフック
 */
export function useCorrectionForm({
    attendance,
    isAdmin,
}: UseCorrectionFormProps) {
    // 最新の attendance データから初期値を生成する関数
    const getInitialValues = (att: typeof attendance): CorrectionFormType => ({
        requested_start_time: att.start_time_hi || '',
        requested_end_time: att.end_time_hi || '',
        rests: att.rests.reduce(
            (acc, rest) => ({
                ...acc,
                [rest.id]: {
                    start_time: rest.start_time_hi || '',
                    end_time: rest.end_time_hi || '',
                },
            }),
            { new: { start_time: '', end_time: '' } }
        ),
        reason: '',
    });

    const form = useForm<CorrectionFormType>(getInitialValues(attendance));

    /**
     * 【修正】ステート同期ロジックの適正化
     * reset() を呼ぶと古い初期値に戻ってしまうリスクがあるため、
     * setData() だけを使って現在のフォーム値を強制的に最新化する。
     */
    useEffect(() => {
        const freshValues = getInitialValues(attendance);
        form.setData(freshValues);
    }, [attendance.updated_at]);

    /**
     * 送信処理のラップ
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
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
        handleSubmit,
    };
}
