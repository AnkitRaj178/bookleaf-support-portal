import React from 'react';
import {
    Bot, User, Clock, CheckCircle,
    AlertCircle, MessageSquare, UserPlus, Book
} from 'lucide-react';

export default function TicketDetailView({
    selectedTicket,
    workspace,
    setWorkspace,
    isSaving,
    handleAssignToMe,
    handleSaveReply,
    handleReopenTicket,
    handleNextUrgentTicket
}) {
    const categories = [
        'General Inquiry',
        'Royalty & Payments',
        'ISBN & Metadata Issues',
        'Printing & Quality',
        'Distribution & Availability',
        'Book Status & Production Updates'
    ];

    return (
        <div className="p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">

            {/* Workspace Header */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">{selectedTicket.subject}</h2>
                        <div className="flex items-center space-x-4 text-sm text-slate-500 mb-3">
                            <span className="flex items-center"><User className="w-4 h-4 mr-1" /> {selectedTicket.authorId?.name || 'Unknown Author'} ({selectedTicket.authorId?.email || 'No email'})</span>
                            <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {new Date(selectedTicket.createdAt).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="flex items-center bg-slate-100 px-2 py-1 rounded text-xs font-mono">ID: {selectedTicket._id ? selectedTicket._id.substring(selectedTicket._id.length - 6) : 'NEW'}</span>
                        </div>
                        <div>
                            {selectedTicket.bookId ? (
                                <span className="inline-flex items-center space-x-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold border border-indigo-200">
                                    <Book className="w-3.5 h-3.5 mr-1" />
                                    <span>Book: {selectedTicket.bookId.title}</span>
                                </span>
                            ) : (
                                <span className="inline-flex items-center space-x-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold border border-purple-200">
                                    <User className="w-3.5 h-3.5 mr-1" />
                                    <span>General Query</span>
                                </span>
                            )}
                        </div>
                    </div>
                    {selectedTicket.assignedTo ? (
                        <div className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold border border-indigo-100">
                            <CheckCircle className="w-4 h-4" />
                            <span>Assigned to: {selectedTicket.assignedTo}</span>
                        </div>
                    ) : (
                        <button onClick={handleAssignToMe} className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors">
                            <UserPlus className="w-4 h-4" />
                            <span>Assign to Me</span>
                        </button>
                    )}
                </div>

                {/* AI Overrides Area */}
                <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100 bg-slate-50/50 -mx-6 -mb-6 p-4 rounded-b-2xl">
                    <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">CATEGORY</span>
                        <select
                            className="text-sm border border-slate-200 rounded-md px-3 py-1.5 bg-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={workspace.category}
                            onChange={(e) => setWorkspace({ ...workspace, category: e.target.value })}
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</span>
                        <select
                            className="text-sm border border-slate-200 rounded-md px-3 py-1.5 bg-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={workspace.priority}
                            onChange={(e) => setWorkspace({ ...workspace, priority: e.target.value })}
                        >
                            <option value="Critical">Critical</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                            <option value="Unassigned">Unassigned</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Original Query */}
            <div>
                <h3 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Original Query
                </h3>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {selectedTicket.description}
                </div>
            </div>

            {/* Conversation History */}
            {selectedTicket.responses && selectedTicket.responses.filter(r => r.sender !== 'AI').length > 0 && (
                <div className="mb-6">
                    <h3 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-3 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> Conversation History
                    </h3>
                    <div className="space-y-4">
                        {selectedTicket.responses.filter(r => r.sender !== 'AI').map((resp, idx) => (
                            <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs">
                                        <span className="font-semibold text-slate-700">{resp.repliedBy || resp.sender || 'Admin'}</span> <span className="text-slate-500">sent at {new Date(resp.createdAt).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                    </span>
                                </div>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{resp.message}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Past Internal Notes */}
            {selectedTicket.adminNotes && (
                <div className="mb-6">
                    <h3 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> Past Internal Notes
                    </h3>
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-sm">
                        <div className="mb-2">
                            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                                Note logged by {selectedTicket.assignedTo || 'Admin'}
                            </span>
                        </div>
                        <p className="text-sm text-amber-900 whitespace-pre-wrap leading-relaxed">{selectedTicket.adminNotes}</p>
                    </div>
                </div>
            )}

            {/* Smart Workspace States */}
            {selectedTicket.status !== 'Resolved' && selectedTicket.status !== 'Closed' ? (
                <>
                    {/* Internal Notes */}
                    <div className="mb-6">
                        <h3 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-3 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> NOTES (ADMIN ONLY)
                        </h3>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 border-t-4 border-t-amber-400 shadow-sm">
                            <textarea
                                className="w-full bg-transparent text-slate-800 placeholder-slate-400 outline-none resize-y min-h-[100px] text-sm"
                                placeholder="Add notes..."
                                value={workspace.internalNotes}
                                onChange={e => setWorkspace({ ...workspace, internalNotes: e.target.value })}
                            ></textarea>
                        </div>
                    </div>

                    {/* AI Draft & Reply */}
                    <div>
                        <h3 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-3 flex items-center gap-2">
                            <Bot className="w-4 h-4" /> YOUR REPLY
                        </h3>
                        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
                            <textarea
                                className="w-full p-5 text-slate-700 outline-none resize-y min-h-[200px] text-sm leading-relaxed"
                                placeholder="Type your response to the author..."
                                value={workspace.replyDraft}
                                onChange={e => setWorkspace({ ...workspace, replyDraft: e.target.value })}
                            ></textarea>
                            <div className="bg-slate-50 border-t border-slate-100 p-3 flex justify-between items-center rounded-b-lg">
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm font-semibold text-slate-600">Update Status To:</span>
                                    <select
                                        className="text-sm border border-slate-200 rounded-md px-3 py-1.5 bg-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={workspace.status}
                                        onChange={(e) => setWorkspace({ ...workspace, status: e.target.value })}
                                    >
                                        <option value="Open">Open</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Resolved">Resolved</option>
                                        <option value="Closed">Closed</option>
                                    </select>
                                </div>
                                <button
                                    onClick={handleSaveReply}
                                    disabled={isSaving}
                                    className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-md transition-colors disabled:opacity-70"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    <span>{isSaving ? 'Saving...' : 'Send Reply'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-slate-100 p-6 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="text-slate-500">
                        <CheckCircle className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                        <p className="text-sm font-medium">Ticket is marked as {selectedTicket.status}.</p>
                        <p className="text-xs mt-1">Workspace tools are collapsed to prevent accidental edits.</p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={handleReopenTicket}
                            className="px-6 py-2 bg-white text-indigo-600 border border-indigo-200 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors shadow-sm"
                        >
                            Reopen Ticket / Send Follow-up
                        </button>
                        <button
                            onClick={handleNextUrgentTicket}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-md"
                        >
                            Load Next Urgent Ticket
                        </button>
                    </div>
                </div>
            )}

            <div className="h-8"></div> {/* Bottom spacer */}
        </div>
    );
}
