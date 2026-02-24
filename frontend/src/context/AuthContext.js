import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common.Authorization = `Bearer ${token}`;
        }
    }, []);

    const checkAuth = useCallback(async () => {
        try {
            const response = await axios.get(`${API}/auth/me`, {
                withCredentials: true,
                headers: getAuthHeaders()
            });
            setUser(response.data);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, [getAuthHeaders]);

    useEffect(() => {
        // CRITICAL: If returning from OAuth callback, skip the /me check.
        // AuthCallback will exchange the session_id and establish the session first.
        if (window.location.hash?.includes('session_id=')) {
            setLoading(false);
            return;
        }
        checkAuth();
    }, [checkAuth]);

    const login = async (email, password) => {
        const response = await axios.post(`${API}/auth/login`, { email, password }, {
            withCredentials: true
        });
        setUser(response.data.user);
        localStorage.setItem('token', response.data.token);
        axios.defaults.headers.common.Authorization = `Bearer ${response.data.token}`;
        return response.data;
    };

    const register = async (email, password, name) => {
        const response = await axios.post(`${API}/auth/register`, { email, password, name });
        setUser(response.data.user);
        localStorage.setItem('token', response.data.token);
        axios.defaults.headers.common.Authorization = `Bearer ${response.data.token}`;
        return response.data;
    };

    const loginWithGoogle = () => {
        // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
        const redirectUrl = window.location.origin + '/auth/callback';
        window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
    };

    const processOAuthSession = async (sessionId) => {
        const response = await axios.post(`${API}/auth/session`, { session_id: sessionId }, {
            withCredentials: true
        });
        setUser(response.data.user);
        return response.data;
    };

    const logout = async () => {
        try {
            await axios.post(`${API}/auth/logout`, {}, {
                withCredentials: true,
                headers: getAuthHeaders()
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
        setUser(null);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common.Authorization;
    };

    const refreshUser = async () => {
        await checkAuth();
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            loginWithGoogle,
            processOAuthSession,
            logout,
            refreshUser,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};