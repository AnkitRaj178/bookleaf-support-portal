import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Book, BookOpen, Send, Ticket, User, ChevronDown } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

// ─── JWT payload decoder (no extra library) ───────────────────────────────────
function decodeJwt(token) {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch {
        return null;
    }
}

// ─── Resolve user identity from sessionStorage + JWT fallback ──────────────────
function resolveUser() {
    const role  = sessionStorage.getItem('role')  || 'author';
    let   name  = sessionStorage.getItem('name')  || '';
    let   email = sessionStorage.getItem('email') || '';

    // If name/email weren't persisted (older sessions), decode from JWT
    if (!name || !email) {
        const token   = sessionStorage.getItem('token') || '';
        const payload = decodeJwt(token);
        if (payload) {
            if (!name  && payload.name)  { name  = payload.name;  sessionStorage.setItem('name',  name);  }
            if (!name  && payload.email) { name  = payload.email.split('@')[0]; sessionStorage.setItem('name', name); }
            if (!email && payload.email) { email = payload.email; sessionStorage.setItem('email', email); }
        }
    }

    // Capitalise first letters as a last resort display name
    if (!name) name = role.charAt(0).toUpperCase() + role.slice(1);

    const initials = name
        .split(' ')
        .filter(Boolean)
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return { name, email, role, initials };
}

const NAV_LINKS = [
    { to: '/author', end: true, label: 'Overview', icon: <Book className="w-4 h-4" /> },
    { to: '/author/books', end: false, label: 'My Books', icon: <BookOpen className="w-4 h-4" /> },
    { to: '/author/tickets', end: false, label: 'My Tickets', icon: <Ticket className="w-4 h-4" /> },
    { to: '/author/support', end: false, label: 'Submit Query', icon: <Send className="w-4 h-4" /> },
];

const AuthorLayout = () => {
    const navigate = useNavigate();
    const [profileOpen, setProfileOpen] = useState(false);
    const dropdownRef = useRef(null);

    const [books, setBooks] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTickets = useCallback(async () => {
        try {
            const ticketsRes = await api.get('/tickets');
            setTickets(ticketsRes.data);
        } catch (error) {
            // silently fail on background refresh
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [booksRes, ticketsRes] = await Promise.all([
                    api.get('/books'),
                    api.get('/tickets')
                ]);
                setBooks(booksRes.data);
                setTickets(ticketsRes.data);
            } catch (error) {
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        const intervalId = setInterval(fetchData, 5000);
        return () => clearInterval(intervalId);
    }, []);

    // Resolve user on every render so it reacts to sessionStorage changes
    const { name, email, role, initials } = resolveUser();
    const firstName = name ? name.split(' ')[0] : 'Author';

    const handleLogout = () => {
        ['token', 'role', 'name', 'email'].forEach(k => sessionStorage.removeItem(k));
        navigate('/');
    };

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <Book className="w-12 h-12 text-brand-300 mb-4" />
                    <p className="text-slate-500 font-medium">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
            <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-2.5 flex-shrink-0">
                        <div className="bg-indigo-600 p-1.5 rounded-lg">
                            <Book className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg tracking-tight text-slate-900">
                            <span className="font-bold">BookLeaf</span> <span className="font-normal text-slate-500">Publishing</span>
                        </span>
                    </div>

                    <nav className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map(({ to, end, label, icon }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={end}
                                className={({ isActive }) => `
                                    flex items-center gap-1.5 px-4 py-2 text-sm rounded-full
                                    transition-all duration-200 select-none
                                    ${isActive
                                        ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-200'
                                        : 'text-slate-600 font-medium hover:bg-slate-100 hover:text-indigo-600'
                                    }
                                `}
                            >
                                {icon}
                                {label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="relative flex-shrink-0" ref={dropdownRef}>
                        <button
                            id="profile-menu-btn"
                            onClick={() => setProfileOpen(prev => !prev)}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            aria-expanded={profileOpen}
                            aria-haspopup="true"
                        >
                            <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700 border-2 border-indigo-200">
                                {initials || <User className="w-4 h-4" />}
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-sm font-semibold text-slate-800 leading-tight">{firstName}</p>
                                <p className="text-xs text-slate-400 capitalize">{role}</p>
                            </div>
                            <ChevronDown
                                className={`w-4 h-4 text-slate-400 transition-transform duration-200 hidden sm:block ${profileOpen ? 'rotate-180' : ''}`}
                            />
                        </button>

                        {profileOpen && (
                            <div
                                id="profile-dropdown"
                                className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50"
                            >
                                <div className="px-4 py-4 border-b border-slate-100 bg-gradient-to-br from-indigo-50 to-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className="h-11 w-11 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-md flex-shrink-0">
                                            {initials || <User className="w-5 h-5" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-900 truncate">{name}</p>
                                            <p className="text-xs text-slate-500 truncate mt-0.5">{email}</p>
                                            <span className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-semibold bg-indigo-100 text-indigo-700 rounded-full capitalize tracking-wide">
                                                {role}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-2">
                                    <button
                                        id="logout-btn"
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Log Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-12">
                <Outlet context={{ books, tickets, fetchTickets }} />
            </main>
        </div>
    );
};

export default AuthorLayout;
