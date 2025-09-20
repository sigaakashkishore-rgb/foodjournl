const pool = require('../config/db');

const getUsers = async () => {
  const query = 'SELECT * FROM users ORDER BY id';
  const result = await pool.query(query);
  return result.rows;
};

const addUser = async (userData) => {
  const { username, email } = userData;
  const query = 'INSERT INTO users (username, email) VALUES ($1, $2) RETURNING *';
  const result = await pool.query(query, [username, email]);
  return result.rows[0];
};

module.exports = { getUsers, addUser };
