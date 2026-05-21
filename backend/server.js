const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

const { verifyToken } = require('./middleware/auth');

app.use('/api/auth', authRoutes);
app.use('/api/books', verifyToken, bookRoutes);
app.use('/api/tickets', verifyToken, ticketRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.send('Author Support & Communication Portal API is running...');
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Successfully connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
