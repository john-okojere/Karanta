const mongoose = require('mongoose')

const BookSchema = new mongoose.Schema({
    title: String,
    isbn: String,
    pageCount: Number,
    publishedDate: {
        date: String
    },
    thumbnailUrl: String,
    shortDescription: String,
    longDescription: String,
    status: String,
    authors: [],
    categories: []
});

const Book = mongoose.model('Book', BookSchema);

module.exports = Book