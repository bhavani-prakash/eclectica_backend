import express from 'express';
import { 
  adminLogin, 
  adminDashboard,
  getFailedEmails,
  resendFailedEmail,
  manualSendEmail,
  deleteFailedEmail,
  getPaymentStats
} from '../controllers/admin_controllers.js';
import adminAuth from '../middlewares/adminAuth.js';

const router = express.Router();

// POST /admin/login
router.post('/login', adminLogin);

// GET /admin/dashboard
router.get('/dashboard', adminDashboard);

// 💰 Payment Statistics Route
router.get('/payment-stats', getPaymentStats);

// 📧 Failed Email Management Routes (Protected)
router.get('/failed-emails', adminAuth, getFailedEmails);
router.post('/resend-failed-email/:failedEmailId', adminAuth, resendFailedEmail);
router.post('/manual-send-email', adminAuth, manualSendEmail);
router.delete('/failed-emails/:failedEmailId', adminAuth, deleteFailedEmail);

export default router;
