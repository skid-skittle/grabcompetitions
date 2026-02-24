import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
    Ticket, Trophy, CreditCard, Calendar, User, LogOut, 
    ArrowRight, Eye, Download, RefreshCw, Gift
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const DashboardPage = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    
    const [entries, setEntries] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [orders, setOrders] = useState([]);
    const [wins, setWins] = useState({ main_wins: [], instant_wins: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('entries');

    useEffect(() => {
        if (!user) {
            navigate('/auth');
            return;
        }
        fetchDashboardData();
    }, [user, navigate]);

    const fetchDashboardData = async () => {
        try {
            const [entriesRes, ticketsRes, ordersRes, winsRes] = await Promise.all([
                axios.get(`${API}/user/entries`, { withCredentials: true }),
                axios.get(`${API}/user/tickets`, { withCredentials: true }),
                axios.get(`${API}/user/orders`, { withCredentials: true }),
                axios.get(`${API}/user/wins`, { withCredentials: true })
            ]);
            
            setEntries(entriesRes.data);
            setTickets(ticketsRes.data);
            setOrders(ordersRes.data);
            setWins(winsRes.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
        } catch (error) {
            console.error('Logout error:', error);
        }
        logout();
        navigate('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] pt-24 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-[#FF3B3B] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] pt-24" data-testid="dashboard-page">
            {/* Header */}
            <section className="py-8 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {user?.picture ? (
                                <img src={user.picture} alt="" className="w-16 h-16 rounded-full" />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-[#FF3B3B] flex items-center justify-center text-white text-2xl font-bold">
                                    {user?.name?.charAt(0)}
                                </div>
                            )}
                            <div>
                                <h1 className="font-heading text-3xl font-bold text-white">
                                    Welcome back, {user?.name}
                                </h1>
                                <p className="text-white/50">Manage your competitions and entries</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-white/50 text-sm">Account Balance</p>
                                <p className="text-[#FFD700] font-heading text-2xl font-bold">
                                    £{user?.balance?.toFixed(2) || '0.00'}
                                </p>
                            </div>
                            <Button
                                onClick={handleLogout}
                                variant="outline"
                                className="border-white/20 text-white hover:bg-white/10"
                            >
                                <LogOut size={18} />
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-8">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <StatCard
                            icon={Ticket}
                            label="Active Entries"
                            value={entries.length}
                            color="red"
                        />
                        <StatCard
                            icon={Trophy}
                            label="Total Wins"
                            value={wins.main_wins.length + wins.instant_wins.length}
                            color="gold"
                        />
                        <StatCard
                            icon={CreditCard}
                            label="Total Orders"
                            value={orders.length}
                            color="blue"
                        />
                        <StatCard
                            icon={Gift}
                            label="Instant Wins"
                            value={wins.instant_wins.length}
                            color="green"
                        />
                    </div>
                </div>
            </section>

            {/* Tabs */}
            <section className="py-8">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="flex gap-4 mb-8 border-b border-white/10">
                        {['entries', 'tickets', 'orders', 'wins'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 px-2 font-heading uppercase tracking-wider transition-colors ${
                                    activeTab === tab
                                        ? 'text-[#FF3B3B] border-b-2 border-[#FF3B3B]'
                                        : 'text-white/50 hover:text-white'
                                }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Entries Tab */}
                    {activeTab === 'entries' && (
                        <div className="space-y-6">
                            {entries.length > 0 ? (
                                entries.map((entry, idx) => (
                                    <motion.div
                                        key={entry.competition.competition_id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-[#161616] border border-white/5 rounded-xl p-6"
                                    >
                                        <div className="flex items-start gap-6">
                                            <img
                                                src={entry.competition.prize_image}
                                                alt=""
                                                className="w-24 h-24 object-cover rounded-lg"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-heading text-xl font-bold text-white">
                                                        {entry.competition.title}
                                                    </h3>
                                                    <span className={`px-2 py-0.5 text-xs rounded ${
                                                        entry.competition.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                                        entry.competition.status === 'ended' ? 'bg-blue-500/20 text-blue-400' :
                                                        'bg-gray-500/20 text-gray-400'
                                                    }`}>
                                                        {entry.competition.status}
                                                    </span>
                                                </div>
                                                <p className="text-[#FF3B3B] font-heading text-2xl font-bold mb-2">
                                                    £{entry.competition.prize_value.toLocaleString()}
                                                </p>
                                                <div className="flex items-center gap-4 text-white/50 text-sm">
                                                    <span>{entry.ticket_count} tickets</span>
                                                    <span>•</span>
                                                    <span>Ends: {new Date(entry.competition.end_date).toLocaleDateString()}</span>
                                                </div>
                                                <div className="mt-4">
                                                    <p className="text-white/70 text-sm mb-2">Your ticket numbers:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {entry.tickets.slice(0, 10).map((ticket) => (
                                                            <span
                                                                key={ticket}
                                                                className="px-3 py-1 bg-white/5 text-white font-mono text-sm rounded"
                                                            >
                                                                {ticket}
                                                            </span>
                                                        ))}
                                                        {entry.tickets.length > 10 && (
                                                            <span className="px-3 py-1 bg-white/5 text-white/50 text-sm rounded">
                                                                +{entry.tickets.length - 10} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => navigate(`/competitions/${entry.competition.competition_id}`)}
                                                variant="outline"
                                                className="border-white/20 text-white hover:bg-white/10"
                                            >
                                                <Eye size={16} className="mr-2" />
                                                View Competition
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <Ticket size={48} className="text-white/20 mx-auto mb-4" />
                                    <h3 className="text-white font-heading text-xl mb-2">No Active Entries</h3>
                                    <p className="text-white/50 mb-6">You haven't entered any competitions yet</p>
                                    <Button
                                        onClick={() => navigate('/competitions')}
                                        className="bg-[#FF3B3B] hover:bg-[#D93232] text-white"
                                    >
                                        Browse Competitions
                                        <ArrowRight size={18} className="ml-2" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tickets Tab */}
                    {activeTab === 'tickets' && (
                        <div className="bg-[#161616] border border-white/5 rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-white/5">
                                    <tr>
                                        <th className="text-left p-4 text-white/50 font-medium">Ticket Number</th>
                                        <th className="text-left p-4 text-white/50 font-medium">Competition</th>
                                        <th className="text-left p-4 text-white/50 font-medium">Date</th>
                                        <th className="text-left p-4 text-white/50 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tickets.map((ticket) => (
                                        <tr key={ticket.ticket_id} className="border-t border-white/5">
                                            <td className="p-4">
                                                <span className={`font-mono font-bold ${
                                                    ticket.is_instant_win ? 'text-[#FFD700]' : 'text-white'
                                                }`}>
                                                    {ticket.ticket_number}
                                                </span>
                                            </td>
                                            <td className="p-4 text-white/70">{ticket.competition_id.slice(-8)}</td>
                                            <td className="p-4 text-white/50">
                                                {new Date(ticket.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                {ticket.is_instant_win && (
                                                    <span className="px-2 py-1 bg-[#FFD700]/20 text-[#FFD700] text-xs rounded">
                                                        Instant Win!
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                        <div className="bg-[#161616] border border-white/5 rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-white/5">
                                    <tr>
                                        <th className="text-left p-4 text-white/50 font-medium">Order ID</th>
                                        <th className="text-left p-4 text-white/50 font-medium">Tickets</th>
                                        <th className="text-left p-4 text-white/50 font-medium">Amount</th>
                                        <th className="text-left p-4 text-white/50 font-medium">Status</th>
                                        <th className="text-left p-4 text-white/50 font-medium">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.order_id} className="border-t border-white/5">
                                            <td className="p-4 text-white font-mono text-sm">
                                                {order.order_id.slice(-12)}
                                            </td>
                                            <td className="p-4 text-white">{order.ticket_count}</td>
                                            <td className="p-4 text-white">£{order.amount.toFixed(2)}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 text-xs rounded ${
                                                    order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                                    order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-red-500/20 text-red-400'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-white/50">
                                                {new Date(order.created_at).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Wins Tab */}
                    {activeTab === 'wins' && (
                        <div className="space-y-6">
                            {/* Main Wins */}
                            {wins.main_wins.length > 0 && (
                                <div>
                                    <h3 className="font-heading text-xl font-bold text-white mb-4">Main Competition Wins</h3>
                                    <div className="space-y-4">
                                        {wins.main_wins.map((win) => (
                                            <div key={win.winner_id} className="bg-[#161616] border border-[#FFD700]/30 rounded-xl p-6">
                                                <div className="flex items-center gap-4">
                                                    <Trophy className="text-[#FFD700]" size={32} />
                                                    <div>
                                                        <h4 className="font-heading text-lg font-bold text-white">
                                                            {win.competition?.title || 'Competition'}
                                                        </h4>
                                                        <p className="text-[#FFD700] font-bold">
                                                            £{win.prize_value.toLocaleString()}
                                                        </p>
                                                        <p className="text-white/50 text-sm">
                                                            Winning ticket: {win.ticket_number}
                                                        </p>
                                                        <p className="text-white/30 text-xs">
                                                            {new Date(win.announced_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Instant Wins */}
                            {wins.instant_wins.length > 0 && (
                                <div>
                                    <h3 className="font-heading text-xl font-bold text-white mb-4">Instant Wins</h3>
                                    <div className="space-y-4">
                                        {wins.instant_wins.map((win) => (
                                            <div key={win.ticket_id} className="bg-[#161616] border border-green-500/30 rounded-xl p-6">
                                                <div className="flex items-center gap-4">
                                                    <Gift className="text-green-400" size={32} />
                                                    <div>
                                                        <h4 className="font-heading text-lg font-bold text-white">
                                                            {win.instant_win_prize?.name || 'Instant Prize'}
                                                        </h4>
                                                        <p className="text-green-400 font-bold">
                                                            {win.instant_win_prize?.value || 'Prize Won!'}
                                                        </p>
                                                        <p className="text-white/50 text-sm">
                                                            Ticket: {win.ticket_number}
                                                        </p>
                                                        <p className="text-white/30 text-xs">
                                                            {new Date(win.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {wins.main_wins.length === 0 && wins.instant_wins.length === 0 && (
                                <div className="text-center py-12">
                                    <Trophy size={48} className="text-white/20 mx-auto mb-4" />
                                    <h3 className="text-white font-heading text-xl mb-2">No Wins Yet</h3>
                                    <p className="text-white/50">Keep entering competitions for your chance to win!</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-[#161616] border border-white/5 rounded-xl p-6">
        <Icon size={24} className={
            color === 'red' ? 'text-[#FF3B3B]' :
            color === 'gold' ? 'text-[#FFD700]' :
            color === 'blue' ? 'text-blue-400' :
            'text-green-400'
        } />
        <p className="text-white font-heading text-2xl font-bold mt-2">{value}</p>
        <p className="text-white/50 text-sm">{label}</p>
    </div>
);
