import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Book, BookOpen, Send, Ticket, User, ChevronDown } from 'lucide-react';

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

// ─── Nav link definitions (sectionKey = short active-state identifier) ──────
const NAV_LINKS = [
    { id: 'books-section',   sectionKey: 'books',   label: 'My Books',     href: '#books-section',   icon: <BookOpen className="w-4 h-4" /> },
    { id: 'tickets-section', sectionKey: 'tickets', label: 'My Tickets',   href: '#tickets-section', icon: <Ticket   className="w-4 h-4" /> },
    { id: 'query-section',   sectionKey: 'query',   label: 'Submit Query', href: '#query-section',   icon: <Send     className="w-4 h-4" /> },
];

const Layout = () => {
    const navigate = useNavigate();
    const [profileOpen,   setProfileOpen]   = useState(false);
    // activeSection holds the short key: 'books' | 'tickets' | 'query'
    const [activeSection, setActiveSection] = useState('books');
    const dropdownRef = useRef(null);

    // Resolve user on every render so it reacts to sessionStorage changes
    const { name, email, role, initials } = resolveUser();
    const firstName = name ? name.split(' ')[0] : 'Author';

    // ── Logout ─────────────────────────────────────────────────────────────────
    const handleLogout = () => {
        ['token', 'role', 'name', 'email'].forEach(k => sessionStorage.removeItem(k));
        navigate('/');
    };

    // ── Close dropdown on outside click ────────────────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Scroll-based active section tracker ─────────────────────────────────────
    // Uses a scroll listener instead of IntersectionObserver so it works even
    // when <Outlet> children mount after the Layout (e.g. during data loading).
    useEffect(() => {
        const idToKey = Object.fromEntries(NAV_LINKS.map(l => [l.id, l.sectionKey]));
        let ticking = false;

        const updateActiveSection = () => {
            // The "target line" is 30% from the top of the viewport
            const targetY = window.innerHeight * 0.3;
            let bestKey = '';

            NAV_LINKS.forEach(({ id }) => {
                const el = document.getElementById(id);
                if (!el) return;
                const rect = el.getBoundingClientRect();
                
                // If the target line is within the element's vertical bounds:
                if (rect.top <= targetY && rect.bottom >= targetY) {
                    bestKey = idToKey[id] || '';
                }
            });

            if (bestKey) {
                setActiveSection(bestKey);
            }
            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(updateActiveSection);
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        // Run once after a short delay to set the initial active state
        const timer = setTimeout(updateActiveSection, 500);

        return () => {
            window.removeEventListener('scroll', onScroll);
            clearTimeout(timer);
        };
    }, []);

    // ── Smooth-scroll + immediate active feedback on click ────────────────────
    const handleNavClick = (e, href, sectionKey) => {
        e.preventDefault();
        setActiveSection(sectionKey);   // instant visual feedback before scroll
        const id = href.replace('#', '');
        const el = document.getElementById(id);
        if (el) {
            const top = el.getBoundingClientRect().top + window.scrollY - 64 - 8;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">

            {/* ══ Sticky Navbar ══════════════════════════════════════════════════ */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">

                    {/* Logo — far left */}
                    <div className="flex items-center gap-2.5 flex-shrink-0">
                        <div className="bg-indigo-600 p-1.5 rounded-lg">
                            <Book className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg tracking-tight text-slate-900">
                            <span className="font-bold">BookLeaf</span> <span className="font-normal text-slate-500">Publishing</span>
                        </span>
                    </div>

                    {/* Centre nav — hidden on mobile */}
                    <nav className="hidden md:flex items-center gap-1">
                        {role === 'admin' ? (
                            <span className="text-slate-700 font-semibold text-sm px-4 py-2 bg-slate-100 rounded-full border border-slate-200">
                                Operations Management Portal
                            </span>
                        ) : (
                            NAV_LINKS.map(({ id, sectionKey, label, href, icon }) => {
                                const isActive = activeSection === sectionKey;
                                return (
                                    <a
                                        key={id}
                                        href={href}
                                        onClick={(e) => handleNavClick(e, href, sectionKey)}
                                        className={`
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
                                    </a>
                                );
                            })
                        )}
                    </nav>

                    {/* Profile button — far right */}
                    <div className="relative flex-shrink-0" ref={dropdownRef}>
                        <button
                            id="profile-menu-btn"
                            onClick={() => setProfileOpen(prev => !prev)}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            aria-expanded={profileOpen}
                            aria-haspopup="true"
                        >
                            {/* Avatar circle with real initials */}
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

                        {/* Floating profile dropdown */}
                        {profileOpen && (
                            <div
                                id="profile-dropdown"
                                className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50"
                            >
                                {/* User identity header */}
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

                                {/* Logout action */}
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

            {/* ══ Page Content ═══════════════════════════════════════════════════ */}
            <main className="flex-1 w-full">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
