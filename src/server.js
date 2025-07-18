const app = require("./app");
const pool = require("./config/db");

const PORT = process.env.PORT || 3000;

const initializeDatabase = async () => {
  try {
    const tablesExist = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name IN ('users', 'chatrooms', 'messages')
      );
    `);

    if (!tablesExist.rows[0].exists) {
      await pool.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          mobile VARCHAR(15) UNIQUE NOT NULL,
          name VARCHAR(100),
          password VARCHAR(100),
          otp VARCHAR(6),
          subscription_tier VARCHAR(10) DEFAULT 'basic',
          message_count INTEGER DEFAULT 0,
          last_message_date DATE
        );

        CREATE TABLE chatrooms (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          user_id INTEGER REFERENCES users(id)
        );

        CREATE TABLE messages (
          id SERIAL PRIMARY KEY,
          chatroom_id INTEGER REFERENCES chatrooms(id),
          user_id INTEGER REFERENCES users(id),
          content TEXT NOT NULL,
          is_user BOOLEAN NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("Database tables created");
    } else {
      console.log("Database tables already exist");
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database initialization error:", error);
    process.exit(1);
  }
};

initializeDatabase();
