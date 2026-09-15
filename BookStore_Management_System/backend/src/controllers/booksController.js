const { db } = require('../config/db');

// Helper: generate next book ID
const generateBookId = async () => {
  const last = await db('books').orderBy('id', 'desc').first();
  if (!last) return 'B001';
  const num = parseInt(last.bookId.replace('B', ''), 10) + 1;
  return `B${String(num).padStart(3, '0')}`;
};

// GET /api/books
const getAllBooks = async (req, res) => {
  const { search } = req.query;
  let query = db('books').orderBy('id', 'asc');
  if (search) {
    const s = `%${search}%`;
    query = query.where(function () {
      this.where('bookId', 'like', s).orWhere('bookName', 'like', s).orWhere('author', 'like', s);
    });
  }
  const books = await query;
  res.json({ success: true, data: books });
};

// GET /api/books/:id
const getBookById = async (req, res) => {
  const book = await db('books').where('id', req.params.id).orWhere('bookId', req.params.id).first();
  if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });
  res.json({ success: true, data: book });
};

// POST /api/books
const createBook = async (req, res) => {
  const { bookName, publishingYear, author, description, totalCount } = req.body;

  if (!bookName || !bookName.trim()) return res.status(400).json({ success: false, message: 'Book name is required.' });
  if (!author || !author.trim()) return res.status(400).json({ success: false, message: 'Author is required.' });
  const yr = parseInt(publishingYear);
  if (!publishingYear || isNaN(yr) || yr < 1000 || yr > 2100) {
    return res.status(400).json({ success: false, message: 'Valid publishing year is required (1000–2100).' });
  }
  const cnt = parseInt(totalCount);
  if (totalCount === undefined || totalCount === null || totalCount === '' || isNaN(cnt) || cnt < 0) {
    return res.status(400).json({ success: false, message: 'Count must be a non-negative integer.' });
  }

  const bookId = await generateBookId();
  await db('books').insert({
    bookId,
    bookName: bookName.trim(),
    publishingYear: yr,
    author: author.trim(),
    description: (description || '').trim(),
    totalCount: cnt,
    availableCount: cnt
  });
  const newBook = await db('books').where('bookId', bookId).first();
  res.status(201).json({ success: true, message: 'Book added successfully.', data: newBook });
};

// PUT /api/books/:id
const updateBook = async (req, res) => {
  const { bookName, publishingYear, author, description, totalCount } = req.body;

  const book = await db('books').where('id', req.params.id).orWhere('bookId', req.params.id).first();
  if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });

  if (!bookName || !bookName.trim()) return res.status(400).json({ success: false, message: 'Book name is required.' });
  if (!author || !author.trim()) return res.status(400).json({ success: false, message: 'Author is required.' });
  const yr = parseInt(publishingYear);
  if (!publishingYear || isNaN(yr) || yr < 1000 || yr > 2100) {
    return res.status(400).json({ success: false, message: 'Valid publishing year is required.' });
  }
  const newCount = parseInt(totalCount);
  if (isNaN(newCount) || newCount < 0) {
    return res.status(400).json({ success: false, message: 'Count must be a non-negative integer.' });
  }

  const issuedCount = book.totalCount - book.availableCount;
  if (newCount < issuedCount) {
    return res.status(400).json({
      success: false,
      message: `Cannot reduce total count below ${issuedCount} — that many copies are currently issued.`
    });
  }

  const newAvailable = book.availableCount + (newCount - book.totalCount);

  await db('books').where('id', book.id).update({
    bookName: bookName.trim(),
    publishingYear: yr,
    author: author.trim(),
    description: (description || '').trim(),
    totalCount: newCount,
    availableCount: newAvailable,
    updatedAt: new Date().toISOString()
  });

  const updated = await db('books').where('id', book.id).first();
  res.json({ success: true, message: 'Book updated successfully.', data: updated });
};

// DELETE /api/books/:id
const deleteBook = async (req, res) => {
  const book = await db('books').where('id', req.params.id).orWhere('bookId', req.params.id).first();
  if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });

  const activeIssues = await db('issue_transactions')
    .where('bookId', book.bookId)
    .where('status', 'issued')
    .count('id as count')
    .first();

  if (activeIssues.count > 0) {
    return res.status(400).json({
      success: false,
      message: `This book cannot be deleted because ${activeIssues.count} copy(ies) are currently issued.`
    });
  }

  await db('books').where('id', book.id).delete();
  res.json({ success: true, message: 'Book deleted successfully.' });
};

module.exports = { getAllBooks, getBookById, createBook, updateBook, deleteBook };
