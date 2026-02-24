import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ArrowLeft, Ticket, Users, Clock, Zap, Shield, ChevronRight, Facebook } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CountdownTimer } from '../components/countdowntimer';
import { ProgressBar } from '../components/progressbar';
import { TicketSelector } from '../components/ticketselector';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const CompetitionDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    
    const [competition, setCompetition] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ticketCount, setTicketCount] = useState(1);
    const [useBalance, setUseBalance] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [purchasing, setPurchasing] = useState(false);

    useEffect(() => {
        const fetchCompetition = async () => {
            try {
                const response = await axios.get(`${API}/competitions/${id}`);
                setCompetition(response.data);
            } catch (error) {
                console.error('Error fetching competition:', error);
                toast.error('Competition not found');
                navigate('/competitions');
            } finally {
                setLoading(false);
            }
        };
        fetchCompetition();
    }, [id, navigate]);

    const handlePurchase = async () => {
        if (!isAuthenticated) {
            navigate('/auth?redirect=' + encodeURIComponent(window.location.pathname));
            return;
        }

        if (!termsAccepted) {
            toast.error('Please accept the terms and conditions');
            return;
        }

        setPurchasing(true);

        try {
            const response = await axios.post(
                `${API}/orders/create`,
                {
                    competition_id: competition.competition_id,
                    ticket_count: ticketCount,
                    use_balance: useBalance,
                    origin_url: window.location.origin
                },
                { withCredentials: true }
            );

            if (response.data.redirect_url) {
                window.location.href = response.data.redirect_url;
            } else if (response.data.status === 'completed') {
                toast.success('Tickets purchased successfully!');
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Purchase error:', error);
            toast.error(error.response?.data?.detail || 'Failed to process purchase');
        } finally {
            setPurchasing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] pt-24 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#FF3B3B] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!competition) return null;

    const totalPrice = competition.ticket_price * ticketCount;
    const balanceToUse = useBalance && user ? Math.min(user.balance, totalPrice) : 0;
    const finalPrice = totalPrice - balanceToUse;
    const isEnded = competition.status !== 'active';
    const availableTickets = competition.total_tickets - competition.sold_tickets;

    return (
        <div className="min-h-screen bg-[#0A0A0A] pt-24">
            {/* Back Button */}
            <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6">
                <button
                    onClick={() => navigate('/competitions')}
                    className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
                    data-testid="back-button"
                >
                    <ArrowLeft size={20} />
                    <span className="font-heading uppercase tracking-wider text-sm">Back to Competitions</span>
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-12 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left - Image & Details */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        {/* Main Image */}
                        <div className="relative rounded-2xl overflow-hidden mb-8">
                            <img
                                src={competition.prize_image}
                                alt={competition.title}
                                className="w-full aspect-[4/3] object-cover"
                            />
                            
                            {competition.is_instant_win && (
                                <div className="absolute top-4 left-4 flex items-center gap-1 bg-[#FFD700] text-black px-4 py-2 rounded-sm">
                                    <Zap size={16} className="fill-current" />
                                    <span className="text-sm font-bold uppercase tracking-wider">InstaWin Available</span>
                                </div>
                            )}

                            {isEnded && (
                                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="font-heading text-4xl font-bold text-[#FF3B3B] mb-2">DRAW ENDED</p>
                                        {competition.winner_id && (
                                            <p className="text-white/50">Winner announced on Facebook Live</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Prize Info */}
                        <div className="bg-[#161616] border border-white/5 rounded-xl p-6 mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                                    competition.prize_type === 'cash' ? 'bg-green-500/20 text-green-400' :
                                    competition.prize_type === 'car' ? 'bg-blue-500/20 text-blue-400' :
                                    competition.prize_type === 'tech' ? 'bg-purple-500/20 text-purple-400' :
                                    'bg-amber-500/20 text-amber-400'
                                }`}>
                                    {competition.prize_type}
                                </span>
                            </div>
                            
                            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4" data-testid="competition-title">
                                {competition.title}
                            </h1>

                            <div className="flex items-baseline gap-2 mb-6">
                                <span className="text-[#FF3B3B] font-heading text-5xl font-bold">
                                    £{competition.prize_value.toLocaleString()}
                                </span>
                                <span className="text-white/50">prize value</span>
                            </div>

                            <p className="text-white/60 leading-relaxed">
                                {competition.description}
                            </p>
                        </div>

                        {/* Competition Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-[#161616] border border-white/5 rounded-xl p-4 text-center">
                                <Ticket className="mx-auto mb-2 text-[#FF3B3B]" size={24} />
                                <p className="text-white font-heading text-2xl font-bold">{competition.total_tickets}</p>
                                <p className="text-white/50 text-xs">Total Tickets</p>
                            </div>
                            <div className="bg-[#161616] border border-white/5 rounded-xl p-4 text-center">
                                <Users className="mx-auto mb-2 text-[#FFD700]" size={24} />
                                <p className="text-white font-heading text-2xl font-bold">{competition.max_tickets_per_user}</p>
                                <p className="text-white/50 text-xs">Max Per Person</p>
                            </div>
                            <div className="bg-[#161616] border border-white/5 rounded-xl p-4 text-center">
                                <Clock className="mx-auto mb-2 text-blue-400" size={24} />
                                <p className="text-white font-heading text-2xl font-bold">
                                    {Math.ceil((new Date(competition.end_date) - new Date()) / (1000 * 60 * 60 * 24))}d
                                </p>
                                <p className="text-white/50 text-xs">Days Left</p>
                            </div>
                        </div>

                        {/* Facebook Live Notice */}
                        {!competition.is_instant_win && (
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-4">
                                <Facebook className="text-blue-400 flex-shrink-0 mt-1" size={24} />
                                <div>
                                    <p className="text-white font-semibold mb-1">Live Draw on Facebook</p>
                                    <p className="text-white/50 text-sm">
                                        Winner will be announced live on Facebook 1 hour after the competition ends.
                                        {competition.facebook_live_url && (
                                            <a href={competition.facebook_live_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline ml-1">
                                                Watch here
                                            </a>
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Right - Purchase Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:sticky lg:top-28 lg:self-start"
                    >
                        <div className="bg-[#161616] border border-white/5 rounded-2xl p-6 md:p-8">
                            {/* Countdown */}
                            {!isEnded && (
                                <div className="mb-8">
                                    <p className="text-white/50 text-sm mb-4 text-center font-heading uppercase tracking-wider">
                                        Competition ends in
                                    </p>
                                    <div className="flex justify-center">
                                        <CountdownTimer endDate={competition.end_date} />
                                    </div>
                                </div>
                            )}

                            {/* Progress Bar */}
                            <div className="mb-8">
                                <ProgressBar current={competition.sold_tickets} total={competition.total_tickets} />
                            </div>

                            {!isEnded && availableTickets > 0 ? (
                                <>
                                    {/* Ticket Selector */}
                                    <div className="mb-8">
                                        <TicketSelector
                                            ticketPrice={competition.ticket_price}
                                            maxTickets={competition.max_tickets_per_user}
                                            availableTickets={availableTickets}
                                            onChange={setTicketCount}
                                            disabled={purchasing}
                                        />
                                    </div>

                                    {/* Use Balance */}
                                    {isAuthenticated && user?.balance > 0 && (
                                        <div className="mb-6 p-4 bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-lg">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <Checkbox
                                                    checked={useBalance}
                                                    onCheckedChange={setUseBalance}
                                                    className="border-[#FFD700]"
                                                    data-testid="use-balance-checkbox"
                                                />
                                                <div>
                                                    <p className="text-white font-medium">Use account balance</p>
                                                    <p className="text-[#FFD700] text-sm">
                                                        Available: £{user.balance.toFixed(2)}
                                                        {useBalance && balanceToUse > 0 && (
                                                            <span className="text-white/50"> (using £{balanceToUse.toFixed(2)})</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </label>
                                        </div>
                                    )}

                                    {/* Terms */}
                                    <div className="mb-6">
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <Checkbox
                                                checked={termsAccepted}
                                                onCheckedChange={setTermsAccepted}
                                                className="mt-1"
                                                data-testid="terms-checkbox"
                                            />
                                            <p className="text-white/50 text-sm">
                                                I confirm I am 18+ and a UK resident. I understand this is a competition of skill, not gambling.
                                            </p>
                                        </label>
                                    </div>

                                    {/* Purchase Button */}
                                    <Button
                                        onClick={handlePurchase}
                                        disabled={purchasing || !termsAccepted}
                                        className="w-full h-14 bg-[#FF3B3B] hover:bg-[#D93232] text-white font-heading uppercase tracking-wider rounded-none"
                                        data-testid="purchase-button"
                                    >
                                        {purchasing ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Processing...
                                            </span>
                                        ) : (
                                            <>
                                                Buy Tickets - £{finalPrice.toFixed(2)}
                                                <ChevronRight className="ml-2" size={20} />
                                            </>
                                        )}
                                    </Button>

                                    {/* Trust Badges */}
                                    <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-white/10">
                                        <div className="flex items-center gap-2 text-white/30 text-sm">
                                            <Shield size={16} />
                                            Secure
                                        </div>
                                        <div className="flex items-center gap-2 text-white/30 text-sm">
                                            <Zap size={16} />
                                            Instant Entry
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    {isEnded ? (
                                        <>
                                            <p className="text-[#FF3B3B] font-heading text-2xl font-bold mb-2">Competition Ended</p>
                                            <p className="text-white/50">Winner will be announced soon</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-[#FF3B3B] font-heading text-2xl font-bold mb-2">Sold Out</p>
                                            <p className="text-white/50">All tickets have been purchased</p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
