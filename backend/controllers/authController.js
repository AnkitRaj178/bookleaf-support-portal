const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Author = require('../models/Author');

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Admin bypass
        if (email === 'admin@bookleaf.com' && password === 'admin123') {
            const token = jwt.sign(
                { id: 'admin', role: 'admin', name: 'Admin', email: 'admin@bookleaf.com' },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );
            return res.json({ token, role: 'admin', name: 'Admin', email: 'admin@bookleaf.com' });
        }

        // Author login
        const author = await Author.findOne({ email });
        if (!author) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, author.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: author._id, role: 'author', name: author.name, email: author.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ token, role: 'author', authorId: author._id, name: author.name, email: author.email });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { loginUser };
