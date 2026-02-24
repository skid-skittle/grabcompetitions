import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { CompetitionCard } from '../components/competitioncard';
import { Button } from '../components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const CompetitionsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [competitions, setCompetitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        type: searchParams.get('type') || 'all',
        sort: searchParams.get('sort') || 'newest',
        status: 'active'
    });

    useEffect(() => {
        const fetchCompetitions = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (filters.type && filters.type !== 'all') params.append('prize_type', filters.type);
                if (filters.sort) params.append('sort', filters.sort);
                if (filters.status) params.append('status', filters.status);

                const response = await axios.get(`${API}/competitions?${params.toString()}`);
                setCompetitions(response.data);
            } catch (error) {
                console.error('Error fetching competitions:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCompetitions();
    }, [filters]);

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        
        const params = new URLSearchParams();
        if (newFilters.type && newFilters.type !== 'all') params.set('type', newFilters.type);
        if (newFilters.sort) params.set('sort', newFilters.sort);
        setSearchParams(params);
    };

    const categories = [
        { value: 'all', label: 'All Categories' },
        { value: 'cash', label: 'Cash Prizes' },
        { value: 'car', label: 'Luxury Cars' },
        { value: 'tech', label: 'Tech & Gaming' },
        { value: 'luxury', label: 'Luxury Items' }
    ];

    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'ending_soon', label: 'Ending Soon' },
        { value: 'price_low', label: 'Price: Low to High' },
        { value: 'price_high', label: 'Price: High to Low' }
    ];

    return (
        <div className="min-h-screen bg-[#0A0A0A] pt-24">
            {/* Header */}
            <section className="py-12 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="font-heading text-4xl sm:text-5xl font-black text-white mb-4">
                            ALL <span className="text-[#FF3B3B]">COMPETITIONS</span>
                        </h1>
                        <p className="text-white/50 max-w-xl">
                            Browse our live competitions and find your dream prize. New competitions added regularly.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Filters */}
            <section className="py-6 bg-[#0F0F0F] border-b border-white/5 sticky top-20 z-40">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-2 text-white/50">
                                <Filter size={16} />
                                <span className="text-sm font-medium">Filters:</span>
                            </div>
                            
                            {/* Category Filter */}
                            <Select
                                value={filters.type}
                                onValueChange={(value) => handleFilterChange('type', value)}
                            >
                                <SelectTrigger className="w-40 bg-[#1C1C1E] border-white/10 text-white" data-testid="filter-category">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1C1C1E] border-white/10">
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value} className="text-white hover:bg-white/10">
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Status Filter */}
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={filters.status === 'active' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleFilterChange('status', 'active')}
                                    className={filters.status === 'active' ? 'bg-[#FF3B3B] hover:bg-[#D93232]' : 'border-white/20 text-white hover:bg-white/10'}
                                    data-testid="filter-active"
                                >
                                    Active
                                </Button>
                                <Button
                                    variant={filters.status === 'ended' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleFilterChange('status', 'ended')}
                                    className={filters.status === 'ended' ? 'bg-[#FF3B3B] hover:bg-[#D93232]' : 'border-white/20 text-white hover:bg-white/10'}
                                    data-testid="filter-ended"
                                >
                                    Ended
                                </Button>
                            </div>
                        </div>

                        {/* Sort */}
                        <div className="flex items-center gap-2">
                            <SlidersHorizontal size={16} className="text-white/50" />
                            <Select
                                value={filters.sort}
                                onValueChange={(value) => handleFilterChange('sort', value)}
                            >
                                <SelectTrigger className="w-44 bg-[#1C1C1E] border-white/10 text-white" data-testid="filter-sort">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1C1C1E] border-white/10">
                                    {sortOptions.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value} className="text-white hover:bg-white/10">
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </section>

            {/* Competitions Grid */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div key={i} className="bg-[#161616] rounded-xl h-96 animate-pulse" />
                            ))}
                        </div>
                    ) : competitions.length > 0 ? (
                        <>
                            <div className="flex items-center justify-between mb-8">
                                <p className="text-white/50">
                                    Showing <span className="text-white font-semibold">{competitions.length}</span> competitions
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {competitions.map((comp, idx) => (
                                    <CompetitionCard key={comp.competition_id} competition={comp} index={idx} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                                <Search size={32} className="text-white/30" />
                            </div>
                            <h3 className="font-heading text-2xl font-bold text-white mb-2">
                                No Competitions Found
                            </h3>
                            <p className="text-white/50 mb-6">
                                Try adjusting your filters or check back soon for new competitions.
                            </p>
                            <Button
                                onClick={() => {
                                    setFilters({ type: 'all', sort: 'newest', status: 'active' });
                                    setSearchParams({});
                                }}
                                className="bg-[#FF3B3B] hover:bg-[#D93232] text-white font-heading uppercase tracking-wider rounded-none"
                            >
                                Clear Filters
                            </Button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};
