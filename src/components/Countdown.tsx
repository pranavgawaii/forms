import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';

interface CountdownProps {
    deadline: string | Date;
    isDark?: boolean;
}

export default function Countdown({ deadline, isDark }: CountdownProps) {
    const [timeLeft, setTimeLeft] = useState<string | null>(null);
    const [isUrgent, setIsUrgent] = useState(false);

    useEffect(() => {
        const target = new Date(deadline).getTime();

        const updateTimer = () => {
            const now = new Date().getTime();
            const distance = target - now;

            if (distance < 0) {
                setTimeLeft('Deadline passed');
                setIsUrgent(false);
                return;
            }

            // Check if less than 24 hours (86,400,000 ms)
            if (distance < 86400000) {
                setIsUrgent(true);
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                setTimeLeft(
                    `${hours.toString().padStart(2, '0')}:${minutes
                        .toString()
                        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')} remaining`
                );
            } else {
                setIsUrgent(false);
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                setTimeLeft(`${days}d ${hours}h remaining`);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [deadline]);

    if (!timeLeft) return null;

    return (
        <div className={cn(
            "text-[10px] font-bold mt-1.5 flex items-center justify-center gap-1.5",
            isUrgent
                ? "text-red-500 animate-pulse"
                : (isDark ? "text-white/60" : "text-zinc-400")
        )}>
            <div className={cn(
                "h-1 w-1 rounded-full",
                isUrgent ? "bg-red-500" : (isDark ? "bg-white/40" : "bg-zinc-300")
            )} />
            {timeLeft}
        </div>
    );
}
