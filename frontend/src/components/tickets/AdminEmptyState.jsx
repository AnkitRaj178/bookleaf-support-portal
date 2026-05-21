import React from 'react';
import { Inbox } from 'lucide-react';

export default function AdminEmptyState() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <Inbox className="w-16 h-16 mb-4 text-slate-300" />
            <h2 className="text-xl font-medium text-slate-500">No Ticket Selected</h2>
            <p className="mt-2 text-sm">Select a ticket from the queue to view details and respond.</p>
        </div>
    );
}
