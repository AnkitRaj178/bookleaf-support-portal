const express = require('express');
const router = express.Router();
const { getBooks, getBookById } = require('../controllers/bookController');

// GET all books (Admin sees all, Author sees their own)
router.get('/', getBooks);

// GET single book by ID
router.get('/:id', getBookById);

module.exports = router;
