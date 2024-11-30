const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('database.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');

    // ALTER TABLE 명령 실행
    db.serialize(() => {
      db.run(`DROP TABLE transactions;`, (err) => {
        if (err) {
          console.error("Error adding 'krw_amount' column:", err.message);
        } else {
          console.log("'krw_amount' column added successfully.");
        }
      });

    });

    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
    });
  }
});
