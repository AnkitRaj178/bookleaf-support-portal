const Ticket = require('../models/Ticket');
const Book = require('../models/Book');
const { analyzeTicket } = require('../services/aiService');

const getTickets = async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            const tickets = await Ticket.find().populate('authorId', 'name email').populate('bookId', 'title isbn');
            return res.json(tickets);
        } else if (req.user.role === 'author') {
            const tickets = await Ticket.find({ authorId: req.user.id }).populate('bookId', 'title isbn');
            return res.json(tickets);
        } else {
            return res.status(403).json({ message: 'Access denied.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getTicketById = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id).populate('authorId', 'name email').populate('bookId', 'title isbn');
        
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        if (req.user.role === 'author' && ticket.authorId._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You do not have access to this ticket.' });
        }

        res.json(ticket);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createTicket = async (req, res) => {
    if (req.user.role === 'admin') {
        return res.status(403).json({ message: 'Admins cannot create tickets via this route.' });
    }

    const { bookId, subject, description } = req.body;
    
    // Explicit Input Validation
    if (!subject || !description) {
        return res.status(400).json({ message: 'Subject and description are required.' });
    }

    try {
        if (bookId) {
            const book = await Book.findOne({ _id: bookId, authorId: req.user.id });
            if (!book) {
                return res.status(403).json({ message: 'Invalid book reference or unauthorized access.' });
            }
        }

        let category = 'General Inquiry';
        let priority = 'Unassigned';
        let responses = [];

        let aiDraftResponse = '';

        const newTicket = new Ticket({
            authorId: req.user.id,
            bookId,
            subject,
            description,
            category,
            priority,
            responses,
            aiDraftResponse
        });

        const savedTicket = await newTicket.save();
        res.status(201).json(savedTicket);

        // Asynchronous AI Processing (Fire-and-Forget)
        // aiService.analyzeTicket is guaranteed to return a valid object — it handles its own errors internally.
        (async () => {
            const aiResult = await analyzeTicket(subject, description);
            const updates = {};
            if (aiResult.category) updates.category = aiResult.category;
            if (aiResult.priority) updates.priority = aiResult.priority;
            if (aiResult.draftResponse) updates.aiDraftResponse = aiResult.draftResponse;
            await Ticket.findByIdAndUpdate(savedTicket._id, updates);
        })();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const addResponse = async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ message: 'Message content is required.' });
        }

        const ticket = await Ticket.findById(req.params.id);
        
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        if (req.user.role === 'author' && ticket.authorId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You do not have access to this ticket.' });
        }

        if (ticket.status === 'Closed') {
            return res.status(400).json({ message: 'Cannot reply to a closed ticket.' });
        }

        const sender = req.user.role === 'admin' ? 'Admin' : 'Author';
        const repliedBy = req.user.name || (req.user.role === 'admin' ? 'Admin' : 'Author');

        ticket.responses.push({
            sender,
            repliedBy,
            message,
            timestamp: new Date(),
            createdAt: new Date()
        });

        // Clear AI draft if admin replies
        if (req.user.role === 'admin') {
            ticket.aiDraftResponse = '';
            // Automatically mark open if it was somehow in another state, or keep in progress
            if (ticket.status === 'Open') ticket.status = 'In Progress';
        }

        const updatedTicket = await ticket.save();
        const populatedTicket = await Ticket.findById(updatedTicket._id).populate('authorId', 'name email').populate('bookId', 'title isbn');
        res.json(populatedTicket);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateTicket = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can update ticket fields.' });
    }
    
    try {
        const { status, priority, category, internalNotes } = req.body;
        
        if (!status && !priority && !category && internalNotes === undefined) {
            return res.status(400).json({ message: 'No valid fields provided for update.' });
        }
        
        const ticket = await Ticket.findById(req.params.id);
        
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        if (status) ticket.status = status;
        if (priority) ticket.priority = priority;
        if (category) ticket.category = category;
        if (internalNotes !== undefined) ticket.adminNotes = internalNotes;
        
        const updatedTicket = await ticket.save();
        const populatedTicket = await Ticket.findById(updatedTicket._id).populate('authorId', 'name email').populate('bookId', 'title isbn');
        res.json(populatedTicket);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const assignTicket = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can assign tickets.' });
    }

    try {
        const adminName = req.body.assignedTo || req.user.name || 'Admin';
        
        if (!req.body.assignedTo) {
             return res.status(400).json({ message: 'assignedTo is required.' });
        }
        
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        ticket.assignedTo = adminName;
        
        const updatedTicket = await ticket.save();
        const populatedTicket = await Ticket.findById(updatedTicket._id).populate('authorId', 'name email').populate('bookId', 'title isbn');
        res.json(populatedTicket);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getTickets,
    getTicketById,
    createTicket,
    addResponse,
    updateTicket,
    assignTicket
};
