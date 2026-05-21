const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    book_id: { type: String, required: true, unique: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true },
    title: { type: String, required: true },
    isbn: { type: String },
    genre: { type: String },
    publication_date: { type: Date },
    status: { type: String },
    mrp: { type: Number },
    author_royalty_per_copy: { type: Number },
    total_copies_sold: { type: Number, default: 0 },
    total_royalty_earned: { type: Number, default: 0 },
    royalty_paid: { type: Number, default: 0 },
    royalty_pending: { type: Number, default: 0 },
    last_royalty_payout_date: { type: Date },
    print_partner: { type: String },
    available_on: [{ type: String }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Book', bookSchema);
