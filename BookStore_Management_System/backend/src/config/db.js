const knex = require('knex');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: path.join(dataDir, 'bookstore.db')
  },
  useNullAsDefault: true,
  pool: {
    afterCreate: (conn, done) => {
      conn.run('PRAGMA foreign_keys = ON', done);
    }
  }
});

const initDb = async () => {
  // Users table
  const hasUsers = await db.schema.hasTable('users');
  if (!hasUsers) {
    await db.schema.createTable('users', (table) => {
      table.increments('id').primary();
      table.string('username').notNullable().unique();
      table.string('email').notNullable().unique();
      table.string('passwordHash').notNullable();
      table.timestamp('createdAt').defaultTo(db.fn.now());
    });
  }

  // Books table
  const hasBooks = await db.schema.hasTable('books');
  if (!hasBooks) {
    await db.schema.createTable('books', (table) => {
      table.increments('id').primary();
      table.string('bookId').notNullable().unique();
      table.string('bookName').notNullable();
      table.integer('publishingYear').notNullable();
      table.string('author').notNullable();
      table.text('description').defaultTo('');
      table.integer('totalCount').notNullable().defaultTo(0);
      table.integer('availableCount').notNullable().defaultTo(0);
      table.timestamp('createdAt').defaultTo(db.fn.now());
      table.timestamp('updatedAt').defaultTo(db.fn.now());
    });
  }

  // Issue transactions table
  const hasIssues = await db.schema.hasTable('issue_transactions');
  if (!hasIssues) {
    await db.schema.createTable('issue_transactions', (table) => {
      table.increments('id').primary();
      table.string('personName').notNullable();
      table.string('phone').notNullable();
      table.string('email').notNullable();
      table.string('bookId').notNullable();
      table.string('issuedDate').notNullable();
      table.string('returnDate').nullable();
      table.integer('numberOfDays').nullable();
      table.float('dailyCharge').defaultTo(3);
      table.float('totalCharge').nullable();
      table.string('paymentStatus').defaultTo('pending');
      table.string('status').defaultTo('issued');
      table.timestamp('createdAt').defaultTo(db.fn.now());
      table.timestamp('updatedAt').defaultTo(db.fn.now());
    });
  }

  console.log('✅ Database initialized.');
};

module.exports = { db, initDb };
