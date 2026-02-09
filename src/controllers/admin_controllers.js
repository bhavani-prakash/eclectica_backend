import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Registration from '../models/registration_model.js'; // ✅ FIXED

dotenv.config();

// hash admin password once
const hashedAdminPassword = bcrypt.hashSync(
  process.env.ADMIN_PASSWORD,
  10
);

// ✅ Admin Login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email !== process.env.ADMIN_EMAIL) {
      return res.status(401).json({ message: 'Not an admin' });
    }

    const isMatch = await bcrypt.compare(password, hashedAdminPassword);

    if (!isMatch) {
      return res.status(401).json({ message: 'Wrong password' });
    }

    const token = jwt.sign(
      { role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Admin login failed' });
  }
};

// ✅ Admin Dashboard (Fetch registrations)
export const adminDashboard = async (req, res) => {
  try {
    const registrations = await Registration
      .find()
      .sort({ createdAt: -1 }); // latest first

    res.status(200).json({
      success: true,
      data: registrations   // ✅ frontend expects `data`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching registrations'
    });
  }
};
