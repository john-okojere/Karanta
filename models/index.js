const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const db = {}

db.mongoose = mongoose;

db.user = require("./user");
db.role = require("./role");
db.book = require("./book");
db.shelf = require("./shelf");

module.exports = db;