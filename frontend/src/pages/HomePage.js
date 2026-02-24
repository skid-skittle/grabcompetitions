import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ArrowRight, Trophy, Ticket, Tv, Shield, Star, Zap } from 'lucide-react';
import { CompetitionCard } from '../components/competitioncard';
import { CountdownTimer } from '../components/countdowntimer';
import { Button } from '../components/ui/button';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const HomePage = () => {
    const [featured, setFeatured] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const response = await axios.get(`${API}/competitions/featured`);
                setFeatured(response.data);
            } catch (error) {
                console.error('Error fetching featured competitions:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    const heroCompetition = featured[0];

    const categories = [
        { name: 'Cash Prizes', type: 'cash', icon: '£', color: 'from-green-500 to-emerald-600' },
        { name: 'Luxury Cars', type: 'car', icon: '🚗', color: 'from-blue-500 to-indigo-600' },
        { name: 'Tech & Gaming', type: 'tech', icon: '🎮', color: 'from-purple-500 to-pink-600' },
        { name: 'Luxury Items', type: 'luxury', icon: '💎', color: 'from-amber-500 to-orange-600' }
    ];

    const steps = [
        { icon: Ticket, title: 'Choose Competition', desc: 'Browse our amazing prizes and pick your favourite' },
        { icon: Zap, title: 'Buy Tickets', desc: 'Select how many tickets you want and checkout securely' },
        { icon: Tv, title: 'Watch the Draw', desc: 'Winner revealed live on Facebook - could be you!' }
    ];

    return (
        <div className="min-h-screen bg-[#0A0A0A]">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center pt-20">
                <div className="absolute inset-0 overflow-hidden">
                    {heroCompetition && (
                        <img
                            src={heroCompetition.prize_image}
                            alt=""
                            className="w-full h-full object-cover opacity-30"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/90 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-[#0A0A0A]/50" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-24">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 bg-[#FF3B3B]/10 border border-[#FF3B3B]/30 rounded-full px-4 py-2 mb-6">
                                <span className="w-2 h-2 bg-[#FF3B3B] rounded-full animate-pulse" />
                                <span className="text-[#FF3B3B] font-heading uppercase tracking-wider text-sm">Live Competitions</span>
                            </div>

                            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[0.9] mb-6">
                                WIN<br />
                                <span className="text-[#FF3B3B]">INCREDIBLE</span><br />
                                PRIZES
                            </h1>

                            <p className="text-white/60 text-lg md:text-xl max-w-xl mb-8">
                                Enter our competitions for your chance to win cash, luxury cars, tech, and more. Low ticket prices, huge prizes.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/competitions">
                                    <Button
                                        className="w-full sm:w-auto h-14 px-8 bg-[#FF3B3B] hover:bg-[#D93232] text-white font-heading uppercase tracking-wider text-lg rounded-none hover:shadow-[0_0_30px_rgba(255,59,59,0.4)] transition-all duration-300 uiverse-shine"
                                        data-testid="hero-cta"
                                    >
                                        View Competitions
                                        <ArrowRight className="ml-2" size={20} />
                                    </Button>
                                </Link>
                                <Link to="/winners">
                                    <Button
                                        variant="outline"
                                        className="w-full sm:w-auto h-14 px-8 border-white/20 text-white hover:bg-white/10 font-heading uppercase tracking-wider rounded-none"
                                        data-testid="hero-winners"
                                    >
                                        <Trophy className="mr-2" size={20} />
                                        See Winners
                                    </Button>
                                </Link>
                            </div>

                            {/* Stats */}
                            <div className="flex gap-8 mt-12 pt-8 border-t border-white/10">
                                <div>
                                    <p className="font-heading text-4xl font-bold text-[#FF3B3B]">£193K+</p>
                                    <p className="text-white/50 text-sm">Prizes Won</p>
                                </div>
                                <div>
                                    <p className="font-heading text-4xl font-bold text-[#FFD700]">26</p>
                                    <p className="text-white/50 text-sm">Happy Winners</p>
                                </div>
                                <div>
                                    <p className="font-heading text-4xl font-bold text-white">100%</p>
                                    <p className="text-white/50 text-sm">Verified Draws</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Featured Prize */}
                        {heroCompetition && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="hidden lg:block"
                            >
                                <div className="relative">
                                    <div className="absolute -inset-4 bg-[#FF3B3B]/20 blur-3xl rounded-full" />
                                    <div className="relative bg-[#161616] border border-white/10 rounded-2xl overflow-hidden uiverse-glow-card">
                                        <div className="aspect-video relative">
                                            <img
                                                src={heroCompetition.prize_image}
                                                alt={heroCompetition.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#161616] to-transparent" />
                                        </div>
                                        <div className="p-6">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Star className="text-[#FFD700] fill-[#FFD700]" size={16} />
                                                <span className="text-[#FFD700] text-sm font-semibold uppercase tracking-wider">Featured Prize</span>
                                            </div>
                                            <h3 className="font-heading text-2xl font-bold text-white mb-2">
                                                {heroCompetition.title}
                                            </h3>
                                            <p className="text-[#FF3B3B] font-heading text-4xl font-bold mb-4">
                                                £{heroCompetition.prize_value.toLocaleString()}
                                            </p>
                                            <CountdownTimer endDate={heroCompetition.end_date} size="small" />
                                            <Link
                                                to={`/competitions/${heroCompetition.competition_id}`}
                                                className="block mt-4"
                                            >
                                                <Button className="w-full h-12 bg-[#FF3B3B] hover:bg-[#D93232] text-white font-heading uppercase tracking-wider rounded-none">
                                                    Enter Now - £{heroCompetition.ticket_price.toFixed(2)}
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="py-20 bg-[#0A0A0A]">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="font-heading text-4xl sm:text-5xl font-black text-white mb-4">
                            BROWSE BY <span className="text-[#FF3B3B]">CATEGORY</span>
                        </h2>
                        <p className="text-white/50 max-w-xl mx-auto">
                            Find your dream prize across our exciting categories
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {categories.map((cat, idx) => (
                            <motion.div
                                key={cat.type}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Link
                                    to={`/competitions?type=${cat.type}`}
                                    className="block group"
                                    data-testid={`category-${cat.type}`}
                                >
                                    <div className={`relative p-8 rounded-xl bg-gradient-to-br ${cat.color} overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]`}>
                                        <div className="absolute top-0 right-0 text-8xl opacity-20 -translate-y-4 translate-x-4">
                                            {cat.icon}
                                        </div>
                                        <p className="relative z-10 font-heading text-xl font-bold text-white">
                                            {cat.name}
                                        </p>
                                        <ArrowRight className="relative z-10 mt-4 text-white/70 group-hover:translate-x-2 transition-transform" size={20} />
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Competitions */}
            <section className="py-20 bg-[#0F0F0F]">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex items-end justify-between mb-12"
                    >
                        <div>
                            <h2 className="font-heading text-4xl sm:text-5xl font-black text-white mb-4">
                                LIVE <span className="text-[#FF3B3B]">COMPETITIONS</span>
                            </h2>
                            <p className="text-white/50">
                                Don't miss your chance to win these amazing prizes
                            </p>
                        </div>
                        <Link to="/competitions" className="hidden md:block">
                            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 font-heading uppercase tracking-wider rounded-none">
                                View All
                                <ArrowRight className="ml-2" size={16} />
                            </Button>
                        </Link>
                    </motion.div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-[#161616] rounded-xl h-96 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featured.slice(0, 6).map((comp, idx) => (
                                <CompetitionCard key={comp.competition_id} competition={comp} index={idx} />
                            ))}
                        </div>
                    )}

                    <div className="mt-8 text-center md:hidden">
                        <Link to="/competitions">
                            <Button className="bg-[#FF3B3B] hover:bg-[#D93232] text-white font-heading uppercase tracking-wider rounded-none">
                                View All Competitions
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-[#0A0A0A]">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="font-heading text-4xl sm:text-5xl font-black text-white mb-4">
                            HOW IT <span className="text-[#FF3B3B]">WORKS</span>
                        </h2>
                        <p className="text-white/50 max-w-xl mx-auto">
                            Three simple steps to potentially change your life
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {steps.map((step, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.15 }}
                                className="relative"
                            >
                                <div className="bg-[#161616] border border-white/5 rounded-xl p-8 h-full hover:border-[#FF3B3B]/30 transition-colors">
                                    <div className="w-16 h-16 rounded-xl bg-[#FF3B3B]/10 flex items-center justify-center mb-6">
                                        <step.icon className="text-[#FF3B3B]" size={32} />
                                    </div>
                                    <div className="absolute top-8 right-8 font-heading text-6xl font-black text-white/5">
                                        {idx + 1}
                                    </div>
                                    <h3 className="font-heading text-2xl font-bold text-white mb-3">
                                        {step.title}
                                    </h3>
                                    <p className="text-white/50">
                                        {step.desc}
                                    </p>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                                        <ArrowRight className="text-white/20" size={24} />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust Section */}
            <section className="py-20 bg-[#0F0F0F]">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex items-center gap-4 p-6 bg-[#161616] rounded-xl border border-white/5">
                            <Shield className="text-[#FF3B3B] flex-shrink-0" size={40} />
                            <div>
                                <h4 className="font-heading text-lg font-bold text-white">Secure Payments</h4>
                                <p className="text-white/50 text-sm">256-bit SSL encryption</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-6 bg-[#161616] rounded-xl border border-white/5">
                            <Trophy className="text-[#FFD700] flex-shrink-0" size={40} />
                            <div>
                                <h4 className="font-heading text-lg font-bold text-white">Real Winners</h4>
                                <p className="text-white/50 text-sm">Verified & announced live</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-6 bg-[#161616] rounded-xl border border-white/5">
                            <Tv className="text-blue-500 flex-shrink-0" size={40} />
                            <div>
                                <h4 className="font-heading text-lg font-bold text-white">Live Draws</h4>
                                <p className="text-white/50 text-sm">Watch on Facebook Live</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-b from-[#0A0A0A] to-[#1A0A0A]">
                <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6">
                            READY TO <span className="text-[#FF3B3B]">WIN?</span>
                        </h2>
                        <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto">
                            Join thousands of winners who've changed their lives. Your winning ticket is waiting.
                        </p>
                        <Link to="/competitions">
                            <Button
                                className="h-16 px-12 bg-[#FF3B3B] hover:bg-[#D93232] text-white font-heading text-xl uppercase tracking-wider rounded-none hover:shadow-[0_0_40px_rgba(255,59,59,0.5)] transition-all duration-300"
                                data-testid="cta-enter-now"
                            >
                                Enter Now
                                <ArrowRight className="ml-3" size={24} />
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};
