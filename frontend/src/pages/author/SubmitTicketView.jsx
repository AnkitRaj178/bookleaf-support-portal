import React, { useState, useRef } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Send, Paperclip } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function SubmitTicketView() {
    const { books, fetchTickets } = useOutletContext();
    const navigate = useNavigate();
    
    const [newTicket, setNewTicket] = useState({ bookId: 'General', subject: '', description: '' });
    const [submitting, setSubmitting] = useState(false);
    const [attachedFile, setAttachedFile] = useState(null);
    const fileInputRef = useRef(null);

    const submitTicket = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...newTicket,
                bookId: newTicket.bookId === 'General' ? undefined : newTicket.bookId
            };
            await api.post('/tickets', payload);
            setNewTicket({ bookId: 'General', subject: '', description: '' });
            setAttachedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            toast.success('Ticket submitted');
            
            await fetchTickets();
            navigate('/author/tickets');
        } catch (error) {
            toast.error('Failed to submit ticket');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section id="query-section" className="w-full">
            <div className="max-w-2xl mx-auto w-full">
                <h1 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                    <Send className="w-6 h-6 text-slate-700" /> Submit Query
                </h1>
                <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-100">
                    <form className="space-y-5" onSubmit={submitTicket}>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Related Book</label>
                            <select
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors"
                                value={newTicket.bookId}
                                onChange={(e) => setNewTicket({...newTicket, bookId: e.target.value})}
                            >
                                <option value="General">General Query</option>
                                {books.map(b => <option key={b._id} value={b._id}>{b.title}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                            <input
                                type="text" required
                                placeholder="Brief subject line"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors"
                                value={newTicket.subject}
                                onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea
                                required rows="5"
                                placeholder="Detail your issue here..."
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors resize-none"
                                value={newTicket.description}
                                onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                <Paperclip className="w-3.5 h-3.5 inline mr-1 text-slate-500" />
                                Attach a File
                            </label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={(e) => setAttachedFile(e.target.files[0] || null)}
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                            />
                            {attachedFile && (
                                <p className="mt-1.5 text-xs text-indigo-600 font-medium truncate">✓ {attachedFile.name}</p>
                            )}
                        </div>
                        <button
                            type="submit" disabled={submitting}
                            className="w-full bg-indigo-600 text-white rounded-lg py-3 font-semibold hover:bg-indigo-700 transition-colors shadow-md flex justify-center items-center gap-2 disabled:opacity-70"
                        >
                            <Send className="w-4 h-4" />
                            {submitting ? 'Submitting...' : 'Submit Query'}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}
