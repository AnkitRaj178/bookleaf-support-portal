import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { BookOpen, DollarSign, Clock, CheckCircle2, CircleDashed, Book, Ticket } from 'lucide-react';

const StatusBadge = ({ status }) => {
    const colors = {
        Open: 'bg-blue-100 text-blue-700 border-blue-200',
        'In Progress': 'bg-brand-100 text-brand-700 border-brand-200',
        Resolved: 'bg-green-100 text-green-700 border-green-200',
        Closed: 'bg-slate-100 text-slate-700 border-slate-200'
    };
    return (
        <span className={`flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded border ${colors[status] || colors.Closed}`}>
            {status === 'Resolved' ? <CheckCircle2 className="w-3 h-3" /> : <CircleDashed className="w-3 h-3" />}
            {status}
        </span>
    );
};

export default function AuthorOverview() {
    const { books, tickets } = useOutletContext();
    
    const totalBooks = books.length;
    const totalEarned = books.reduce((acc, book) => acc + (book.total_royalty_earned || 0), 0);
    const pendingRoyalty = books.reduce((acc, book) => acc + (book.royalty_pending || 0), 0);

    const recentTickets = [...(tickets || [])].reverse().slice(0, 2);

    return (
        <div>
            <header className="mb-10">
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                    <Book className="w-8 h-8 text-brand-600" />
                    Author Dashboard
                </h1>
                <p className="text-slate-500 mt-2">Manage your books, track royalties, and get support.</p>
            </header>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                        <div className="bg-brand-50 p-4 rounded-xl"><BookOpen className="w-6 h-6 text-brand-600" /></div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Books</p>
                            <p className="text-2xl font-bold text-slate-800">{totalBooks}</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                        <div className="bg-emerald-50 p-4 rounded-xl"><DollarSign className="w-6 h-6 text-emerald-600" /></div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Earned</p>
                            <p className="text-2xl font-bold text-slate-800">₹{totalEarned.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                        <div className="bg-orange-50 p-4 rounded-xl"><Clock className="w-6 h-6 text-orange-600" /></div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Pending Royalty</p>
                            <p className="text-2xl font-bold text-slate-800">₹{pendingRoyalty.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Grid Layout */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="text-lg font-semibold text-slate-800">Recent Queries</h2>
                        </div>
                        <div className="p-0 flex-1 flex flex-col">
                            {recentTickets.length === 0 ? (
                                <div className="p-8 text-center flex-1 flex items-center justify-center">
                                    <p className="text-sm text-slate-400 italic">No recent support queries.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 flex-1">
                                    {recentTickets.map((ticket) => (
                                        <div key={ticket._id} className="p-5 hover:bg-slate-50/50 transition-colors flex items-center justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                        TK-{ticket._id ? ticket._id.substring(ticket._id.length - 6).toUpperCase() : 'NEW'}
                                                    </span>
                                                    <StatusBadge status={ticket.status || 'Open'} />
                                                </div>
                                                <p className="text-sm font-medium text-slate-800 truncate">{ticket.subject}</p>
                                            </div>
                                            <Link to="/author/tickets" className="flex-shrink-0 text-slate-400 hover:text-indigo-600 transition-colors">
                                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200">
                                                    <Ticket className="w-4 h-4" />
                                                </div>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="mt-auto border-t border-slate-100">
                                <Link 
                                    to="/author/tickets" 
                                    className="block w-full p-4 text-center text-sm font-medium text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                                >
                                    View all tickets &rarr;
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                
                <div className="lg:col-span-1">
                    <div className="bg-slate-900 rounded-xl shadow-md p-6 text-white h-full flex flex-col">
                        <div>
                            <h3 className="text-xl font-bold mb-3">Need Help?</h3>
                            <p className="text-slate-300 text-sm leading-relaxed mb-6">
                                Our support team is ready to assist you with metadata, royalties, or production updates.
                            </p>
                        </div>
                        <div className="mt-auto">
                            <Link 
                                to="/author/support"
                                className="bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg px-4 py-2.5 w-full text-center font-semibold transition-colors block"
                            >
                                Submit Query
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
