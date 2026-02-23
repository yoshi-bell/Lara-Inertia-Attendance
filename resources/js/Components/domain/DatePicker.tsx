import * as React from 'react';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/Components/ui/button';
import { Calendar } from '@/Components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/Components/ui/popover';

interface DatePickerProps {
    date: string; // YYYY-MM-DD 形式
    onChange: (date: string) => void;
}

/**
 * 共通日付選択コンポーネント (Shadcn UI Calendar + Popover)
 */
export default function DatePicker({ date, onChange }: DatePickerProps) {
    // 文字列の日付を Date オブジェクトに変換
    const selectedDate = date ? parseISO(date) : undefined;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={'ghost'}
                    className={cn(
                        'flex w-auto items-center gap-2 p-0 text-left font-bold text-black hover:bg-transparent',
                        !date && 'text-muted-foreground'
                    )}
                >
                    <CalendarIcon className="h-6 w-6 text-black" />
                    <span className="text-xl">
                        {selectedDate
                            ? format(selectedDate, 'yyyy/MM/dd', { locale: ja })
                            : '日付を選択'}
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => d && onChange(format(d, 'yyyy-MM-dd'))}
                    initialFocus
                    locale={ja}
                />
            </PopoverContent>
        </Popover>
    );
}
