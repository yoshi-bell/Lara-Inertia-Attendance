import * as React from 'react';
import { format, parse } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/Components/ui/popover';

interface MonthPickerProps {
    month: string; // "2026年02月" 形式
    onChange: (month: string) => void; // "YYYY-MM" 形式で返す
}

/**
 * 月選択に特化したピッカーコンポーネント
 */
export default function MonthPicker({ month, onChange }: MonthPickerProps) {
    // 表示用の文字列から日付オブジェクトを生成
    const initialDate = parse(month, 'yyyy年MM月', new Date());
    const [viewDate, setViewDate] = React.useState(initialDate);

    const months = [
        '1月',
        '2月',
        '3月',
        '4月',
        '5月',
        '6月',
        '7月',
        '8月',
        '9月',
        '10月',
        '11月',
        '12月',
    ];

    const handleMonthClick = (monthIndex: number) => {
        const newDate = new Date(viewDate.getFullYear(), monthIndex, 1);
        onChange(format(newDate, 'yyyy-MM'));
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={'ghost'}
                    className="flex w-auto items-center gap-2 p-0 text-left font-bold text-black hover:bg-transparent"
                >
                    <CalendarIcon className="h-6 w-6 text-black" />
                    <span className="text-xl">
                        {month.replace('年', '/').replace('月', '')}
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-3 shadow-md" align="center">
                {/* 年の切り替えヘッダー */}
                <div className="mb-4 flex items-center justify-between">
                    <Button
                        variant="outline"
                        size="icon"
                        type="button"
                        onClick={() =>
                            setViewDate(new Date(viewDate.getFullYear() - 1, 0))
                        }
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="font-bold text-lg">{viewDate.getFullYear()}年</span>
                    <Button
                        variant="outline"
                        size="icon"
                        type="button"
                        onClick={() =>
                            setViewDate(new Date(viewDate.getFullYear() + 1, 0))
                        }
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                {/* 月のグリッド選択 */}
                <div className="grid grid-cols-3 gap-2">
                    {months.map((m, index) => (
                        <Button
                            key={m}
                            variant={
                                viewDate.getFullYear() ===
                                    initialDate.getFullYear() &&
                                index === initialDate.getMonth()
                                    ? 'default'
                                    : 'ghost'
                            }
                            className="h-10 font-medium"
                            type="button"
                            onClick={() => handleMonthClick(index)}
                        >
                            {m}
                        </Button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
