import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { CheckCircle, Ticket, ArrowRight, PartyPopper } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import Confetti from 'react-confetti';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const CheckoutSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { refreshUser } = useAuth();
    
    const [status, setStatus] = useState('checking');
    const [orderData, setOrderData] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [instantWins, setInstantWins] = useState([]);

    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        if (!sessionId) {
            navigate('/competitions');
            return;
        }

        let attempts = 0;
        const maxAttempts = 10;
        const pollInterval = 2000;

        const checkStatus = async () => {
            try {
                const response = await axios.get(`${API}/checkout/status/${sessionId}`, {
                    withCredentials: true
                });

                if (response.data.payment_status === 'paid' || response.data.status === 'completed') {
                    setOrderData(response.data);
                    setStatus('success');
                    setShowConfetti(true);
                    
                    // Check for instant wins
                    const wins = response.data.tickets?.filter(t => t.is_instant_win) || [];
                    setInstantWins(wins);
                    
                    // Refresh user to update balance
                    await refreshUser();
                    
                    setTimeout(() => setShowConfetti(false), 5000);
                } else if (attempts >= maxAttempts) {
                    setStatus('timeout');
                } else {
                    attempts++;
                    setTimeout(checkStatus, pollInterval);
                }
            } catch (error) {
                console.error('Error checking status:', error);
                if (attempts >= maxAttempts) {
                    setStatus('error');
                } else {
                    attempts++;
                    setTimeout(checkStatus, pollInterval);
                }
            }
        };

        checkStatus();
    }, [sessionId, navigate, refreshUser]);

    if (status === 'checking') {
        return (
            <div className="min-h-screen bg-[#0A0A0A] pt-24 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#FF3B3B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white/50 text-lg">Processing your order...</p>
                </div>
            </div>
        );
    }

    if (status === 'timeout' || status === 'error') {
        return (
            <div className="min-h-screen bg-[#0A0A0A] pt-24 flex items-center justify-center px-6">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <Ticket size={32} className="text-yellow-400" />
                    </div>
                    <h1 className="font-heading text-3xl font-bold text-white mb-4">
                        Payment Processing
                    </h1>
                    <p className="text-white/50 mb-8">
                        Your payment is being processed. Please check your dashboard for your tickets.
                    </p>
                    <Button
                        onClick={() => navigate('/dashboard')}
                        className="bg-[#FF3B3B] hover:bg-[#D93232] text-white font-heading uppercase tracking-wider rounded-none"
                    >
                        Go to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] pt-24">
            {showConfetti && (
                <Confetti
                    width={window.innerWidth}
                    height={window.innerHeight}
                    recycle={false}
                    numberOfPieces={200}
                    colors={['#FF3B3B', '#FFD700', '#FFFFFF']}
                />
            )}

            <div className="max-w-2xl mx-auto px-6 py-16">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    {/* Success Icon */}
                    <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle size={48} className="text-green-400" />
                    </div>

                    <h1 className="font-heading text-4xl font-bold text-white mb-4">
                        TICKETS SECURED!
                    </h1>
                    <p className="text-white/50 text-lg mb-8">
                        Good luck! Your tickets are now entered into the draw.
                    </p>

                    {/* Instant Win Alert */}
                    {instantWins.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 p-6 bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 border border-[#FFD700] rounded-xl"
                        >
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <PartyPopper className="text-[#FFD700]" size={28} />
                                <span className="text-[#FFD700] font-heading text-2xl font-bold uppercase">Instant Win!</span>
                            </div>
                            <p className="text-white">
                                Congratulations! You've won an instant prize!
                            </p>
                            {instantWins.map((win) => (
                                <p key={win.ticket_id} className="text-[#FFD700] font-semibold mt-2">
                                    {win.instant_win_prize?.name || 'Prize'} - Ticket {win.ticket_number}
                                </p>
                            ))}
                        </motion.div>
                    )}

                    {/* Tickets */}
                    {orderData?.tickets && orderData.tickets.length > 0 && (
                        <div className="bg-[#161616] border border-white/10 rounded-xl p-6 mb-8">
                            <h3 className="font-heading text-xl font-bold text-white mb-4">
                                Your Ticket Numbers
                            </h3>
                            <div className="flex flex-wrap justify-center gap-3">
                                {orderData.tickets.map((ticket) => (
                                    <span
                                        key={ticket.ticket_id}
                                        className={`px-4 py-2 rounded font-mono font-bold ${
                                            ticket.is_instant_win
                                                ? 'bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]'
                                                : 'bg-white/5 text-white border border-white/10'
                                        }`}
                                    >
                                        {ticket.ticket_number}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={() => navigate('/dashboard')}
                            className="bg-[#FF3B3B] hover:bg-[#D93232] text-white font-heading uppercase tracking-wider rounded-none"
                            data-testid="go-to-dashboard"
                        >
                            View My Entries
                            <ArrowRight className="ml-2" size={18} />
                        </Button>
                        <Button
                            onClick={() => navigate('/competitions')}
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10 font-heading uppercase tracking-wider rounded-none"
                        >
                            Enter More Competitions
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
