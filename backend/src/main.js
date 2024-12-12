const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors'); // Import the cors package

const app = express();
const PORT = 8080;
const DB_PATH = 'database.db';

// Enable CORS for all routes
app.use(cors());
// 데이터베이스 연결
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error('Error opening database:', err.message);
  else console.log('Connected to SQLite database.');
});

// 미들웨어 설정
app.use(bodyParser.json());

// 테이블 생성 함수
const createTables = () => {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      id TEXT UNIQUE NOT NULL, -- 유저 고유 id 추가
      password TEXT NOT NULL,
      krw_balance REAL DEFAULT 1000000.0,
      btc_balance REAL DEFAULT 0.0,
      bio TEXT DEFAULT ''
    );
  `;
  const createTransactionsTable = `
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('buy', 'sell')), -- 거래 타입 (buy/sell)
      krw_amount REAL NOT NULL, -- 거래된 KRW 금액
      btc_amount REAL NOT NULL, -- 거래된 BTC 양
      price REAL NOT NULL, -- 거래 당시 1 BTC의 가격
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );
  `;
  db.run(createUsersTable);
  db.run(createTransactionsTable);
};

createTables();

// 회원가입 API
app.post('/register', (req, res) => {
  const { id, password, bio } = req.body;
  const sql = `INSERT INTO users (id, password, bio) VALUES (?, ?, ?)`;
  db.run(sql, [id, password, bio || ''], function (err) {
    if (err) {
      res.status(400).json({ error: 'ID already exists or invalid data.' });
    } else {
      res.status(201).json({ message: 'User registered successfully!', userId: this.lastID });
    }
  });
});

// 로그인 API
app.post('/login', (req, res) => {
  const { id, password } = req.body;
  const sql = `SELECT * FROM users WHERE id = ? AND password = ?`;
  db.get(sql, [id, password], (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Internal server error.' });
    } else if (row) {
      res.status(200).json({ message: 'Login successful!', user: row });
    } else {
      res.status(400).json({ error: 'Invalid ID or password.' });
    }
  });
});

// 유저 정보 가져오기 API (id 기반, user_id 포함)
app.get('/user/:id', (req, res) => {
  const { id } = req.params; // TEXT 기반 id
  const sql = `SELECT user_id, id, krw_balance, btc_balance, bio FROM users WHERE id = ?`;
  db.get(sql, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Internal server error.' });
    } else if (row) {
      res.status(200).json({ user: row });
    } else {
      res.status(404).json({ error: 'User not found.' });
    }
  });
});

// 전체 유저 정보 가져오기 API (id, user_id 포함)
app.get('/users', (req, res) => {
  const sql = `SELECT user_id, id, krw_balance, btc_balance, bio FROM users`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Internal server error.' });
    } else {
      res.status(200).json({ users: rows });
    }
  });
});

// 구매/판매 API
app.post('/trade', async (req, res) => {
  const { userId, type, amount } = req.body; // amount는 KRW 단위
  const TRADE_FEE_RATE = 0.001; // 0.1% 거래 수수료
  if (!['buy', 'sell'].includes(type)) {
    return res.status(400).json({ error: 'Invalid trade type. Use "buy" or "sell".' });
  }

  try {
    // Upbit API에서 현재 BTC 가격 가져오기
    const response = await axios.get('https://api.upbit.com/v1/ticker', {
      params: { markets: 'KRW-BTC' }
    });
    const btcPrice = response.data[0].trade_price;

    // 유저 정보 가져오기
    db.get(`SELECT krw_balance, btc_balance FROM users WHERE id = ?`, [userId], (err, user) => {
      if (err) return res.status(500).json({ error: 'Internal server error.' });
      if (!user) return res.status(404).json({ error: 'User not found.' });

      let krwBalance = user.krw_balance;
      let btcBalance = user.btc_balance;

      // 거래 로직
      let krwAmount = 0;
      let btcAmount = 0;

      if (type === 'buy') {
        btcAmount = amount / btcPrice; // KRW -> BTC 변환
        krwAmount = amount;
        const fee = krwAmount * TRADE_FEE_RATE;
        if (krwBalance < krwAmount + fee) {
          return res.status(400).json({ error: 'Insufficient KRW balance.' });
        }

        krwBalance -= (krwAmount + fee);
        btcBalance += btcAmount;

      } else if (type === 'sell') {
        btcAmount = amount / btcPrice; // BTC -> KRW 변환
        krwAmount = amount;
        const fee = btcAmount * TRADE_FEE_RATE;

        if (btcBalance < btcAmount + fee) {
          return res.status(400).json({ error: 'Insufficient BTC balance.' });
        }

        btcBalance -= (btcAmount + fee);
        krwBalance += krwAmount;
      }

      // 사용자 잔고 업데이트
      const updateUserSQL = `UPDATE users SET krw_balance = ?, btc_balance = ? WHERE id = ?`;
      db.run(updateUserSQL, [krwBalance, btcBalance, userId], function (err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to update user balance.' });
        }

        // 거래 기록 추가
        const insertTransactionSQL = `
          INSERT INTO transactions (user_id, type, krw_amount, btc_amount, price)
          VALUES (?, ?, ?, ?, ?)
        `;

        db.run(insertTransactionSQL, [userId, type, krwAmount, btcAmount, btcPrice], function (err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to record transaction.' });
          }

          // 성공 응답
          res.status(200).json({
            message: 'Trade successful!',
            updatedBalances: { krwBalance, btcBalance },
            btcPrice,
            transaction: {
              type,
              krwAmount,
              btcAmount,
              price: btcPrice
            }
          });
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch BTC price.' });
  }
});

// 유저 거래 내역 가져오기 API
app.get('/transactions/:userId', (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT id, type, krw_amount, btc_amount, price, timestamp
    FROM transactions
    WHERE user_id = ?
    ORDER BY timestamp DESC
  `;

  db.all(sql, [userId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Failed to fetch transaction history.' });
    } else if (rows.length === 0) {
      res.status(404).json({ error: 'No transactions found for this user.' });
    } else {
      res.status(200).json({ transactions: rows });
    }
  });
});

// 비밀번호 변경 API
app.post('/change-password', (req, res) => {
  const { id, currentPassword, newPassword } = req.body;
  const sql = `SELECT * FROM users WHERE id = ? AND password = ?`;
  db.get(sql, [id, currentPassword], (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Internal server error.' });
    } else if (row) {
      const updateSql = `UPDATE users SET password = ? WHERE id = ?`;
      db.run(updateSql, [newPassword, id], function (err) {
        if (err) {
          res.status(500).json({ error: 'Failed to update password.' });
        } else {
          res.status(200).json({ message: 'Password updated successfully!' });
        }
      });
    } else {
      res.status(400).json({ error: 'Invalid current password.' });
    }
  });
});

// 계정 탈퇴 API
app.post('/withdraw', (req, res) => {
  const { id } = req.body;
  const sql = `DELETE FROM users WHERE id = ?`;
  db.run(sql, [id], function (err) {
    if (err) {
      res.status(500).json({ error: 'Failed to delete account.' });
    } else {
      res.status(200).json({ message: 'Account deleted successfully!' });
    }
  });
});

// 상태 메시지 업데이트 API
app.post('/update-status', (req, res) => {
  const { id, bio } = req.body;
  const sql = `UPDATE users SET bio = ? WHERE id = ?`;
  db.run(sql, [bio, id], function (err) {
    if (err) {
      res.status(500).json({ error: 'Failed to update status message.' });
    } else {
      res.status(200).json({ message: 'Status message updated successfully!' });
    }
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});