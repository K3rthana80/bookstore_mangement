const { db } = require('../config/db');

const DAILY_CHARGE = 3; // ₹3 per day

// Inclusive day calculation: (returnDate - issuedDate) + 1
const calculateDays = (issuedDate, returnDate) => {
  const issued = new Date(issuedDate);
  const returned = new Date(returnDate);
  const diffMs = returned - issued;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

// POST /api/issues — Issue a book
const issueBook = async (req, res) => {
  const { personName, phone, email, bookId, issuedDate } = req.body;

  if (!personName || !personName.trim()) return res.status(400).json({ success: false, message: 'Person name is required.' });
  if (!phone || !phone.trim()) return res.status(400).json({ success: false, message: 'Phone number is required.' });
  if (!email || !email.trim()) return res.status(400).json({ success: false, message: 'Email is required.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, message: 'Invalid email format.' });
  if (!bookId) return res.status(400).json({ success: false, message: 'Book selection is required.' });
  if (!issuedDate) return res.status(400).json({ success: false, message: 'Issued date is required.' });

  // Use transaction for atomicity
  await db.transaction(async (trx) => {
    const book = await trx('books').where('bookId', bookId).first();
    if (!book) return res.status(404).json({ success: false, message: 'Book not found.' });
    if (book.availableCount <= 0) {
      return res.status(400).json({ success: false, message: 'This book is currently unavailable. No copies left to issue.' });
    }

    // Decrease available count
    await trx('books').where('bookId', bookId).update({
      availableCount: book.availableCount - 1,
      updatedAt: new Date().toISOString()
    });

    // Create issue record
    const [id] = await trx('issue_transactions').insert({
      personName: personName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      bookId,
      issuedDate,
      dailyCharge: DAILY_CHARGE,
      paymentStatus: 'pending',
      status: 'issued'
    });

    const transaction = await trx('issue_transactions as it')
      .join('books as b', 'it.bookId', 'b.bookId')
      .where('it.id', id)
      .select('it.*', 'b.bookName', 'b.author')
      .first();

    res.status(201).json({ success: true, message: 'Book issued successfully.', data: transaction });
  });
};

// GET /api/issues
const getAllIssues = async (req, res) => {
  const { status } = req.query;
  let query = db('issue_transactions as it')
    .join('books as b', 'it.bookId', 'b.bookId')
    .select('it.*', 'b.bookName', 'b.author')
    .orderBy('it.id', 'desc');

  if (status && status !== 'all') {
    query = query.where('it.status', status);
  }

  const issues = await query;
  res.json({ success: true, data: issues });
};

// GET /api/issues/:id
const getIssueById = async (req, res) => {
  const issue = await db('issue_transactions as it')
    .join('books as b', 'it.bookId', 'b.bookId')
    .where('it.id', req.params.id)
    .select('it.*', 'b.bookName', 'b.author')
    .first();

  if (!issue) return res.status(404).json({ success: false, message: 'Issue transaction not found.' });
  res.json({ success: true, data: issue });
};

// POST /api/issues/:id/calculate — Preview charge without committing
const calculateCharge = async (req, res) => {
  const { returnDate } = req.body;
  if (!returnDate) return res.status(400).json({ success: false, message: 'Return date is required.' });

  const issue = await db('issue_transactions').where('id', req.params.id).first();
  if (!issue) return res.status(404).json({ success: false, message: 'Issue transaction not found.' });
  if (issue.status === 'returned') return res.status(400).json({ success: false, message: 'This book has already been returned.' });

  const issued = new Date(issue.issuedDate);
  const returned = new Date(returnDate);
  if (returned < issued) return res.status(400).json({ success: false, message: 'Return date cannot be earlier than the issued date.' });

  const numberOfDays = calculateDays(issue.issuedDate, returnDate);
  const totalCharge = numberOfDays * DAILY_CHARGE;

  res.json({ success: true, data: { numberOfDays, dailyCharge: DAILY_CHARGE, totalCharge, issuedDate: issue.issuedDate, returnDate } });
};

// POST /api/issues/:id/return — Return book and mark payment paid
const returnBook = async (req, res) => {
  const { returnDate } = req.body;
  if (!returnDate) return res.status(400).json({ success: false, message: 'Return date is required.' });

  await db.transaction(async (trx) => {
    const issue = await trx('issue_transactions as it')
      .join('books as b', 'it.bookId', 'b.bookId')
      .where('it.id', req.params.id)
      .select('it.*', 'b.bookName')
      .first();

    if (!issue) return res.status(404).json({ success: false, message: 'Issue transaction not found.' });
    if (issue.status === 'returned') return res.status(400).json({ success: false, message: 'This book has already been returned.' });

    const issued = new Date(issue.issuedDate);
    const returned = new Date(returnDate);
    if (returned < issued) return res.status(400).json({ success: false, message: 'Return date cannot be earlier than the issued date.' });

    const numberOfDays = calculateDays(issue.issuedDate, returnDate);
    const totalCharge = numberOfDays * DAILY_CHARGE;

    await trx('issue_transactions').where('id', issue.id).update({
      returnDate,
      numberOfDays,
      totalCharge,
      paymentStatus: 'paid',
      status: 'returned',
      updatedAt: new Date().toISOString()
    });

    await trx('books').where('bookId', issue.bookId).increment('availableCount', 1);
    await trx('books').where('bookId', issue.bookId).update({ updatedAt: new Date().toISOString() });

    const updated = await trx('issue_transactions as it')
      .join('books as b', 'it.bookId', 'b.bookId')
      .where('it.id', issue.id)
      .select('it.*', 'b.bookName', 'b.author')
      .first();

    res.json({ success: true, message: 'Book returned successfully and payment submitted.', data: updated });
  });
};

module.exports = { issueBook, getAllIssues, getIssueById, returnBook, calculateCharge };
