const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
    author_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    city: { type: String },
    joined_date: { type: Date }
}, {
    timestamps: true
});

module.exports = mongoose.model('Author', authorSchema);
