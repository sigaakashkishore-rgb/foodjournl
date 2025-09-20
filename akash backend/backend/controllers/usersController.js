const usersModel = require('../models/usersModel');

const getUsers = async (req, res) => {
  try {
    const users = await usersModel.getUsers();
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const addUser = async (req, res) => {
  try {
    const userData = req.body;
    if (!userData.username || !userData.email) {
      return res.status(400).json({ error: 'Missing username or email in request body' });
    }
    const newUser = await usersModel.addUser(userData);
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getUsers, addUser };
