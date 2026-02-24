import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, Ticket, Trophy, LogOut, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';

export const Navbar = ({ topOffset = 0 }) => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/competitions', label: 'Competitions' },
        { href: '/winners', label: 'Winners' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav
            className="fixed left-0 right-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/5"
            style={{ top: topOffset }}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2" data-testid="nav-logo">
                        <span className="font-heading text-2xl md:text-3xl font-black tracking-tight text-white">
                            GRAB
                        </span>
                        <span className="font-heading text-2xl md:text-3xl font-black tracking-tight text-[#FF3B3B]">
                            COMPETITIONS
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                to={link.href}
                                className={`font-heading text-sm uppercase tracking-[0.15em] transition-colors duration-300 ${
                                    isActive(link.href)
                                        ? 'text-[#FF3B3B]'
                                        : 'text-white/70 hover:text-white'
                                }`}
                                data-testid={`nav-${link.label.toLowerCase()}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Auth Section */}
                    <div className="hidden md:flex items-center gap-4">
                        {isAuthenticated ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors duration-300"
                                        data-testid="user-menu-trigger"
                                    >
                                        {user?.picture ? (
                                            <img src={user.picture} alt="" className="w-8 h-8 rounded-full" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-[#FF3B3B] flex items-center justify-center">
                                                <User size={16} className="text-white" />
                                            </div>
                                        )}
                                        <span className="text-white font-medium">{user?.name?.split(' ')[0]}</span>
                                        <ChevronDown size={16} className="text-white/50" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 bg-[#161616] border-white/10">
                                    <div className="px-3 py-2 border-b border-white/10">
                                        <p className="text-white font-medium">{user?.name}</p>
                                        <p className="text-white/50 text-sm">{user?.email}</p>
                                        <p className="text-[#FFD700] text-sm font-semibold mt-1">
                                            Balance: £{(user?.balance || 0).toFixed(2)}
                                        </p>
                                    </div>
                                    <DropdownMenuItem
                                        className="cursor-pointer text-white hover:bg-white/10"
                                        onClick={() => navigate('/dashboard')}
                                        data-testid="menu-dashboard"
                                    >
                                        <Ticket size={16} className="mr-2" />
                                        My Entries
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="cursor-pointer text-white hover:bg-white/10"
                                        onClick={() => navigate('/dashboard?tab=wins')}
                                        data-testid="menu-wins"
                                    >
                                        <Trophy size={16} className="mr-2" />
                                        My Wins
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-white/10" />
                                    <DropdownMenuItem
                                        className="cursor-pointer text-[#FF3B3B] hover:bg-white/10"
                                        onClick={handleLogout}
                                        data-testid="menu-logout"
                                    >
                                        <LogOut size={16} className="mr-2" />
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/auth"
                                    className="px-6 py-2.5 text-white font-heading uppercase tracking-wider text-sm hover:text-[#FF3B3B] transition-colors"
                                    data-testid="nav-login"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/auth?mode=register"
                                    className="px-6 py-2.5 bg-[#FF3B3B] text-white font-heading uppercase tracking-wider text-sm hover:bg-[#D93232] transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,59,59,0.4)]"
                                    data-testid="nav-register"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-white"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        data-testid="mobile-menu-toggle"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-[#0A0A0A] border-t border-white/5"
                    >
                        <div className="px-6 py-6 space-y-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    className={`block font-heading text-lg uppercase tracking-wider ${
                                        isActive(link.href) ? 'text-[#FF3B3B]' : 'text-white/70'
                                    }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="pt-4 border-t border-white/10">
                                {isAuthenticated ? (
                                    <>
                                        <Link
                                            to="/dashboard"
                                            className="block py-2 text-white font-heading uppercase tracking-wider"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setMobileMenuOpen(false);
                                            }}
                                            className="block py-2 text-[#FF3B3B] font-heading uppercase tracking-wider"
                                        >
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <Link
                                        to="/auth"
                                        className="block py-2 px-6 bg-[#FF3B3B] text-white text-center font-heading uppercase tracking-wider"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Login / Sign Up
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};