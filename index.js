const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');

const mongoDB = "mongodb+srv://johnokojere08:johnokojere12395@christech.e12lsfv.mongodb.net/?retryWrites=true&w=majority"
mongoose.set('strictQuery', true);
mongoose.connect(mongoDB);
mongoose.connection.on('error', console.error.bind(console, "MongoDB connection error"))

const db = require('./models/index');
const { query } = require('express');
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser")
const { createTokens, validateToken, isLogin } = require("./JWT");
const { shelf } = require('./models/index');

const Book = db.book
const User = db.user
const Shelf = db.shelf
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser())

app.use(express.static('views'));
app.set('view engine', 'ejs');


// Home
app.get('/', (req, res) => {
    if (!isLogin(req)) {
        user = {
            'authenticated': isLogin(req),
        }
    } else {
        user = {
            'authenticated': isLogin(req),
            'user': req.user
        }
    }
    res.render('index', user);
})

app.post('/add-book/Your-Shelf/:id', validateToken, async(req, res) => {
    const user = req.user;
    const book = await Book.findById(req.params.id);

    var shelf = new Shelf();
    var id = user.id
    try {
        shelf.book = book.id;
        shelf.user = user.id;
        shelf.save();
        res.redirect('/profile')
    } catch (err) {
        console.log(err)
        res.redirect('/shelf')
    }
})


// Authentication
app.get('/login', (req, res) => {
    if (!isLogin(req)) {
        user = {
            'authenticated': isLogin(req),
        }
    } else {
        user = {
            'authenticated': isLogin(req),
            'user': req.user
        }
    }
    res.render('auth/login', user)
})

app.get('/register', (req, res) => {
    if (!isLogin(req)) {
        user = {
            'authenticated': isLogin(req),
        }
    } else {
        user = {
            'authenticated': isLogin(req),
            'user': req.user
        }
    }
    res.render('auth/register', user)
})

app.post("/register", (req, res) => {
    const { username, email, password } = req.body;
    bcrypt.hash(password, 10, (err, hash) => {
        const user = new User({
            username: username,
            email: email,
            password: hash,
        });
        user.save((err) => {

            res.json(err);
        })
        const accessToken = createTokens(user);
        res.cookie("access-token", accessToken, {
            maxAge: 2592000,
            httpOnly: true,
        });
        res.redirect('/profile');
    });
});

app.post("/login", (req, res) => {
    const { id, password } = req.body;
    try {
        User.findById(id, (err, user) => {
            bcrypt.compare(password, user.password, (err, match) => {
                if (!match) {
                    res.status(400).json({
                        error: `Wrong Password and ID Combination`
                    })
                } else {
                    const accessToken = createTokens(user);
                    res.cookie("access-token", accessToken, {
                        maxAge: 2592000,
                        httpOnly: true,
                    });
                    console.log({
                        message: `Logged In as ${user.username}`
                    })
                    res.redirect('/profile');
                }
            })
        })
    } catch (err) {
        res.redirect('/login');
    }
})

// app.get("/logout", )

app.get("/profile", validateToken, async(req, res) => {
    const { page = 1, limit = 5 } = req.query;
    const book = await Book.find().limit(limit * 1).skip((page - 1) * limit);
    if (!isLogin(req)) {
        user = {
            'authenticated': isLogin(req),
        }
    } else {
        user = {
            'authenticated': isLogin(req),
            'user': req.user,
            'books': book

        }
    }
    console.log(user);
    res.render('auth/profile', user)
});


// BOOK
app.get('/shelfs', async(req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const findname = req.query.search;

        const searchQuery = {
            $or: [
                { isbn: { $regex: '.*' + findname + '.*' } },
                {
                    title: { $regex: '.*' + findname + '.*' }
                }
            ]
        }

        const book = await Book.find(searchQuery).limit(limit * 1).skip((page - 1) * limit);
        if (!isLogin(req)) {
            user = {
                'books': book,
                'query': findname,
                'all_books': await Book.find(searchQuery),
                'page': parseInt(page),

                'authenticated': isLogin(req),
            }
        } else {
            user = {
                'books': book,
                'query': findname,
                'all_books': await Book.find(searchQuery),
                'page': parseInt(page),
                'authenticated': isLogin(req),
                'user': req.user
            }
        }
        res.render('shelf', user)
    } catch (error) {
        res.json({ message: error });
    }
})

app.get('/shelf', async(req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const book = await Book.find().limit(limit * 1).skip((page - 1) * limit);
    if (!isLogin(req)) {
        user = {
            'books': book,
            'query': null,
            'all_books': await Book.find(),
            'page': parseInt(page),

            'authenticated': isLogin(req),
        }
    } else {
        user = {
            'books': book,
            'query': null,
            'all_books': await Book.find(),
            'page': parseInt(page),
            'authenticated': isLogin(req),
            'user': req.user
        }
    }
    res.render('shelf', user)
})

app.get('/Add-Book', (req, res) => {
    if (!isLogin(req)) {
        user = {
            'authenticated': isLogin(req),
        }
    } else {
        user = {
            'authenticated': isLogin(req),
            'user': req.user
        }
    }
    res.render('add', user)
})

app.get('/Book/:id', async(req, res) => {
    const book = await Book.findById(req.params.id)
    if (!isLogin(req)) {
        user = {
            'book': book,
            'authenticated': isLogin(req),
        }
    } else {
        user = {
            'book': book,
            'authenticated': isLogin(req),
            'user': req.user
        }
    }
    res.render('book', user)
})


// APIs
app.get('/api/', (req, res) => {
    Book.find((err, books) => {
        res.json(books)
    })

})

app.get('/api/books/:id', (req, res) => {
    Book.find(req.param.id, (err, book) => {
        res.json(book)
    })
})

app.post("/api/books", (req, res) => {
    const books = new Book({
        name: req.body.name,
        author: req.body.author,
        pages: req.body.pages
    })
    books.save((err) => {
        console.log(err)
    })
    res.json(books)
})

app.use('/api/books/', (req, res, next) => {
    const filters = req.query;
    const filteredUsers = data.filter(user => {
        let isValid = true;
        for (key in filters) {
            console.log(key, user[key], filters[key]);
            isValid = isValid && user[key] == filters[key];
        }
        return isValid;
    });
    res.send(filteredUsers);
});

app.put("/api/books/:id", (req, res) => {
    Book.findByIdAndUpdate(req.params.id, req.body, (err) => {
        res.json({ message: `updating dog ${req.params.id}` })
    })
})

app.delete("/api/books/:id", (req, res) => {
    Book.findByIdAndDelete(req.params.id, (err) => {
        res.json({ message: `deleting dog ${req.params.id}` })
    })
})

app.listen(3000, () => {
    console.log("server is running on port 3000")
})