const express = require('express');
const router = express.Router();
const {
    getTickets,
    getTicketById,
    createTicket,
    addResponse,
    updateTicket,
    assignTicket
} = require('../controllers/ticketController');

// GET all tickets (Admin sees all, Author sees their own)
router.get('/', getTickets);

// GET single ticket by ID
router.get('/:id', getTicketById);

// POST a new ticket (Author only)
router.post('/', createTicket);

// POST a response to an existing ticket
router.post('/:id/responses', addResponse);

// PUT update a ticket core fields (Admin only)
router.put('/:id', updateTicket);

// PATCH assign a ticket (Admin only)
router.patch('/:id/assignee', assignTicket);

module.exports = router;
