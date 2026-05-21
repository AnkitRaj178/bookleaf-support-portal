import React from 'react';
import { User, Clock } from 'lucide-react';

const dotColors = {
    'Critical': 'bg-red-500',
    'High': 'bg-orange-500',
    'Medium': 'bg-amber-500',
    'Low': 'bg-slate-400',
    'Unassigned': 'bg-slate-400'
};

export default function TicketQueueItem({ ticket, isSelected, onClick }) {
    const dotColor = dotColors[ticket.priority] || 'bg-slate-400';
    const createdAtDate = new Date(ticket.createdAt);
    const hoursElapsed = (Date.now() - createdAtDate.getTime()) / (1000 * 60 * 60);
    const isUnresolved = ticket.status === 'Open' || ticket.status === 'In Progress';
    const isOverdue = isUnresolved && hoursElapsed > 24;

    let ageBadgeText = '';
    if (isOverdue) {
        const daysElapsed = Math.floor(hoursElapsed / 24);
        ageBadgeText = daysElapsed > 0
            ? `Waiting: ${daysElapsed} ${daysElapsed === 1 ? 'Day' : 'Days'}`
            : `Overdue: ${Math.floor(hoursElapsed)} hours`;
    }

    return (
        <div
            onClick={onClick}
            className={`px-4 py-3 border-b border-slate-100 cursor-pointer transition-colors duration-150 ${isSelected ? 'bg-slate-50/80 shadow-[inset_3px_0_0_0_#4f46e5]' : 'bg-white hover:bg-slate-50'}`}
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
                    <span className="text-[10px] tracking-wider font-bold text-slate-500 uppercase">{(ticket.priority || 'Unassigned').toUpperCase()}</span>
                </div>
                <span className="text-xs font-medium text-slate-500 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {createdAtDate.toLocaleDateString()}
                </span>
            </div>
            <h3 className="font-semibold text-slate-800 text-sm truncate mb-2">
                {ticket.subject}
            </h3>
            {isOverdue && (
                <div className="mb-2">
                    <span className="text-xs text-slate-400">{ageBadgeText}</span>
                </div>
            )}
            <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center text-xs font-medium text-slate-500 truncate max-w-[70%]">
                    <User className="w-3 h-3 mr-1 shrink-0" />
                    <span className="truncate">
                        {ticket.assignedTo ? `Assigned: ${ticket.assignedTo}` : (ticket.authorId?.email || ticket.authorId?.name || 'Author')}
                    </span>
                </div>
                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs">
                    {ticket.status || 'Open'}
                </span>
            </div>
        </div>
    );
}
