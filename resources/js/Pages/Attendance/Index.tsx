import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
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
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    勤怠打刻
                </h2>
            }
        >
            <Head title="勤怠打刻" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <span className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                            {attendanceStatus.statusText}
                        </span>
                    </div>

                    <Card className="mb-12 shadow-md">
                        <CardContent className="p-12 text-center">
                            <p className="text-xl text-gray-600 mb-2">
                                {formatDate(currentTime)}
                            </p>
                            <p className="text-6xl font-mono font-bold tracking-tighter text-gray-900">
                                {formatTime(currentTime)}
                            </p>
                        </CardContent>
                    </Card>

                    {attendanceStatus.hasFinishedWork ? (
                        <div className="text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                            <p className="text-2xl font-bold text-gray-500">お疲れ様でした。</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {!attendanceStatus.isWorking && (
                                <Button 
                                    onClick={() => handleAction('attendance.start')}
                                    className="h-32 text-2xl font-bold bg-blue-600 hover:bg-blue-700"
                                >
                                    出勤
                                </Button>
                            )}

                            {attendanceStatus.isWorking && !attendanceStatus.isOnBreak && (
                                <>
                                    <Button 
                                        onClick={() => handleAction('attendance.end')}
                                        variant="destructive" 
                                        className="h-32 text-2xl font-bold"
                                    >
                                        退勤
                                    </Button>
                                    <Button 
                                        onClick={() => handleAction('rest.start')}
                                        variant="outline" 
                                        className="h-32 text-2xl font-bold border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                                    >
                                        休憩入
                                    </Button>
                                </>
                            )}

                            {attendanceStatus.isWorking && attendanceStatus.isOnBreak && (
                                <Button 
                                    onClick={() => handleAction('rest.end')}
                                    className="h-32 text-2xl font-bold bg-blue-600 hover:bg-blue-700"
                                >
                                    休憩戻
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}