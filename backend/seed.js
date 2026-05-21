const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import Models
const Author = require('./models/Author');
const Book = require('./models/Book');
const Ticket = require('./models/Ticket');

// Read the JSON file located in the parent directory
const dataPath = path.join(__dirname, '../bookleaf_sample_data.json');
const sampleData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const seedDatabase = async () => {
    try {
        // 1. Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for database seeding...');

        // 2. Clear existing collections
        await Author.deleteMany();
        await Book.deleteMany();
        await Ticket.deleteMany();
        console.log('Cleared existing Author, Book, and Ticket data...');

        // 3. Generate a common hashed password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // 4. Loop through authors and populate
        for (const authorData of sampleData.authors) {
            const newAuthor = await Author.create({
                author_id: authorData.author_id,
                name: authorData.name,
                email: authorData.email,
                password: hashedPassword,
                phone: authorData.phone,
                city: authorData.city,
                joined_date: authorData.joined_date ? new Date(authorData.joined_date) : null
            });

            console.log(`Created author: ${newAuthor.name}`);

            // 5. Loop through this author's books and link them to the author's _id
            if (authorData.books && authorData.books.length > 0) {
                for (const bookData of authorData.books) {
                    await Book.create({
                        book_id: bookData.book_id,
                        authorId: newAuthor._id, // Linking to the Author ObjectId
                        title: bookData.title,
                        isbn: bookData.isbn,
                        genre: bookData.genre,
                        publication_date: bookData.publication_date ? new Date(bookData.publication_date) : null,
                        status: bookData.status,
                        mrp: bookData.mrp,
                        author_royalty_per_copy: bookData.author_royalty_per_copy,
                        total_copies_sold: bookData.total_copies_sold || 0,
                        total_royalty_earned: bookData.total_royalty_earned || 0,
                        royalty_paid: bookData.royalty_paid || 0,
                        royalty_pending: bookData.royalty_pending || 0,
                        last_royalty_payout_date: bookData.last_royalty_payout_date ? new Date(bookData.last_royalty_payout_date) : null,
                        print_partner: bookData.print_partner,
                        available_on: bookData.available_on || []
                    });
                }
                console.log(` -> Seeded ${authorData.books.length} books for ${newAuthor.name}`);
            }
        }

        // 6. Stop script on success
        console.log('Database seeded successfully!');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
