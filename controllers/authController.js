const authModel = require('../models/authModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class authController {
  login = async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await authModel.findOne({ email }).select('+password');

      if (!user) {
        return res.status(404).json({ message: 'invalid email or password' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(404).json({ message: 'invalid email or password' });
      }

      const payload = {
        id: user._id,
        name: user.name,
        category: user.category,
        role: user.role,
      };

      const token = await jwt.sign(payload, process.env.secret, {
        expiresIn: process.env.exp_time,
      });
      return res.status(200).json({ message: 'Login success', token });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  async addWriter(req, res) {
    const { email, name, password, category } = req.body;

    try {
      const existingUser = await authModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exist' });
      }

      const hashedPassword = await bcrypt.hash(password.trim(), 10);

      const new_writer = await authModel.create({
        name: name.trim(),
        email: email.trim(),
        password: hashedPassword,
        category: category.trim(),
        role: 'writer',
      });
      return res
        .status(201)
        .json({ message: 'Writer added successfully', writer: new_writer });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getWriters(req, res) {
    try {
      const writers = await authModel
        .find({ role: 'writer' })
        .sort({ createdAt: -1 });

      return res.status(200).json({ writers });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = new authController();
