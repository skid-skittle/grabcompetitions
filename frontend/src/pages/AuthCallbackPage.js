import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AuthCallbackPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setUser } = useAuth();
    
    const [status, setStatus] = useState('loading');
    const [error, setError] = useState(null);

    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        if (!sessionId) {
            setStatus('error');
            setError('No session ID provided');
            return;
        }

        const processAuth = async () => {
            try {
                const response = await axios.post(`${API}/auth/session`, {
                    session_id: sessionId
                }, {
                    withCredentials: true
                });

                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                    axios.defaults.headers.common.Authorization = `Bearer ${response.data.token}`;
                }

                if (response.data.user) {
                    setUser(response.data.user);
                    setStatus('success');
                    setTimeout(() => {
                        window.location.href = '/dashboard';
                    }, 2000);
                } else {
                    setStatus('error');
                    setError('Failed to authenticate');
                }
            } catch (error) {
                console.error('Auth error:', error);
                setStatus('error');
                setError(error.response?.data?.detail || 'Authentication failed');
            }
        };

        processAuth();
    }, [sessionId, navigate, setUser]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-[#0A0A0A] pt-24 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#FF3B3B]/20 flex items-center justify-center">
                        <Loader size={32} className="text-[#FF3B3B] animate-spin" />
                    </div>
                    <h1 className="font-heading text-3xl font-bold text-white mb-4">
                        Authenticating...
                    </h1>
                    <p className="text-white/50">Please wait while we verify your identity</p>
                </motion.div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen bg-[#0A0A0A] pt-24 flex items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center max-w-md"
                >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                        <AlertCircle size={32} className="text-red-400" />
                    </div>
                    <h1 className="font-heading text-3xl font-bold text-white mb-4">
                        Authentication Failed
                    </h1>
                    <p className="text-white/50 mb-8">
                        {error || 'There was an error authenticating your account. Please try again.'}
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Button
                            onClick={() => navigate('/auth')}
                            className="bg-[#FF3B3B] hover:bg-[#D93232] text-white font-heading uppercase tracking-wider rounded-none"
                        >
                            Try Again
                        </Button>
                        <Button
                            onClick={() => navigate('/')}
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10 font-heading uppercase tracking-wider rounded-none"
                        >
                            Go Home
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] pt-24 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
            >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle size={32} className="text-green-400" />
                </div>
                <h1 className="font-heading text-3xl font-bold text-white mb-4">
                    Authentication Successful!
                </h1>
                <p className="text-white/50">Redirecting you to your dashboard...</p>
            </motion.div>
        </div>
    );
};
