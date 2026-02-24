import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Ticket, Zap } from 'lucide-react';
import { CountdownTimer } from './countdowntimer';
import { ProgressBar } from './progressbar';

export const CompetitionCard = ({ competition, index = 0 }) => {
    const {
        competition_id,
        title,
        prize_type,
        prize_value,
        prize_image,
        ticket_price,
        total_tickets,
        sold_tickets,
        end_date,
        status,
        is_instant_win
    } = competition;

    const isEndingSoon = new Date(end_date) - new Date() < 24 * 60 * 60 * 1000; // 24 hours
    const isSoldOut = status === 'sold_out' || sold_tickets >= total_tickets;

    const categoryColors = {
        cash: 'from-green-500 to-emerald-600',
        car: 'from-blue-500 to-indigo-600',
        tech: 'from-purple-500 to-pink-600',
        luxury: 'from-amber-500 to-orange-600'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="group"
        >
            <Link
                to={`/competitions/${competition_id}`}
                className="block card-competition relative h-full"
                data-testid={`competition-card-${competition_id}`}
            >
                {/* Badge */}
                {is_instant_win && (
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-[#FFD700] text-black px-3 py-1 rounded-sm">
                        <Zap size={12} className="fill-current" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">InstaWin</span>
                    </div>
                )}
                
                {isEndingSoon && !isSoldOut && (
                    <div className="absolute top-4 right-4 z-10 badge-ending flex items-center gap-1">
                        <Clock size={10} />
                        <span>Ending Soon</span>
                    </div>
                )}

                {isSoldOut && (
                    <div className="absolute top-4 right-4 z-10 bg-[#333] text-white/50 text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm">
                        Sold Out
                    </div>
                )}

                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                        src={prize_image}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
                    
                    {/* Category Tag */}
                    <div className={`absolute bottom-4 left-4 px-3 py-1 rounded-sm bg-gradient-to-r ${categoryColors[prize_type] || categoryColors.cash}`}>
                        <span className="text-white text-[10px] font-bold uppercase tracking-wider">
                            {prize_type}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Prize Value */}
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-[#FF3B3B] font-heading text-3xl font-bold">
                            £{prize_value.toLocaleString()}
                        </span>
                        <span className="text-white/50 text-sm">prize</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-heading text-xl font-bold text-white mb-4 line-clamp-2 group-hover:text-[#FF3B3B] transition-colors">
                        {title}
                    </h3>

                    {/* Progress */}
                    <div className="mb-4">
                        <ProgressBar current={sold_tickets} total={total_tickets} />
                    </div>

                    {/* Countdown */}
                    {status === 'active' && (
                        <div className="mb-4">
                            <CountdownTimer endDate={end_date} size="small" />
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2 text-white/50">
                            <Ticket size={16} />
                            <span className="text-sm">
                                £{ticket_price.toFixed(2)} per ticket
                            </span>
                        </div>
                        
                        <span className="text-[#FF3B3B] font-heading uppercase text-sm tracking-wider group-hover:translate-x-1 transition-transform">
                            Enter Now →
                        </span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};