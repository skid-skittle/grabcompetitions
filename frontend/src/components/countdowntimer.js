import { useState, useEffect } from 'react';

export const CountdownTimer = ({ endDate, size = 'default' }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        const difference = new Date(endDate) - new Date();
        
        if (difference <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };
        }

        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
            ended: false
        };
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [endDate]);

    if (timeLeft.ended) {
        return (
            <div className="text-[#FF3B3B] font-heading uppercase tracking-wider text-sm">
                Draw Ended
            </div>
        );
    }

    const sizeClasses = {
        small: {
            container: 'gap-1',
            box: 'w-10 h-10',
            number: 'text-lg',
            label: 'text-[8px]'
        },
        default: {
            container: 'gap-2',
            box: 'w-14 h-14 md:w-16 md:h-16',
            number: 'text-xl md:text-2xl',
            label: 'text-[9px]'
        },
        large: {
            container: 'gap-3',
            box: 'w-20 h-20 md:w-24 md:h-24',
            number: 'text-3xl md:text-4xl',
            label: 'text-xs'
        }
    };

    const classes = sizeClasses[size] || sizeClasses.default;

    const TimeUnit = ({ value, label }) => (
        <div className="flex flex-col items-center">
            <div className={`${classes.box} bg-[#161616] border border-white/10 flex items-center justify-center rounded-lg`}>
                <span className={`font-heading font-bold text-white ${classes.number}`}>
                    {String(value).padStart(2, '0')}
                </span>
            </div>
            <span className={`font-heading uppercase tracking-[0.15em] text-white/50 mt-1 ${classes.label}`}>
                {label}
            </span>
        </div>
    );

    return (
        <div className={`flex items-center ${classes.container}`} data-testid="countdown-timer">
            <TimeUnit value={timeLeft.days} label="Days" />
            <span className="text-white/30 font-heading text-xl">:</span>
            <TimeUnit value={timeLeft.hours} label="Hours" />
            <span className="text-white/30 font-heading text-xl">:</span>
            <TimeUnit value={timeLeft.minutes} label="Mins" />
            <span className="text-white/30 font-heading text-xl">:</span>
            <TimeUnit value={timeLeft.seconds} label="Secs" />
        </div>
    );
};