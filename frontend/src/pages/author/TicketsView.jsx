import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Ticket, ChevronDown, ChevronUp, CheckCircle2, CircleDashed, Bot, UserCheck, Book, User } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
const StatusBadge = ({ status }) => {
    const colors = {
        Open: 'bg-blue-100 text-blue-700 border-blue-200',
        'In Progress': 'bg-brand-100 text-brand-700 border-brand-200',
        Resolved: 'bg-green-100 text-green-700 border-green-200',
        Closed: 'bg-slate-100 text-slate-700 border-slate-200'
    };
    return (
        <span className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${colors[status] || colors.Closed}`}>
            {status === 'Resolved' ? <CheckCircle2 className="w-3 h-3" /> : <CircleDashed className="w-3 h-3" />}
            {status}
        </span>
    );
};

export default function TicketsView() {
    const { tickets, fetchTickets } = useOutletContext();
    const [expandedTicketId, setExpandedTicketId] = useState(null);
    const [readState, setReadState] = useState(() => {
        const saved = localStorage.getItem('authorTicketReadState');
        return saved ? JSON.parse(saved) : {};
    });
    const [replyText, setReplyText] = useState("");

    return (
        <section id="tickets-section" className="w-full">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-6">My Tickets</h1>
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-hidden">
                <div className="divide-y divide-slate-100">
                    {tickets.length === 0 ? (
                        <div className="p-12 text-center">
                            <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-slate-900">No tickets yet</h3>
                            <p className="text-slate-500">When you submit a query, you can track it here.</p>
                        </div>
                    ) : [...tickets].reverse().map(ticket => {
                        const isExpanded = expandedTicketId === ticket._id;
                        const officialResponses = ticket.responses ? ticket.responses.filter(r => r.sender !== 'AI') : [];
                        const responseCount = officialResponses.length;
                        return (
                            <div key={ticket._id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors">
                                {/* Accordion Header — always visible, click to toggle */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setExpandedTicketId(isExpanded ? null : ticket._id);
                                        const currentResponses = ticket.responses ? ticket.responses.length : 0;
                                        setReadState(prev => {
                                            const newState = { ...prev, [ticket._id]: currentResponses };
                                            localStorage.setItem('authorTicketReadState', JSON.stringify(newState));
                                            return newState;
                                        });
                                    }}
                                    className="group w-full text-left p-4 cursor-pointer hover:bg-slate-50 transition-colors duration-150 focus:outline-none"
                                >
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <span className="font-mono text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md flex-shrink-0">
                                                TK-{ticket._id ? ticket._id.substring(ticket._id.length - 6).toUpperCase() : 'NEW'}
                                            </span>
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <h3 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight truncate mb-1">{ticket.subject}</h3>
                                                <div className="flex items-center">
                                                    {ticket.bookId ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-semibold border border-indigo-100 truncate max-w-[200px]">
                                                            <Book className="w-3 h-3 mr-1 flex-shrink-0" />
                                                            <span className="truncate">Book: {ticket.bookId.title}</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md text-[10px] font-semibold border border-purple-100">
                                                            <User className="w-3 h-3 mr-1 flex-shrink-0" />
                                                            <span>General Query</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {(ticket.responses?.length || 0) > (readState[ticket._id] || 0) && !isExpanded && (
                                                <span className="flex-shrink-0 text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-0.5 rounded-full">
                                                    {(ticket.responses?.length || 0) - (readState[ticket._id] || 0)} new
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <StatusBadge status={ticket.status || 'Open'} />
                                            {isExpanded
                                                ? <ChevronUp className="w-4 h-4 text-slate-400 ml-1" />
                                                : <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />}
                                        </div>
                                    </div>
                                </button>

                                {/* Accordion Body — only visible when expanded */}
                                {isExpanded && (
                                    <div className="bg-slate-100/50 p-6 border-b border-slate-200 shadow-[inset_0_2px_4px_rgb(0,0,0,0.02)] space-y-4 animate-fadeIn">
                                        {/* Original query */}
                                        <div className="bg-white p-4 rounded-lg border border-slate-200 mb-6 shadow-sm">
                                            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Original Query</p>
                                            <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
                                        </div>

                                        {/* Conversation thread */}
                                        {responseCount > 0 ? (
                                            <div className="space-y-3">
                                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Conversation History</p>
                                                {officialResponses.map((resp, idx) => {
                                                    const isAI = resp.sender === 'AI';
                                                    const isAdmin = resp.sender === 'Admin';
                                                    return (
                                                        <div key={idx} className="mb-5 flex flex-col items-start">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-xs font-bold text-slate-700">{resp.sender}</span>
                                                                    {isAI && (
                                                                        <span className="text-[9px] font-bold tracking-wider text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md uppercase">AI ASSISTANT</span>
                                                                    )}
                                                                    {isAdmin && (
                                                                        <span className="text-[9px] font-bold tracking-wider text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md uppercase">SUPPORT</span>
                                                                    )}
                                                                    {resp.timestamp && (
                                                                        <span className="text-slate-400 text-xs ml-auto">
                                                                            {new Date(resp.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="mt-1 bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-sm text-sm text-slate-700 w-fit max-w-2xl leading-relaxed">
                                                                    <p className="leading-relaxed whitespace-pre-wrap">{resp.message}</p>
                                                                </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-500 italic text-center my-6">Our support team is reviewing your query. You will receive a response shortly.</p>
                                        )}
                                        
                                        {ticket.status === 'Resolved' || ticket.status === 'Closed' ? (
                                            <p className="text-center text-sm text-gray-500 italic py-4">This ticket has been marked as {ticket.status.toLowerCase()} and is closed to new replies.</p>
                                        ) : ticket.responses?.length > 0 ? (
                                            <form 
                                                onSubmit={async (e) => {
                                                    e.preventDefault();
                                                    try {
                                                        await api.post(`/tickets/${ticket._id}/responses`, 
                                                            { message: replyText.trim() },
                                                            { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } }
                                                        );
                                                        setReplyText("");
                                                        if (fetchTickets) fetchTickets();
                                                        toast.success("Reply sent!");
                                                    } catch (error) {
                                                        if (error.response?.status === 403) {
                                                            toast.error("Access Denied: You do not have permission to perform this action.");
                                                        } else {
                                                            toast.error("Failed to send reply.");
                                                        }
                                                    }
                                                }}
                                                className="mt-6 flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-[0_2px_4px_rgb(0,0,0,0.02)] focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all"
                                            >
                                                <input 
                                                    type="text" 
                                                    placeholder="Type your reply..." 
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                                                />
                                                <button 
                                                    type="submit" 
                                                    disabled={!replyText.trim()}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                                                >
                                                    Send
                                                </button>
                                            </form>
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
