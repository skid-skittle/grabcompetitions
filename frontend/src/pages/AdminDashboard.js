import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Lock, Plus, Edit, Trash2, Trophy, Users, CreditCard, BarChart3,
  Upload, Image as ImageIcon, Search, Filter, X, Check, Clock, DollarSign,
  Gift, UserCheck, Ticket, Calendar, TrendingUp, Eye, EyeOff
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API,
  timeout: 15000,
});

export const AdminDashboard = () => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [competitions, setCompetitions] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [uploadingImage, setUploadingImage] = useState(false);
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
    is_instant_win: false,
    instant_win_prizes: [],
    facebook_live_url: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post(`/admin/verify`, { password });
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await api.post(`/admin/upload-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, prize_image: response.data.url }));
    } catch (error) {
      alert(error?.response?.data?.detail || error?.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateCompetition = async () => {
    const storedPassword = localStorage.getItem('admin_password');
    setLoading(true);
    try {
      const payload = {
        ...formData,
        prize_value: formData.prize_value === '' ? 0 : Number(formData.prize_value),
        ticket_price: formData.ticket_price === '' ? 0 : Number(formData.ticket_price),
        total_tickets: formData.total_tickets === '' ? 0 : Number(formData.total_tickets),
        max_tickets_per_user:
          formData.max_tickets_per_user === '' ? 10 : Number(formData.max_tickets_per_user),
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : new Date().toISOString(),
        instant_win_prizes: (formData.instant_win_prizes || []).map((p) => ({
          ...p,
          quantity: p.quantity === '' || p.quantity === undefined ? 0 : Number(p.quantity),
          value: p.value === '' || p.value === undefined ? 0 : Number(p.value),
        })),
      };

      await api.post(`/admin/competitions`, payload, {
        headers: { 'X-Admin-Password': storedPassword }
      });
      alert('Competition created successfully!');
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
        is_instant_win: false,
        instant_win_prizes: [],
        facebook_live_url: ''
      });
      setShowCreateForm(false);
      fetchData();
    } catch (error) {
      alert(error?.response?.data?.detail || error?.message || 'Failed to create competition');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantWin = async (competitionId) => {
    if (!window.confirm('Select an instant winner? This cannot be undone.')) return;
    const storedPassword = localStorage.getItem('admin_password');
    try {
      await api.post(`/admin/competitions/${competitionId}/instant-win`, {}, {
        headers: { 'X-Admin-Password': storedPassword }
      });
      alert('Winner selected successfully!');
      fetchData();
    } catch (error) {
      alert(error?.response?.data?.detail || error?.message || 'Failed to select winner');
    }
  };

  const handleDeleteCompetition = async (competitionId) => {
    const storedPassword = localStorage.getItem('admin_password');
    setLoading(true);
    try {
      await api.delete(`/admin/competitions/${competitionId}`, {
        headers: { 'X-Admin-Password': storedPassword }
      });
      alert('Competition deleted');
      fetchData();
    } catch (error) {
      alert(error?.response?.data?.detail || error?.message || 'Failed to delete competition');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBalance = async (userId, amount) => {
    const storedPassword = localStorage.getItem('admin_password');
    try {
      await api.post(
        `/admin/user/${userId}/add-balance`,
        { amount: Number(amount) },
        {
          headers: { 'X-Admin-Password': storedPassword }
        }
      );
      alert(`Added £${amount} to user balance`);
      fetchData();
    } catch (error) {
      alert(error?.response?.data?.detail || error?.message || 'Failed to add balance');
    }
  };

  const fetchData = async () => {
    const storedPassword = localStorage.getItem('admin_password') || password;
    if (!storedPassword) return;
    try {
      const [compsRes, usersRes, ordersRes, analyticsRes] = await Promise.all([
        api.get(`/admin/competitions`, { headers: { 'X-Admin-Password': storedPassword } }),
        api.get(`/admin/users`, { headers: { 'X-Admin-Password': storedPassword } }),
        api.get(`/admin/orders`, { headers: { 'X-Admin-Password': storedPassword } }),
        api.get(`/admin/analytics`, { headers: { 'X-Admin-Password': storedPassword } })
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
    if (storedPassword) setPassword(storedPassword);
  }, []);

  const filteredCompetitions = competitions.filter(comp => {
    const matchesSearch = comp.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || comp.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (!isAuthenticated) {
    return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md"
        >
          <div className="flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white text-center mb-6">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="password" className="text-white">Admin Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder-white/50"
                placeholder="Enter admin password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <Button
            variant="outline"
            onClick={() => {
              localStorage.removeItem('admin_password');
              setIsAuthenticated(false);
            }}
          >
            Logout
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="competitions">Competitions</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.total_users || 0}</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Competitions</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.active_competitions || 0}</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">£{analytics?.total_revenue?.toFixed(2) || 0}</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.total_orders || 0}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="competitions" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search competitions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/50"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="ended">Ended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Competition
              </Button>
            </div>

            {showCreateForm && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">Create Competition</h2>
                  <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title" className="text-white">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="prize_type" className="text-white">Prize Type</Label>
                    <Select value={formData.prize_type} onValueChange={(value) => setFormData(prev => ({ ...prev, prize_type: value }))}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="car">Car</SelectItem>
                        <SelectItem value="tech">Tech</SelectItem>
                        <SelectItem value="luxury">Luxury</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="prize_value" className="text-white">Prize Value</Label>
                    <Input
                      id="prize_value"
                      type="number"
                      value={formData.prize_value}
                      onChange={(e) => setFormData(prev => ({ ...prev, prize_value: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ticket_price" className="text-white">Ticket Price</Label>
                    <Input
                      id="ticket_price"
                      type="number"
                      value={formData.ticket_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, ticket_price: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="total_tickets" className="text-white">Total Tickets</Label>
                    <Input
                      id="total_tickets"
                      type="number"
                      value={formData.total_tickets}
                      onChange={(e) => setFormData(prev => ({ ...prev, total_tickets: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date" className="text-white">End Date</Label>
                    <Input
                      id="end_date"
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description" className="text-white">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white"
                      rows={3}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="prize_image" className="text-white">Prize Image</Label>
                    <div className="flex gap-4">
                      <Input
                        id="prize_image"
                        value={formData.prize_image}
                        onChange={(e) => setFormData(prev => ({ ...prev, prize_image: e.target.value }))}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="Or upload an image"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <Button
                        type="button"
                        onClick={() => document.getElementById('image-upload').click()}
                        disabled={uploadingImage}
                        className="bg-white/10 hover:bg-white/20"
                      >
                        {uploadingImage ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Image
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="flex items-center space-x-2 text-white">
                      <input
                        type="checkbox"
                        checked={formData.is_instant_win}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_instant_win: e.target.checked }))}
                        className="mr-2"
                      />
                      Instant Win Competition
                    </Label>
                  </div>
                  
                  {formData.is_instant_win && (
                    <div className="md:col-span-2 space-y-4">
                      <Label className="text-white font-semibold">Instant Win Prizes</Label>
                      {formData.instant_win_prizes.map((prize, index) => (
                        <div key={index} className="flex gap-4 items-center bg-white/10 p-4 rounded-lg">
                          <div className="flex-1">
                            <Input
                              placeholder="Prize name"
                              value={prize.name}
                              onChange={(e) => {
                                const newPrizes = [...formData.instant_win_prizes];
                                newPrizes[index].name = e.target.value;
                                setFormData(prev => ({ ...prev, instant_win_prizes: newPrizes }));
                              }}
                              className="bg-white/10 border-white/20 text-white mb-2"
                            />
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                placeholder="Quantity"
                                value={prize.quantity}
                                onChange={(e) => {
                                  const newPrizes = [...formData.instant_win_prizes];
                                  newPrizes[index].quantity = parseInt(e.target.value) || 0;
                                  setFormData(prev => ({ ...prev, instant_win_prizes: newPrizes }));
                                }}
                                className="bg-white/10 border-white/20 text-white flex-1"
                              />
                              <Input
                                type="number"
                                placeholder="Value (£)"
                                value={prize.value}
                                onChange={(e) => {
                                  const newPrizes = [...formData.instant_win_prizes];
                                  newPrizes[index].value = parseFloat(e.target.value) || 0;
                                  setFormData(prev => ({ ...prev, instant_win_prizes: newPrizes }));
                                }}
                                className="bg-white/10 border-white/20 text-white flex-1"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  const newPrizes = formData.instant_win_prizes.filter((_, i) => i !== index);
                                  setFormData(prev => ({ ...prev, instant_win_prizes: newPrizes }));
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <Input
                              placeholder="Prize image URL (optional)"
                              value={prize.image}
                              onChange={(e) => {
                                const newPrizes = [...formData.instant_win_prizes];
                                newPrizes[index].image = e.target.value;
                                setFormData(prev => ({ ...prev, instant_win_prizes: newPrizes }));
                              }}
                              className="bg-white/10 border-white/20 text-white w-full"
                            />
                          </div>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          instant_win_prizes: [...prev.instant_win_prizes, { name: '', quantity: 1, value: 0, image: '' }]
                        }))}
                        className="text-white border-white/20"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Prize
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex justify-end mt-6">
                  <Button onClick={handleCreateCompetition} disabled={loading}>
                    {loading ? 'Creating...' : 'Create Competition'}
                  </Button>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompetitions.map((comp) => (
                <motion.div
                  key={comp.competition_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden"
                >
                  <div className="relative">
                    {comp.prize_image && (
                      <img src={comp.prize_image} alt={comp.title} className="w-full h-48 object-cover" />
                    )}
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-white">{comp.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          comp.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
                        }`}>
                          {comp.status}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-4 line-clamp-2">{comp.description}</p>
                      <div className="flex justify-between items-center text-sm text-gray-400">
                        <span>{comp.sold_tickets}/{comp.total_tickets} tickets</span>
                        <span>£{comp.ticket_price}</span>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingCompetition(comp)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        {comp.status === 'active' && (
                          <Button
                            size="sm"
                            onClick={() => handleInstantWin(comp.competition_id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Trophy className="w-4 h-4 mr-1" />
                            Instant Win
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (window.confirm('Delete this competition?')) {
                              handleDeleteCompetition(comp.competition_id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/50"
                />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left p-4 text-white">User</th>
                      <th className="text-left p-4 text-white">Email</th>
                      <th className="text-left p-4 text-white">Balance</th>
                      <th className="text-left p-4 text-white">Tickets</th>
                      <th className="text-left p-4 text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.user_id} className="border-b border-white/10">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {user.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <span className="text-white">{user.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-300">{user.email}</td>
                        <td className="p-4 text-white">£{user.balance || 0}</td>
                        <td className="p-4 text-gray-300">{user.tickets_count || 0}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAddBalance(user.user_id, 10)}
                            >
                              <CreditCard className="w-4 h-4 mr-1" />
                              Add £10
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const amount = prompt('Enter amount to add:');
                                if (amount) handleAddBalance(user.user_id, parseFloat(amount));
                              }}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add Balance
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left p-4 text-white">Order ID</th>
                      <th className="text-left p-4 text-white">User</th>
                      <th className="text-left p-4 text-white">Amount</th>
                      <th className="text-left p-4 text-white">Status</th>
                      <th className="text-left p-4 text-white">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.order_id} className="border-b border-white/10">
                        <td className="p-4 text-gray-300">{order.order_id}</td>
                        <td className="p-4 text-white">{order.user_email}</td>
                        <td className="p-4 text-white">£{order.amount}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'completed' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4 text-gray-300">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.total_users || 0}</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Competitions</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.total_competitions || 0}</div>
                  <p className="text-xs text-muted-foreground">+8% from last month</p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">£{analytics?.total_revenue?.toFixed(2) || 0}</div>
                  <p className="text-xs text-muted-foreground">+23% from last month</p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Competitions</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.active_competitions || 0}</div>
                  <p className="text-xs text-muted-foreground">+5% from last month</p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.total_orders || 0}</div>
                  <p className="text-xs text-muted-foreground">+18% from last month</p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
                  <Ticket className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.total_tickets || 0}</div>
                  <p className="text-xs text-muted-foreground">+15% from last month</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
