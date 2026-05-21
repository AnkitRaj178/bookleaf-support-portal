const Book = require('../models/Book');

const getBooks = async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            const books = await Book.find().populate('authorId');
            return res.json(books);
        } else if (req.user.role === 'author') {
            const books = await Book.find({ authorId: req.user.id });
            return res.json(books);
        } else {
            return res.status(403).json({ message: 'Access denied.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate('authorId');
        
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (req.user.role === 'author' && book.authorId._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You do not have access to this book.' });
        }

        res.json(book);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getBooks,
    getBookById
};
