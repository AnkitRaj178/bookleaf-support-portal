import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Filter, SortDesc, Bot, Inbox } from 'lucide-react';
import TicketQueueItem from '../../components/tickets/TicketQueueItem';
import TicketDetailView from '../../components/tickets/TicketDetailView';
import AdminEmptyState from '../../components/tickets/AdminEmptyState';

const badgeStyles = {
    Critical: 'bg-red-100 text-red-800 font-semibold',
    High: 'bg-orange-100 text-orange-800 font-semibold',
    Medium: 'bg-yellow-100 text-yellow-800 font-semibold',
    Low: 'bg-slate-100 text-slate-800',
    Unassigned: 'bg-slate-100 text-slate-800'
};

const statusStyles = {
    Open: 'bg-blue-100 text-blue-800',
    'In Progress': 'bg-indigo-100 text-indigo-800',
    Resolved: 'bg-green-100 text-green-800',
    Closed: 'bg-slate-100 text-slate-800'
};

const calculateUrgencyScore = (ticket) => {
    if (ticket.status === 'Resolved' || ticket.status === 'Closed') return -1000;
    const baseScores = { 'Critical': 100, 'High': 75, 'Medium': 50, 'Low': 25, 'Unassigned': 10 };
    const baseScore = baseScores[ticket.priority] || 10;
    const hoursOld = (new Date() - new Date(ticket.createdAt)) / (1000 * 60 * 60);
    return baseScore + (hoursOld * 2);
};

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { ticketId } = useParams();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterPriority, setFilterPriority] = useState('All');
    const [dateFilter, setDateFilter] = useState('All Dates');
    
    // Workspace State
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [workspace, setWorkspace] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const fetchTickets = async () => {
        try {
            const { data } = await api.get('/tickets');
            setTickets(data);
        } catch (error) {
            console.error('Failed to load tickets', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
        const intervalId = setInterval(fetchTickets, 5000);
        return () => clearInterval(intervalId);
    }, []);

    const handleSelectTicket = (ticket) => {
        if (selectedTicketId === ticket._id) return;
        navigate(`/admin/${ticket._id}`, { replace: true });
        const aiDraft = ticket.aiDraftResponse || ticket.responses?.find(r => r.sender === 'AI')?.message || '';
        setSelectedTicketId(ticket._id);
        setWorkspace({
            priority: ticket.priority || 'Unassigned',
            category: ticket.category || 'General',
            status: ticket.status || 'Open',
            internalNotes: ticket.adminNotes || '',
            replyDraft: aiDraft
        });
    };

    useEffect(() => {
        if (tickets.length > 0 && ticketId && !selectedTicketId) {
            const foundTicket = tickets.find(t => t._id === ticketId);
            if (foundTicket) {
                handleSelectTicket(foundTicket);
            }
        }
    }, [tickets, ticketId, selectedTicketId]);

    const handleAssignToMe = async () => {
        try {
            const adminName = sessionStorage.getItem('name') || 'Admin';
            const { data } = await api.patch(`/tickets/${selectedTicketId}/assignee`, {
                assignedTo: adminName
            });
            toast.success("Assigned to you");
            setTickets(tickets.map(t => t._id === selectedTicketId ? data : t));
        } catch (error) {
            if (error.response?.status === 403) {
                toast.error("Access Denied: You do not have permission to perform this action.");
            } else {
                toast.error("Failed to assign ticket.");
            }
        }
    };

    const handleSaveReply = async () => {
        setIsSaving(true);
        try {
            let latestData = null;
            
            if (workspace.replyDraft && workspace.replyDraft.trim()) {
                const responseRes = await api.post(`/tickets/${selectedTicketId}/responses`, { message: workspace.replyDraft.trim() });
                latestData = responseRes.data;
            }
            
            const putRes = await api.put(`/tickets/${selectedTicketId}`, {
                status: workspace.status,
                priority: workspace.priority,
                category: workspace.category,
                internalNotes: workspace.internalNotes
            });
            latestData = putRes.data;

            toast.success("Ticket updated successfully!");
            // Update the ticket in the list with real DB data
            setTickets(tickets.map(t => t._id === selectedTicketId ? latestData : t));
            
            // Clear the text areas so old values don't linger
            setWorkspace(prev => ({
                ...prev,
                replyDraft: '',
                internalNotes: ''
            }));
        } catch (error) {
            if (error.response?.status === 403) {
                toast.error("Access Denied: You do not have permission to perform this action.");
            } else {
                toast.error("Failed to update ticket.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleReopenTicket = async () => {
        try {
            const { data } = await api.put(`/tickets/${selectedTicketId}`, { status: 'In Progress' });
            setTickets(tickets.map(t => t._id === selectedTicketId ? data : t));
            setWorkspace(prev => ({ 
                ...prev, 
                status: 'In Progress',
                replyDraft: '',
                internalNotes: ''
            }));
            toast.success("Ticket reopened");
        } catch (error) {
            if (error.response?.status === 403) {
                toast.error("Access Denied: You do not have permission to perform this action.");
            } else {
                toast.error("Failed to reopen ticket");
            }
        }
    };

    const handleNextUrgentTicket = () => {
        const openTickets = filteredTickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed');
        if (openTickets.length > 0) {
            handleSelectTicket(openTickets[0]);
        } else {
            toast.success("Queue is empty! Great job.");
        }
    };

    // Filter & Sort Logic
    const filteredTickets = tickets.filter(t => {
        if (filterStatus !== 'All' && t.status !== filterStatus) return false;
        if (filterPriority !== 'All' && t.priority !== filterPriority) return false;
        if (filterCategory !== 'All' && t.category !== filterCategory) return false;
        
        const tDate = new Date(t.createdAt);
        const now = new Date();
        if (dateFilter === 'Today') {
            const todayStr = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toDateString();
            if (tDate.toDateString() !== todayStr) return false;
        }
        return true;
    }).sort((a, b) => {
        if (dateFilter === 'Newest First') {
            return new Date(b.createdAt) - new Date(a.createdAt);
        } else if (dateFilter === 'Oldest First') {
            return new Date(a.createdAt) - new Date(b.createdAt);
        } else {
            // SLA dynamic sorting
            return calculateUrgencyScore(b) - calculateUrgencyScore(a);
        }
    });

    const categories = [
        'All',
        'General Inquiry',
        'Royalty & Payments',
        'ISBN & Metadata Issues',
        'Printing & Quality',
        'Distribution & Availability',
        'Book Status & Production Updates'
    ];

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-pulse flex flex-col items-center text-slate-500">
                <Inbox className="w-12 h-12 mb-4 text-slate-300" />
                <p>Loading Admin Portal...</p>
            </div>
        </div>
    );

    const selectedTicket = tickets.find(t => t._id === selectedTicketId);

    return (
        <div className="h-screen bg-slate-50 flex flex-col overflow-hidden text-slate-800 font-sans">
            {/* Top Bar (Filters) */}
            <header className="bg-white border-b border-slate-200 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 p-2 rounded-lg text-white">
                        <Bot className="w-5 h-5" />
                    </div>
                    <h1 className="text-xl font-bold">Admin Portal</h1>
                    <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-bold ml-2">
                        {filteredTickets.length} Tickets
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center bg-slate-100 rounded-lg px-3 py-1.5 border border-slate-200">
                        <Filter className="w-4 h-4 text-slate-500 mr-2" />
                        <select className="bg-transparent text-sm focus:outline-none" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                            <option value="All">All Status</option>
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>
                    <div className="flex items-center bg-slate-100 rounded-lg px-3 py-1.5 border border-slate-200">
                        <select className="bg-transparent text-sm focus:outline-none" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
                            <option value="All">All Priorities</option>
                            <option value="Critical">Critical</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>
                    <div className="flex items-center bg-slate-100 rounded-lg px-3 py-1.5 border border-slate-200">
                        <select className="bg-transparent text-sm focus:outline-none max-w-[120px]" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                            {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center bg-slate-100 rounded-lg px-3 py-1.5 border border-slate-200">
                        <SortDesc className="w-4 h-4 text-slate-500 mr-2" />
                        <select className="bg-transparent text-sm focus:outline-none" value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
                            <option value="All Dates">All Dates</option>
                            <option value="Today">Today</option>
                            <option value="Newest First">Newest First</option>
                            <option value="Oldest First">Oldest First</option>
                        </select>
                    </div>
                </div>
            </header>

            {/* Main Content: Split Pane */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* Left Pane: Ticket Queue */}
                <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-slate-200 overflow-y-auto flex flex-col relative z-0">
                    {filteredTickets.map(ticket => (
                        <TicketQueueItem
                            key={ticket._id}
                            ticket={ticket}
                            isSelected={selectedTicket?._id === ticket._id}
                            onClick={() => handleSelectTicket(ticket)}
                        />
                    ))}
                    {filteredTickets.length === 0 && (
                        <div className="p-8 text-center text-slate-500">
                            <Inbox className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                            <p>No tickets match your filters.</p>
                        </div>
                    )}
                </div>

                {/* Right Pane: Ticket Workspace */}
                <div className="hidden md:flex flex-col flex-1 bg-slate-50 overflow-y-auto">
                    {selectedTicket && workspace ? (
                        <TicketDetailView
                            selectedTicket={selectedTicket}
                            workspace={workspace}
                            setWorkspace={setWorkspace}
                            isSaving={isSaving}
                            handleAssignToMe={handleAssignToMe}
                            handleSaveReply={handleSaveReply}
                            handleReopenTicket={handleReopenTicket}
                            handleNextUrgentTicket={handleNextUrgentTicket}
                        />
                    ) : (
                        <AdminEmptyState />
                    )}
                </div>
            </div>
        </div>
    );
}
