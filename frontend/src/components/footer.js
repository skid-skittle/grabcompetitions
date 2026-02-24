import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="bg-[#0A0A0A] border-t border-white/5 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div>
                        <Link to="/" className="inline-block mb-6">
                            <span className="font-heading text-2xl font-black tracking-tight text-white">
                                GRAB
                            </span>
                            <span className="font-heading text-2xl font-black tracking-tight text-[#FF3B3B]">
                                {' '}COMPETITIONS
                            </span>
                        </Link>
                        <p className="text-white/50 text-sm leading-relaxed mb-6">
                            The UK's most exciting competition platform. Win incredible prizes from cash to luxury cars.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-[#FF3B3B] hover:text-white transition-all duration-300">
                                <Facebook size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-[#FF3B3B] hover:text-white transition-all duration-300">
                                <Instagram size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-[#FF3B3B] hover:text-white transition-all duration-300">
                                <Twitter size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-heading text-lg uppercase tracking-wider text-white mb-6">Quick Links</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/competitions" className="text-white/50 hover:text-[#FF3B3B] transition-colors text-sm">
                                    All Competitions
                                </Link>
                            </li>
                            <li>
                                <Link to="/winners" className="text-white/50 hover:text-[#FF3B3B] transition-colors text-sm">
                                    Past Winners
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard" className="text-white/50 hover:text-[#FF3B3B] transition-colors text-sm">
                                    My Account
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="font-heading text-lg uppercase tracking-wider text-white mb-6">Categories</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/competitions?type=cash" className="text-white/50 hover:text-[#FF3B3B] transition-colors text-sm">
                                    Cash Prizes
                                </Link>
                            </li>
                            <li>
                                <Link to="/competitions?type=car" className="text-white/50 hover:text-[#FF3B3B] transition-colors text-sm">
                                    Luxury Cars
                                </Link>
                            </li>
                            <li>
                                <Link to="/competitions?type=tech" className="text-white/50 hover:text-[#FF3B3B] transition-colors text-sm">
                                    Tech & Gaming
                                </Link>
                            </li>
                            <li>
                                <Link to="/competitions?type=luxury" className="text-white/50 hover:text-[#FF3B3B] transition-colors text-sm">
                                    Luxury Items
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-heading text-lg uppercase tracking-wider text-white mb-6">Contact Us</h4>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-white/50 text-sm">
                                <Mail size={16} className="text-[#FF3B3B]" />
                                support@grabcompetitions.co.uk
                            </li>
                            <li className="flex items-center gap-3 text-white/50 text-sm">
                                <Phone size={16} className="text-[#FF3B3B]" />
                                0800 123 4567
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-white/30 text-sm">
                        © 2024 Grab Competitions. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <Link to="/terms" className="text-white/30 hover:text-white/50 text-sm transition-colors">
                            Terms & Conditions
                        </Link>
                        <Link to="/privacy" className="text-white/30 hover:text-white/50 text-sm transition-colors">
                            Privacy Policy
                        </Link>
                        <Link to="/responsible-gaming" className="text-white/30 hover:text-white/50 text-sm transition-colors">
                            Responsible Gaming
                        </Link>
                    </div>
                </div>

                {/* 18+ Warning */}
                <div className="mt-8 p-4 bg-white/5 rounded-lg flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#FF3B3B] flex items-center justify-center text-white font-heading font-bold text-lg flex-shrink-0">
                        18+
                    </div>
                    <p className="text-white/50 text-xs">
                        Please play responsibly. Competitions are only open to UK residents aged 18 and over.
                        If you think you may have a gambling problem, please visit{' '}
                        <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer" className="text-[#FF3B3B] hover:underline">
                            BeGambleAware.org
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
};