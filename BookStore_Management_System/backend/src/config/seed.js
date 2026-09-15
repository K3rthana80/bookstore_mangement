require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { db, initDb } = require('./db');

async function seed() {
  await initDb();
  console.log('🌱 Seeding database...');

  // Admin user
  const existingUser = await db('users').where('username', 'admin').first();
  if (!existingUser) {
    const passwordHash = bcrypt.hashSync('admin123', 10);
    await db('users').insert({ username: 'admin', email: 'admin@bookstore.com', passwordHash });
    console.log('✅ Admin user created  →  username: admin  |  password: admin123');
  } else {
    console.log('ℹ️  Admin user already exists — skipping.');
  }

  // Sample books
  const sampleBooks = [
    { bookId: 'B001', bookName: 'Java',   publishingYear: 2020, author: 'James Gosling',    description: 'Core Java Programming',  totalCount: 20, availableCount: 20 },
    { bookId: 'B002', bookName: 'Python', publishingYear: 2021, author: 'Guido van Rossum', description: 'Python Programming',      totalCount: 15, availableCount: 15 },
    { bookId: 'B003', bookName: 'SQL',    publishingYear: 2022, author: 'Edgar Codd',       description: 'Database Management',    totalCount: 10, availableCount: 10 },
    { bookId: 'B004', bookName: 'React',  publishingYear: 2023, author: 'Jordan Walke',     description: 'Frontend Development',   totalCount: 8,  availableCount: 8  },
    { bookId: 'B005', bookName: 'Node.js',publishingYear: 2023, author: 'Ryan Dahl',        description: 'Backend Development',    totalCount: 12, availableCount: 12 },
  ];

  for (const book of sampleBooks) {
    const exists = await db('books').where('bookId', book.bookId).first();
    if (!exists) {
      await db('books').insert(book);
      console.log(`✅ Book added: ${book.bookId} — ${book.bookName}`);
    }
  }

  console.log('\n✅ Database seeding complete!');
  console.log('──────────────────────────────');
  console.log('Default credentials:');
  console.log('  Username : admin');
  console.log('  Password : admin123');
  console.log('──────────────────────────────\n');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
