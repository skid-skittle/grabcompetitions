import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Lock, Plus, Edit, Trash2, Trophy, Users, CreditCard, BarChart3 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AdminSimplePage = () => {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [competitions, setCompetitions] = useState([]);
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        prize_type: 'cash',
        prize_value: '',
        prize_image: '',
        ticket_price: '',
        total_tickets: '',
        max_tickets_per_user: '10',
        end_date: '',
        is_instant_win: false
    });

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(`${API}/admin/verify`, { password });
            if (response.data.verified) {
                setIsAuthenticated(true);
                localStorage.setItem('admin_password', password);
                fetchData();
            } else {
                alert('Invalid password');
            }
        } catch (error) {
            alert('Login failed');
        } finally {
            setLoading(false);
        }
    };

    const fetchData = async () => {
        const storedPassword = localStorage.getItem('admin_password') || password;
        try {
            const [compsRes, usersRes, ordersRes, analyticsRes] = await Promise.all([
                axios.get(`${API}/admin/competitions?password=${storedPassword}`),
                axios.get(`${API}/admin/users?password=${storedPassword}`),
                axios.get(`${API}/admin/orders?password=${storedPassword}`),
                axios.get(`${API}/admin/analytics?password=${storedPassword}`)
            ]);
            setCompetitions(compsRes.data);
            setUsers(usersRes.data);
            setOrders(ordersRes.data);
            setAnalytics(analyticsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        const storedPassword = localStorage.getItem('admin_password');
        if (storedPassword) {
            setPassword(storedPassword);
            setIsAuthenticated(true);
            fetchData();
        }
    }, []);

    const handleCreateCompetition = async () => {
        const storedPassword = localStorage.getItem('admin_password');
        try {
            await axios.post(`${API}/admin/competitions`, {
                ...formData,
                prize_value: parseFloat(formData.prize_value),
                ticket_price: parseFloat(formData.ticket_price),
                total_tickets: parseInt(formData.total_tickets),
                max_tickets_per_user: parseInt(formData.max_tickets_per_user),
                end_date: new Date(formData.end_date).toISOString(),
                password: storedPassword
            });
            alert('Competition created!');
            setShowCreateForm(false);
            setFormData({
                title: '',
                description: '',
                prize_type: 'cash',
                prize_value: '',
                prize_image: '',
                ticket_price: '',
                total_tickets: '',
                max_tickets_per_user: '10',
                end_date: '',
                is_instant_win: false
            });
            fetchData();
        } catch (error) {
            alert('Failed to create competition');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] pt-24 flex items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-[#161616] border border-white/5 rounded-2xl p-8">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FF3B3B]/20 flex items-center justify-center">
                                <Lock className="text-[#FF3B3B]" size={32} />
                            </div>
                            <h1 className="font-heading text-3xl font-bold text-white mb-2">Admin Access</h1>
                            <p className="text-white/50">Enter the admin password to continue</p>
                        </div>

                        <form onSubmit={handleLogin}>
                            <div className="mb-4">
                                <Label className="text-white/70">Admin Password</Label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter admin password"
                                    className="mt-1 h-12 bg-[#1C1C1E] border-white/10 text-white"
                                    data-testid="admin-password-input"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-[#FF3B3B] hover:bg-[#D93232] text-white font-heading uppercase tracking-wider rounded-none"
                                data-testid="admin-login-button"
                            >
                                {loading ? 'Verifying...' : 'Access Admin Panel'}
                            </Button>
                        </form>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] pt-24" data-testid="admin-panel">
            {/* Header */}
            <section className="py-8 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
                    <div>
                        <h1 className="font-heading text-3xl font-bold text-white">Admin Panel</h1>
                        <p className="text-white/50">Manage competitions, users, and orders</p>
                    </div>
                    <Button
                        onClick={() => {
                            setShowCreateForm(true);
                        }}
                        className="bg-[#FF3B3B] hover:bg-[#D93232] text-white font-heading uppercase tracking-wider rounded-none"
                    >
                        <Plus className="mr-2" size={18} />
                        New Competition
                    </Button>
                </div>
            </section>

            {/* Analytics */}
            {analytics && (
                <section className="py-8 bg-[#0F0F0F]">
                    <div className="max-w-7xl mx-auto px-6 lg:px-12">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            <div className="bg-[#161616] border border-white/5 rounded-xl p-4">
                                <Users className="text-[#FF3B3B]" size={24} />
                                <p className="text-white font-heading text-2xl font-bold mt-2">{analytics.total_users}</p>
                                <p className="text-white/50 text-sm">Users</p>
                            </div>
                            <div className="bg-[#161616] border border-white/5 rounded-xl p-4">
                                <Trophy className="text-[#FFD700]" size={24} />
                                <p className="text-white font-heading text-2xl font-bold mt-2">{analytics.total_competitions}</p>
                                <p className="text-white/50 text-sm">Competitions</p>
                            </div>
                            <div className="bg-[#161616] border border-white/5 rounded-xl p-4">
                                <CreditCard className="text-green-500" size={24} />
                                <p className="text-white font-heading text-2xl font-bold mt-2">{analytics.total_orders}</p>
                                <p className="text-white/50 text-sm">Orders</p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Create Competition Modal */}
            {showCreateForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#161616] border border-white/5 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-heading text-2xl font-bold text-white">Create Competition</h2>
                            <Button
                                onClick={() => setShowCreateForm(false)}
                                variant="outline"
                                className="border-white/20 text-white hover:bg-white/10"
                            >
                                ×
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-white/70">Title</Label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        className="bg-[#1C1C1E] border-white/10 text-white"
                                    />
                                </div>
                                <div>
                                    <Label className="text-white/70">Prize Type</Label>
                                    <select
                                        value={formData.prize_type}
                                        onChange={(e) => setFormData({...formData, prize_type: e.target.value})}
                                        className="w-full h-12 bg-[#1C1C1E] border-white/10 text-white rounded-lg px-3"
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="car">Car</option>
                                        <option value="tech">Tech</option>
                                        <option value="luxury">Luxury</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <Label className="text-white/70">Description</Label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full h-24 bg-[#1C1C1E] border-white/10 text-white rounded-lg p-3"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-white/70">Prize Value (£)</Label>
                                    <Input
                                        type="number"
                                        value={formData.prize_value}
                                        onChange={(e) => setFormData({...formData, prize_value: e.target.value})}
                                        className="bg-[#1C1C1E] border-white/10 text-white"
                                    />
                                </div>
                                <div>
                                    <Label className="text-white/70">Ticket Price (£)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.ticket_price}
                                        onChange={(e) => setFormData({...formData, ticket_price: e.target.value})}
                                        className="bg-[#1C1C1E] border-white/10 text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-white/70">Total Tickets</Label>
                                    <Input
                                        type="number"
                                        value={formData.total_tickets}
                                        onChange={(e) => setFormData({...formData, total_tickets: e.target.value})}
                                        className="bg-[#1C1C1E] border-white/10 text-white"
                                    />
                                </div>
                                <div>
                                    <Label className="text-white/70">Max Per User</Label>
                                    <Input
                                        type="number"
                                        value={formData.max_tickets_per_user}
                                        onChange={(e) => setFormData({...formData, max_tickets_per_user: e.target.value})}
                                        className="bg-[#1C1C1E] border-white/10 text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label className="text-white/70">End Date</Label>
                                <Input
                                    type="datetime-local"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                                    className="bg-[#1C1C1E] border-white/10 text-white"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    onClick={handleCreateCompetition}
                                    className="flex-1 bg-[#FF3B3B] hover:bg-[#D93232] text-white"
                                >
                                    Create Competition
                                </Button>
                                <Button
                                    onClick={() => setShowCreateForm(false)}
                                    variant="outline"
                                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Competitions Table */}
            <section className="py-8">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="bg-[#161616] border border-white/5 rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-white/5">
                            <h3 className="font-heading text-xl font-bold text-white mb-4">Competitions</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-white/5">
                                    <tr>
                                        <th className="text-left p-4 text-white/70 font-medium">Title</th>
                                        <th className="text-left p-4 text-white/70 font-medium">Prize</th>
                                        <th className="text-left p-4 text-white/70 font-medium">Status</th>
                                        <th className="text-left p-4 text-white/70 font-medium">Sold</th>
                                        <th className="text-left p-4 text-white/70 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {competitions.map((comp) => (
                                        <tr key={comp.competition_id} className="border-t border-white/5">
                                            <td className="p-4 text-white">{comp.title}</td>
                                            <td className="p-4 text-[#FF3B3B]">£{comp.prize_value?.toLocaleString()}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 text-xs rounded ${
                                                    comp.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                                    comp.status === 'ended' ? 'bg-blue-500/20 text-blue-400' :
                                                    comp.status === 'sold_out' ? 'bg-red-500/20 text-red-400' :
                                                    'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                    {comp.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-white">{comp.sold_tickets || 0}/{comp.total_tickets}</td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                                                        <Edit size={14} />
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
