import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Trophy, Calendar, Gift } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const WinnersPage = () => {
    const [winners, setWinners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWinners = async () => {
            try {
                const response = await axios.get(`${API}/winners`);
                setWinners(response.data);
            } catch (error) {
                console.error('Error fetching winners:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchWinners();
    }, []);

    return (
        <div className="min-h-screen bg-[#0A0A0A] pt-24" data-testid="winners-page">
            {/* Header */}
            <section className="py-12 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <div className="inline-flex items-center gap-2 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-full px-4 py-2 mb-6">
                            <Trophy className="text-[#FFD700]" size={16} />
                            <span className="text-[#FFD700] font-heading uppercase tracking-wider text-sm">Hall of Fame</span>
                        </div>
                        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4">
                            OUR <span className="text-[#FF3B3B]">WINNERS</span>
                        </h1>
                        <p className="text-white/50 max-w-xl mx-auto">
                            Real people winning real prizes. Could you be next?
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Winners Grid */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="bg-[#161616] rounded-xl h-80 animate-pulse" />
                            ))}
                        </div>
                    ) : winners.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {winners.map((winner, idx) => (
                                <motion.div
                                    key={winner.winner_id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-[#161616] border border-white/5 rounded-xl overflow-hidden group hover:border-[#FFD700]/30 transition-colors"
                                >
                                    {/* Prize Image */}
                                    <div className="relative aspect-video overflow-hidden">
                                        {winner.competition?.prize_image ? (
                                            <img
                                                src={winner.competition.prize_image}
                                                alt={winner.competition.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-[#FFD700]/20 to-[#FF3B3B]/20 flex items-center justify-center">
                                                <Gift size={48} className="text-[#FFD700]" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#161616] to-transparent" />
                                        
                                        {/* Winner Badge */}
                                        <div className="absolute top-4 right-4">
                                            <div className="bg-[#FFD700] text-black px-3 py-1 rounded-full font-bold text-sm uppercase tracking-wider">
                                                Winner
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 rounded-full bg-[#FF3B3B] flex items-center justify-center text-white font-bold text-lg">
                                                {winner.user_name?.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-heading text-lg font-bold text-white">
                                                    {winner.user_name}
                                                </h3>
                                                <p className="text-white/50 text-sm">
                                                    Ticket: {winner.ticket_number}
                                                </p>
                                            </div>
                                        </div>

                                        <h4 className="font-heading text-xl font-bold text-white mb-2">
                                            {winner.competition?.title}
                                        </h4>

                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-[#FFD700] font-heading text-2xl font-bold">
                                                £{winner.prize_value.toLocaleString()}
                                            </p>
                                            <span className="px-2 py-1 bg-white/10 text-white/70 text-xs rounded">
                                                {winner.prize_type}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-white/30 text-sm">
                                            <Calendar size={14} />
                                            <span>
                                                {new Date(winner.announced_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Trophy size={48} className="text-white/20 mx-auto mb-4" />
                            <h3 className="text-white font-heading text-xl mb-2">No Winners Yet</h3>
                            <p className="text-white/50">Be the first to win a competition!</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};
