const { db } = require('../config/db');

const getStats = async (req, res) => {
  const totalBooks = (await db('books').count('id as count').first()).count;
  const totalAvailableRow = await db('books').sum('availableCount as total').first();
  const totalAvailable = totalAvailableRow.total || 0;
  const currentlyIssued = (await db('issue_transactions').where('status', 'issued').count('id as count').first()).count;
  const totalReturned = (await db('issue_transactions').where('status', 'returned').count('id as count').first()).count;
  const totalCopiesRow = await db('books').sum('totalCount as total').first();
  const totalCopies = totalCopiesRow.total || 0;

  res.json({
    success: true,
    data: { totalBooks, totalAvailable, currentlyIssued, totalReturned, totalCopies }
  });
};

module.exports = { getStats };
