import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Registration from '../models/registration_model.js'; // ✅ FIXED
import FailedEmail from '../models/failed_email_model.js'; // For tracking failed emails
import { sendConfirmationEmail } from '../utils/sendMail.js';

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

// 📧 GET /api/failed-emails - Fetch all failed emails for admin review
export const getFailedEmails = async (req, res) => {
  try {
    const failedEmails = await FailedEmail
      .find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: failedEmails.length,
      data: failedEmails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching failed emails'
    });
  }
};

// 📧 POST /api/resend-failed-email/:failedEmailId - Resend a specific failed email
export const resendFailedEmail = async (req, res) => {
  try {
    const { failedEmailId } = req.params;

    const failedEmail = await FailedEmail.findById(failedEmailId);
    if (!failedEmail) {
      return res.status(404).json({
        success: false,
        message: 'Failed email record not found'
      });
    }

    // Get user registration data for context
    const registration = await Registration.findById(failedEmail.registrationId);

    // Attempt to resend email
    const result = await sendConfirmationEmail(
      failedEmail.userEmail,
      failedEmail.userName,
      failedEmail.eventName,
      registration || {}
    );

    if (result.success) {
      // Mark as sent
      await FailedEmail.findByIdAndUpdate(
        failedEmailId,
        { status: 'sent', retryCount: failedEmail.retryCount + 1 },
        { new: true }
      );

      res.status(200).json({
        success: true,
        message: 'Email resent successfully'
      });
    } else {
      // Increment retry count
      const updatedRecord = await FailedEmail.findByIdAndUpdate(
        failedEmailId,
        { retryCount: failedEmail.retryCount + 1 },
        { new: true }
      );

      res.status(200).json({
        success: false,
        message: 'Email resend failed, retry count incremented',
        data: updatedRecord
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error resending email'
    });
  }
};

// 📧 POST /api/manual-send-email - Admin manually sends email to user
export const manualSendEmail = async (req, res) => {
  try {
    const { email, name, eventName, failedEmailId, notes } = req.body;

    if (!email || !name || !eventName) {
      return res.status(400).json({
        success: false,
        message: 'Email, name, and event name are required'
      });
    }

    // Send email
    const result = await sendConfirmationEmail(email, name, eventName);

    if (result.success) {
      // Update failed email record if provided
      if (failedEmailId) {
        await FailedEmail.findByIdAndUpdate(
          failedEmailId,
          { status: 'sent', notes: notes || 'Manually sent by admin' }
        );
      }

      res.status(200).json({
        success: true,
        message: 'Email sent successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to send email',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error sending email'
    });
  }
};

// 🗑️ DELETE /api/failed-emails/:failedEmailId - Delete failed email record
export const deleteFailedEmail = async (req, res) => {
  try {
    const { failedEmailId } = req.params;

    await FailedEmail.findByIdAndDelete(failedEmailId);

    res.status(200).json({
      success: true,
      message: 'Failed email record deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting failed email record'
    });
  }
};

// 💰 GET /admin/payment-stats - Get payment statistics grouped by event
export const getPaymentStats = async (req, res) => {
  try {
    // Aggregate registrations by event
    const paymentStats = await Registration.aggregate([
      {
        $group: {
          _id: '$event',
          totalRegistrations: { $sum: 1 },
          totalAmount: { $sum: '$paymentAmount' },
          completedPayments: {
            $sum: {
              $cond: [{ $in: ['$paymentStatus', ['completed', 'success']] }, 1, 0]
            }
          },
          pendingPayments: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0]
            }
          },
          failedPayments: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'failed'] }, 1, 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Calculate totals across all events
    const totals = await Registration.aggregate([
      {
        $group: {
          _id: null,
          totalRegistrations: { $sum: 1 },
          totalAmount: { $sum: '$paymentAmount' },
          completedPayments: {
            $sum: {
              $cond: [{ $in: ['$paymentStatus', ['completed', 'success']] }, 1, 0]
            }
          },
          pendingPayments: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0]
            }
          },
          failedPayments: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'failed'] }, 1, 0]
            }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        byEvent: paymentStats,
        totals: totals[0] || {
          totalRegistrations: 0,
          totalAmount: 0,
          completedPayments: 0,
          pendingPayments: 0,
          failedPayments: 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching payment statistics'
    });
  }
};
