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
export function useCorrectionForm({ attendance, isAdmin }: UseCorrectionFormProps) {
    
    // 時間フォーマットヘルパー (2026-02-09T08:00... -> 08:00)
    const formatTimeForInput = (dateTimeStr: string | null | undefined) => {
        if (!dateTimeStr) return '';
        return dateTimeStr.includes('T') 
            ? dateTimeStr.split('T')[1].substring(0, 5) 
            : dateTimeStr.substring(0, 5);
    };

    // 初期値を生成するロジック
    const getInitialValues = (att: typeof attendance): CorrectionFormType => ({
        requested_start_time: formatTimeForInput(att.start_time),
        requested_end_time: formatTimeForInput(att.end_time),
        rests: att.rests.reduce(
            (acc, rest) => ({
                ...acc,
                [rest.id]: {
                    start_time: formatTimeForInput(rest.start_time),
                    end_time: formatTimeForInput(rest.end_time),
                },
            }),
            { new: { start_time: '', end_time: '' } }
        ),
        reason: '',
    });

    const form = useForm<CorrectionFormType>(getInitialValues(attendance));

    /**
     * サーバー側のデータ更新を検知してステートを自動同期
     */
    useEffect(() => {
        form.setData(getInitialValues(attendance));
        form.reset();
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
            form.post(route('attendances.correction.store', attendance.id), options);
        }
    };

    return {
        ...form,
        handleSubmit,
        formatTimeForInput,
    };
}
