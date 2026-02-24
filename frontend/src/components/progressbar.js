export const ProgressBar = ({ current, total, showPercentage = true }) => {
    const percentage = Math.min((current / total) * 100, 100);
    const isLow = percentage < 20;
    const isHigh = percentage > 80;

    return (
        <div className="w-full" data-testid="progress-bar">
            <div className="flex justify-between items-center mb-2">
                <span className="text-white/50 text-sm">
                    {current.toLocaleString()} / {total.toLocaleString()} sold
                </span>
                {showPercentage && (
                    <span className={`text-sm font-semibold ${isHigh ? 'text-[#FF3B3B]' : isLow ? 'text-green-500' : 'text-white'}`}>
                        {percentage.toFixed(0)}% sold
                    </span>
                )}
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${
                        isHigh 
                            ? 'bg-gradient-to-r from-[#FF3B3B] to-[#FF6B6B]' 
                            : isLow 
                                ? 'bg-gradient-to-r from-green-500 to-green-400' 
                                : 'bg-gradient-to-r from-[#FFD700] to-[#FFA500]'
                    }`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {isHigh && (
                <p className="text-[#FF3B3B] text-xs mt-2 font-semibold uppercase tracking-wider animate-pulse">
                    Only {total - current} tickets left!
                </p>
            )}
        </div>
    );
};