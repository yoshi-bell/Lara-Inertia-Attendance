import AttendanceLayout from '@/Layouts/AttendanceLayout';
import { Button } from '@/Components/ui/button';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface Props {
    attendanceStatus: {
        statusText: string;
        isWorking: boolean;
        isOnBreak: boolean;
        hasFinishedWork: boolean;
    };
}

export default function Index({ attendanceStatus }: Props) {
    const [currentTime, setCurrentTime] = useState(new Date());

    // リアルタイム時計の更新
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // 打刻アクションの実行
    const handleAction = (routePath: string) => {
        router.post(route(routePath));
    };

    // 日時フォーマット用ユーティリティ
    const formatDate = (date: Date) => {
        const days = ['日', '月', '火', '水', '木', '金', '土'];
        return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日(${days[date.getDay()]})`;
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });
    };

    return (
        <AttendanceLayout>
            <Head title="勤怠打刻" />

            <div className="mx-auto max-w-2xl">
                <div className="mb-8 text-center">
                    <span className="text-xl font-bold text-black">
                        {attendanceStatus.statusText}
                    </span>
                </div>

                <div className="mb-12 rounded-[10px] bg-white p-12 text-center shadow-sm">
                    <p className="mb-2 text-xl font-bold text-gray-900">
                        {formatDate(currentTime)}
                    </p>
                    <p className="font-mono text-6xl font-bold tracking-tighter text-gray-900">
                        {formatTime(currentTime)}
                    </p>
                </div>

                {attendanceStatus.hasFinishedWork ? (
                    <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
                        <p className="text-3xl font-bold text-gray-400">お疲れ様でした。</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {!attendanceStatus.isWorking && (
                            <Button 
                                onClick={() => handleAction('attendance.start')}
                                className="h-32 text-2xl font-bold bg-black hover:bg-gray-800 rounded-md"
                            >
                                出勤
                            </Button>
                        )}

                        {attendanceStatus.isWorking && !attendanceStatus.isOnBreak && (
                            <>
                                <Button 
                                    onClick={() => handleAction('attendance.end')}
                                    className="h-32 text-2xl font-bold bg-black hover:bg-gray-800 rounded-md"
                                >
                                    退勤
                                </Button>
                                <Button 
                                    onClick={() => handleAction('rest.start')}
                                    variant="outline" 
                                    className="h-32 text-2xl font-bold border-2 border-black text-black hover:bg-gray-50 rounded-md"
                                >
                                    休憩入
                                </Button>
                            </>
                        )}

                        {attendanceStatus.isWorking && attendanceStatus.isOnBreak && (
                            <Button 
                                onClick={() => handleAction('rest.end')}
                                className="h-32 text-2xl font-bold bg-black hover:bg-gray-800 rounded-md"
                            >
                                休憩戻
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </AttendanceLayout>
    );
}