import { useState } from 'react';
import { Minus, Plus, Shuffle } from 'lucide-react';
import { Button } from './ui/button';

export const TicketSelector = ({ 
    ticketPrice, 
    maxTickets, 
    availableTickets,
    onChange,
    disabled = false
}) => {
    const [count, setCount] = useState(1);
    const maxAllowed = Math.min(maxTickets, availableTickets);

    const updateCount = (newCount) => {
        const validCount = Math.max(1, Math.min(newCount, maxAllowed));
        setCount(validCount);
        onChange?.(validCount);
    };

    const handleLuckyDip = () => {
        const randomCount = Math.floor(Math.random() * maxAllowed) + 1;
        updateCount(randomCount);
    };

    const quickOptions = [1, 5, 10, 25].filter(n => n <= maxAllowed);

    return (
        <div className="space-y-6" data-testid="ticket-selector">
            {/* Quantity Selector */}
            <div className="flex items-center justify-center gap-4">
                <button
                    onClick={() => updateCount(count - 1)}
                    disabled={count <= 1 || disabled}
                    className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    data-testid="ticket-decrease"
                >
                    <Minus size={20} />
                </button>
                
                <div className="w-24 h-16 bg-[#161616] border border-white/20 rounded-lg flex items-center justify-center">
                    <span className="font-heading text-4xl font-bold text-white">{count}</span>
                </div>
                
                <button
                    onClick={() => updateCount(count + 1)}
                    disabled={count >= maxAllowed || disabled}
                    className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    data-testid="ticket-increase"
                >
                    <Plus size={20} />
                </button>
            </div>

            {/* Quick Options */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
                {quickOptions.map((num) => (
                    <button
                        key={num}
                        onClick={() => updateCount(num)}
                        disabled={disabled}
                        className={`px-4 py-2 rounded-lg font-heading uppercase text-sm transition-all ${
                            count === num
                                ? 'bg-[#FF3B3B] text-white'
                                : 'bg-white/5 text-white/70 hover:bg-white/10'
                        }`}
                        data-testid={`ticket-quick-${num}`}
                    >
                        {num}
                    </button>
                ))}
                
                <button
                    onClick={handleLuckyDip}
                    disabled={disabled}
                    className="px-4 py-2 rounded-lg bg-[#FFD700]/20 text-[#FFD700] font-heading uppercase text-sm hover:bg-[#FFD700]/30 transition-all flex items-center gap-2"
                    data-testid="ticket-lucky-dip"
                >
                    <Shuffle size={16} />
                    Lucky Dip
                </button>
            </div>

            {/* Price Summary */}
            <div className="bg-[#161616] border border-white/10 rounded-xl p-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-white/50">Price per ticket</span>
                    <span className="text-white font-semibold">£{ticketPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-white/50">Quantity</span>
                    <span className="text-white font-semibold">x {count}</span>
                </div>
                <div className="h-px bg-white/10 my-4" />
                <div className="flex justify-between items-center">
                    <span className="text-white font-heading uppercase tracking-wider">Total</span>
                    <span className="text-[#FF3B3B] font-heading text-3xl font-bold">
                        £{(ticketPrice * count).toFixed(2)}
                    </span>
                </div>
            </div>

            {/* Max tickets notice */}
            <p className="text-center text-white/40 text-sm">
                Maximum {maxTickets} tickets per person
            </p>
        </div>
    );
};