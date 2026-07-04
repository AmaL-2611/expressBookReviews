const axios = require('axios');

const BASE = 'http://localhost:3000';

async function getAllBooks() {
  const res = await axios.get(`${BASE}/books`);
  console.log('All books:');
  console.log(JSON.stringify(res.data, null, 2));
}

async function getBooksByISBN(isbn) {
  const res = await axios.get(`${BASE}/books/isbn/${encodeURIComponent(isbn)}`);
  console.log(`Book with ISBN ${isbn}:`);
  console.log(JSON.stringify(res.data, null, 2));
}

async function getBooksByAuthor(author) {
  const res = await axios.get(`${BASE}/books/author/${encodeURIComponent(author)}`);
  console.log(`Books by author matching "${author}":`);
  console.log(JSON.stringify(res.data, null, 2));
}

async function getBooksByTitle(title) {
  const res = await axios.get(`${BASE}/books/title/${encodeURIComponent(title)}`);
  console.log(`Books with title matching "${title}":`);
  console.log(JSON.stringify(res.data, null, 2));
}

// Simple CLI
async function main() {
  const cmd = process.argv[2];
  const arg = process.argv[3];
  try {
    if (!cmd || cmd === 'all') return await getAllBooks();
    if (cmd === 'isbn') return await getBooksByISBN(arg);
    if (cmd === 'author') return await getBooksByAuthor(arg);
    if (cmd === 'title') return await getBooksByTitle(arg);
    console.log('Usage: node general.js [all|isbn <isbn>|author <author>|title <title>]');
  } catch (err) {
    if (err.response) console.error('Error:', err.response.status, err.response.data);
    else console.error(err.message);
  }
}

if (require.main === module) main();

module.exports = { getAllBooks, getBooksByISBN, getBooksByAuthor, getBooksByTitle };
