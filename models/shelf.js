const monogoose = require("mongoose");

const Shelf = monogoose.model("Shelves", new monogoose.Schema({
    book: {
        type: monogoose.Schema.Types.ObjectId,
        ref: 'Book'
    },
    user: {
        type: monogoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}))

module.exports = Shelf;