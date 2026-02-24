import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export const AuthPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login, register, loginWithGoogle, isAuthenticated, loading } = useAuth();
    
    const [mode, setMode] = useState(searchParams.get('mode') || 'login');
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [authLoading, setAuthLoading] = useState(false);

    useEffect(() => {
        if (!loading && isAuthenticated) {
            const redirect = searchParams.get('redirect') || '/dashboard';
            navigate(redirect);
        }
    }, [isAuthenticated, loading, navigate, searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAuthLoading(true);

        try {
            if (mode === 'login') {
                await login(formData.email, formData.password);
            } else {
                await register(formData.email, formData.password, formData.name);
            }
        } catch (error) {
            console.error('Auth error:', error);
        } finally {
            setAuthLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#FF3B3B] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-[#161616] border border-white/10 rounded-2xl p-8">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <h1 className="font-heading text-3xl font-black text-white mb-2">
                            GRAB <span className="text-[#FF3B3B]">COMPETITIONS</span>
                        </h1>
                        <p className="text-white/50">
                            {mode === 'login' ? 'Welcome back!' : 'Join thousands of winners'}
                        </p>
                    </div>

                    {/* Google Sign In */}
                    <Button
                        onClick={loginWithGoogle}
                        className="w-full h-12 bg-white text-black font-heading uppercase tracking-wider rounded-none mb-6 hover:bg-gray-100"
                        data-testid="google-signin"
                    >
                        Continue with Google
                    </Button>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-[#161616] px-4 text-white/30 text-sm">or</span>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'register' && (
                            <div>
                                <Label htmlFor="name" className="text-white/70">Full Name</Label>
                                <div className="relative mt-1">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                                    <Input
                                        id="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="John Doe"
                                        className="pl-10 h-12 bg-[#1C1C1E] border-white/10 text-white placeholder:text-white/30 focus:border-[#FF3B3B]"
                                        data-testid="name-input"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <Label htmlFor="email" className="text-white/70">Email Address</Label>
                            <div className="relative mt-1">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="you@example.com"
                                    className="pl-10 h-12 bg-[#1C1C1E] border-white/10 text-white placeholder:text-white/30 focus:border-[#FF3B3B]"
                                    required
                                    data-testid="email-input"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="password" className="text-white/70">Password</Label>
                            <div className="relative mt-1">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="pl-10 pr-10 h-12 bg-[#1C1C1E] border-white/10 text-white placeholder:text-white/30 focus:border-[#FF3B3B]"
                                    required
                                    data-testid="password-input"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/50"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={authLoading}
                            className="w-full h-12 bg-[#FF3B3B] hover:bg-[#D93232] text-white font-heading uppercase tracking-wider rounded-none mt-6"
                            data-testid="auth-submit-button"
                        >
                            {authLoading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Processing...
                                </span>
                            ) : (
                                <>
                                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                                    <ArrowRight className="ml-2" size={18} />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Toggle Mode */}
                    <div className="mt-6 text-center">
                        <p className="text-white/50">
                            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                            <button
                                type="button"
                                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                                className="text-[#FF3B3B] hover:underline ml-2 font-medium"
                                data-testid="toggle-auth-mode"
                            >
                                {mode === 'login' ? 'Sign Up' : 'Sign In'}
                            </button>
                        </p>
                    </div>
                </div>

                {/* Trust badges */}
                <div className="mt-8 flex justify-center gap-6">
                    <div className="flex items-center gap-2 text-white/30 text-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        Secure
                    </div>
                    <div className="flex items-center gap-2 text-white/30 text-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
