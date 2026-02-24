import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
    Lock, Plus, Edit, Edit2, Trash2, Trophy, Users, CreditCard, BarChart3,
    Calendar, Image, DollarSign, Ticket, Zap, Save, X, Eye, Download, TrendingUp
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '../components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AdminPage = () => {
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
        prize_value: 0,
        prize_image: '',
        ticket_price: 0,
        total_tickets: 1000,
        max_tickets_per_user: 10,
        end_date: '',
        is_instant_win: false
    });

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API}/admin/verify`, { password });
            if (response.data.verified) {
                setIsAuthenticated(true);
                fetchData();
            }
        } catch (error) {
            alert('Invalid admin password');
        }
    };

    const fetchData = async () => {
        try {
            const [compsRes, usersRes, ordersRes, analyticsRes] = await Promise.all([
                axios.get(`${API}/admin/competitions?password=${password}`),
                axios.get(`${API}/admin/users?password=${password}`),
                axios.get(`${API}/admin/orders?password=${password}`),
                axios.get(`${API}/admin/analytics?password=${password}`)
            ]);
            
            setCompetitions(compsRes.data);
            setUsers(usersRes.data);
            setOrders(ordersRes.data);
            setAnalytics(analyticsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleCreateCompetition = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${API}/admin/competitions`, {
                ...formData,
                end_date: new Date(formData.end_date)
            }, {
                headers: { 'X-Admin-Password': password }
            });
            setShowCreateForm(false);
            fetchData();
            setFormData({
                title: '',
                description: '',
                prize_type: 'cash',
                prize_value: 0,
                prize_image: '',
                ticket_price: 0,
                total_tickets: 1000,
                max_tickets_per_user: 10,
                end_date: '',
                is_instant_win: false
            });
        } catch (error) {
            alert('Error creating competition');
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-[#161616] border border-white/10 rounded-2xl p-8">
                        <h1 className="font-heading text-3xl font-black text-white mb-6 text-center">
                            Admin Login
                        </h1>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <Label htmlFor="password" className="text-white/70">Admin Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter admin password"
                                    className="mt-1 h-12 bg-[#1C1C1E] border-white/10 text-white placeholder:text-white/30"
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-12 bg-[#FF3B3B] hover:bg-[#D93232] text-white font-heading uppercase tracking-wider rounded-none"
                            >
                                Login
                            </Button>
                        </form>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] pt-24">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="font-heading text-4xl font-black text-white mb-2">
                        Admin Dashboard
                    </h1>
                    <p className="text-white/50">Manage competitions, users, and analytics</p>
                </div>

                {/* Analytics Cards */}
                {analytics && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-[#161616] border border-white/5 rounded-xl p-6">
                            <div className="flex items-center gap-4">
                                <Users className="text-[#FF3B3B]" size={24} />
                                <div>
                                    <p className="text-white/50 text-sm">Total Users</p>
                                    <p className="font-heading text-2xl font-bold text-white">{analytics.total_users}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#161616] border border-white/5 rounded-xl p-6">
                            <div className="flex items-center gap-4">
                                <Trophy className="text-[#FFD700]" size={24} />
                                <div>
                                    <p className="text-white/50 text-sm">Active Competitions</p>
                                    <p className="font-heading text-2xl font-bold text-white">{analytics.active_competitions}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#161616] border border-white/5 rounded-xl p-6">
                            <div className="flex items-center gap-4">
                                <CreditCard className="text-green-500" size={24} />
                                <div>
                                    <p className="text-white/50 text-sm">Total Orders</p>
                                    <p className="font-heading text-2xl font-bold text-white">{analytics.total_orders}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#161616] border border-white/5 rounded-xl p-6">
                            <div className="flex items-center gap-4">
                                <TrendingUp className="text-blue-500" size={24} />
                                <div>
                                    <p className="text-white/50 text-sm">Total Revenue</p>
                                    <p className="font-heading text-2xl font-bold text-white">£{analytics.total_revenue?.toFixed(2) || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="mb-6">
                    <Button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-[#FF3B3B] hover:bg-[#D93232] text-white font-heading uppercase tracking-wider rounded-none"
                    >
                        <Plus className="mr-2" size={16} />
                        Create Competition
                    </Button>
                </div>

                {/* Create Competition Form */}
                {showCreateForm && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#161616] border border-white/5 rounded-xl p-6 mb-8"
                    >
                        <h3 className="font-heading text-xl font-bold text-white mb-4">Create New Competition</h3>
                        <form onSubmit={handleCreateCompetition} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-white/70">Title</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    className="mt-1 bg-[#1C1C1E] border-white/10 text-white"
                                    required
                                />
                            </div>
                            <div>
                                <Label className="text-white/70">Prize Type</Label>
                                <select
                                    value={formData.prize_type}
                                    onChange={(e) => setFormData({...formData, prize_type: e.target.value})}
                                    className="mt-1 w-full h-10 bg-[#1C1C1E] border border-white/10 text-white rounded-md px-3"
                                >
                                    <option value="cash">Cash</option>
                                    <option value="car">Car</option>
                                    <option value="tech">Tech</option>
                                    <option value="luxury">Luxury</option>
                                </select>
                            </div>
                            <div>
                                <Label className="text-white/70">Prize Value (£)</Label>
                                <Input
                                    type="number"
                                    value={formData.prize_value}
                                    onChange={(e) => setFormData({...formData, prize_value: parseFloat(e.target.value)})}
                                    className="mt-1 bg-[#1C1C1E] border-white/10 text-white"
                                    required
                                />
                            </div>
                            <div>
                                <Label className="text-white/70">Ticket Price (£)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={formData.ticket_price}
                                    onChange={(e) => setFormData({...formData, ticket_price: parseFloat(e.target.value)})}
                                    className="mt-1 bg-[#1C1C1E] border-white/10 text-white"
                                    required
                                />
                            </div>
                            <div>
                                <Label className="text-white/70">Total Tickets</Label>
                                <Input
                                    type="number"
                                    value={formData.total_tickets}
                                    onChange={(e) => setFormData({...formData, total_tickets: parseInt(e.target.value)})}
                                    className="mt-1 bg-[#1C1C1E] border-white/10 text-white"
                                    required
                                />
                            </div>
                            <div>
                                <Label className="text-white/70">Max Per User</Label>
                                <Input
                                    type="number"
                                    value={formData.max_tickets_per_user}
                                    onChange={(e) => setFormData({...formData, max_tickets_per_user: parseInt(e.target.value)})}
                                    className="mt-1 bg-[#1C1C1E] border-white/10 text-white"
                                    required
                                />
                            </div>
                            <div>
                                <Label className="text-white/70">End Date</Label>
                                <Input
                                    type="datetime-local"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                                    className="mt-1 bg-[#1C1C1E] border-white/10 text-white"
                                    required
                                />
                            </div>
                            <div>
                                <Label className="text-white/70">Prize Image URL</Label>
                                <Input
                                    value={formData.prize_image}
                                    onChange={(e) => setFormData({...formData, prize_image: e.target.value})}
                                    className="mt-1 bg-[#1C1C1E] border-white/10 text-white"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Label className="text-white/70">Description</Label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="mt-1 w-full h-24 bg-[#1C1C1E] border border-white/10 text-white rounded-md p-3"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2 flex gap-4">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-[#FF3B3B] hover:bg-[#D93232] text-white font-heading uppercase tracking-wider rounded-none"
                                >
                                    {loading ? 'Creating...' : 'Create Competition'}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => setShowCreateForm(false)}
                                    variant="outline"
                                    className="border-white/20 text-white hover:bg-white/10 font-heading uppercase tracking-wider rounded-none"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {/* Competitions Table */}
                <div className="bg-[#161616] border border-white/5 rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-white/5">
                        <h3 className="font-heading text-xl font-bold text-white">Competitions</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#0F0F0F]">
                                <tr>
                                    <th className="text-left p-4 text-white/70 text-sm font-medium">Title</th>
                                    <th className="text-left p-4 text-white/70 text-sm font-medium">Prize</th>
                                    <th className="text-left p-4 text-white/70 text-sm font-medium">Status</th>
                                    <th className="text-left p-4 text-white/70 text-sm font-medium">Sold</th>
                                    <th className="text-left p-4 text-white/70 text-sm font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {competitions.map((comp) => (
                                    <tr key={comp.competition_id} className="border-t border-white/5">
                                        <td className="p-4 text-white">{comp.title}</td>
                                        <td className="p-4 text-[#FF3B3B]">£{comp.prize_value.toLocaleString()}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                comp.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                                comp.status === 'ended' ? 'bg-red-500/20 text-red-400' :
                                                'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                                {comp.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-white">{comp.sold_tickets || 0}/{comp.total_tickets}</td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                                                    <Edit2 size={14} />
                                                </Button>
                                                <Button size="sm" variant="outline" className="border-red-500/20 text-red-400 hover:bg-red-500/10">
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
        </div>
    );
};
