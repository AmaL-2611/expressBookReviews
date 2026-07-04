const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.json());

const booksPath = path.join(__dirname, 'data', 'books.json');
let books = JSON.parse(fs.readFileSync(booksPath, 'utf8'));

// In-memory users and tokens
const users = {}; // username -> { password }
const tokens = {}; // token -> username

function saveBooks() {
  fs.writeFileSync(booksPath, JSON.stringify(books, null, 2));
}

// Public endpoints
app.get('/books', (req, res) => {
  res.json(books);
});

app.get('/books/isbn/:isbn', (req, res) => {
  const { isbn } = req.params;
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json(book);
});

app.get('/books/author/:author', (req, res) => {
  const author = req.params.author.toLowerCase();
  const found = Object.values(books).filter(b => b.author.toLowerCase().includes(author));
  res.json(found);
});

app.get('/books/title/:title', (req, res) => {
  const title = req.params.title.toLowerCase();
  const found = Object.values(books).filter(b => b.title.toLowerCase().includes(title));
  res.json(found);
});

app.get('/books/:isbn/review', (req, res) => {
  const { isbn } = req.params;
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json(book.reviews || {});
});

// Registration
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'username and password required' });
  if (users[username]) return res.status(409).json({ message: 'User already exists' });
  users[username] = { password };
  res.json({ message: 'User registered successfully' });
});

// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'username and password required' });
  const user = users[username];
  if (!user || user.password !== password) return res.status(401).json({ message: 'Invalid credentials' });
  const token = uuidv4();
  tokens[token] = username;
  res.json({ message: 'Login successful', token });
});

// Auth middleware
function auth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Missing Authorization header' });
  const parts = authHeader.split(' ');
  const token = parts.length === 2 ? parts[1] : parts[0];
  const user = tokens[token];
  if (!user) return res.status(401).json({ message: 'Invalid token' });
  req.user = user;
  next();
}

// Add or modify a review
app.put('/auth/review/:isbn', auth, (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  if (!review) return res.status(400).json({ message: 'review text required' });
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  book.reviews = book.reviews || {};
  book.reviews[req.user] = review;
  saveBooks();
  res.json({ message: 'Review added/modified', reviews: book.reviews });
});

// Delete review
app.delete('/auth/review/:isbn', auth, (req, res) => {
  const { isbn } = req.params;
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  if (book.reviews && book.reviews[req.user]) {
    delete book.reviews[req.user];
    saveBooks();
    return res.json({ message: 'Review deleted' });
  }
  res.status(404).json({ message: 'No review by this user' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
