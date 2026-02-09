import express from 'express';
import { adminLogin, adminDashboard } from '../controllers/admin_controllers.js';
import adminAuth from '../middlewares/adminAuth.js';

const router = express.Router();

// POST /admin/login
router.post('/login', adminLogin);

// GET /admin/dashboard
router.get('/dashboard', adminAuth, adminDashboard);

export default router;
