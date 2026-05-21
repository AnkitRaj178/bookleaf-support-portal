const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
    sender: {
        type: String,
        enum: ['Author', 'Admin', 'AI'],
        required: true
    },
    repliedBy: { type: String },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const ticketSchema = new mongoose.Schema({
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    category: {
        type: String,
        enum: [
            'Royalty & Payments',
            'ISBN & Metadata Issues',
            'Printing & Quality',
            'Distribution & Availability',
            'Book Status & Production Updates',
            'General Inquiry',
            'Unclassified'
        ],
        default: 'Unclassified'
    },
    priority: {
        type: String,
        enum: ['Critical', 'High', 'Medium', 'Low', 'Unassigned'],
        default: 'Unassigned'
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
        default: 'Open'
    },
    responses: [responseSchema],
    adminNotes: { type: String },
    assignedTo: { type: String },
    aiDraftResponse: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('Ticket', ticketSchema);
