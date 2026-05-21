import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Book, Tag, Calendar, BookOpen, Settings } from 'lucide-react';

export default function BooksView() {
    const { books } = useOutletContext();
    
    return (
        <section id="books-section">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Book className="w-6 h-6 text-slate-700" /> My Books
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {books.map(book => {
                    const earned = book.total_royalty_earned || 0;
                    const pending = book.royalty_pending || 0;
                    const paid = earned - pending;
                    
                    return (
                        <div key={book._id} className="group relative bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">{book.title}</h3>
                                    <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                                        <Tag className="w-4 h-4" /> {book.genre || 'Uncategorized'}
                                    </div>
                                </div>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${book.status === 'Published & Live' || book.status === 'Published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' : 'bg-amber-50 text-amber-700 border-amber-200/50'}`}>
                                    {book.status || 'Draft'}
                                </span>
                            </div>
                            
                            {(book.status === 'Published & Live' || book.status === 'Published') ? (
                                <>
                                    <div className="mt-6 bg-slate-50/50 rounded-xl p-5 border border-slate-100 grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                                        <div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">ISBN</span><span className="font-mono tracking-tight font-medium text-slate-800">{book.isbn || 'N/A'}</span></div>
                                        <div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">MRP</span><span className="font-mono tracking-tight font-medium text-slate-800">{book.mrp ? `₹${book.mrp}` : 'N/A'}</span></div>
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Publication Date</span>
                                            <span className="font-medium text-slate-800 flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                {book.publication_date
                                                    ? new Date(book.publication_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                                                    : 'N/A'}
                                            </span>
                                        </div>
                                        <div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Copies Sold</span><span className="font-mono tracking-tight font-medium text-slate-800">{book.total_copies_sold || 0}</span></div>
                                        <div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Royalty Earned</span><span className="font-mono tracking-tight font-medium text-brand-600">₹{earned.toLocaleString()}</span></div>
                                        <div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Paid</span><span className={`font-mono tracking-tight font-medium ${paid > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>₹{paid.toLocaleString()}</span></div>
                                        <div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Pending</span><span className={`font-mono tracking-tight font-medium ${pending > 0 ? 'text-orange-500' : 'text-slate-400'}`}>₹{pending.toLocaleString()}</span></div>
                                    </div>
                                    
                                    <div className="mt-6 pt-6 border-t border-slate-100">
                                        <div className="flex justify-between text-xs mb-2">
                                            <span className="font-medium text-slate-500">Payout Progress</span>
                                            <span className="font-mono text-slate-700">{Math.round((paid / earned) * 100 || 0)}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                                                style={{ width: `${(paid / earned) * 100 || 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="mt-6 bg-slate-50/50 rounded-xl p-8 border border-slate-100 flex flex-col items-center justify-center text-center min-h-[250px]">
                                    <div className="bg-white p-3 rounded-full shadow-sm border border-slate-100 mb-4">
                                        <Settings className="w-6 h-6 text-slate-400 animate-[spin_4s_linear_infinite]" />
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-700 mb-1">Currently in Production</h4>
                                    <p className="text-xs text-slate-500 max-w-[220px] leading-relaxed">Sales and royalty data will populate here once the book is published.</p>
                                </div>
                            )}
                        </div>
                    );
                })}
                {books.length === 0 && (
                    <div className="col-span-full bg-white rounded-xl shadow-sm border border-slate-200 border-dashed p-12 text-center">
                        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-slate-900">No books found</h3>
                        <p className="text-slate-500">You haven't added any books to your portfolio yet.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
