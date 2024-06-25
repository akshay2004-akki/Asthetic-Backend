import express from 'express';
import {
    manageUsers,
    manageRoles,
    viewStaffRecords,
    systemSettings
} from '../controllers/admin.controller.js';
import { verifyAdmin } from '../middlewares/admin.middleware.js'; // assuming you have a middleware to verify admin

const router = express.Router();

router.post('/manage-users', verifyAdmin, manageUsers); // Manage users (create, update, delete)
router.post('/manage-roles', verifyAdmin, manageRoles); // Manage roles
router.get('/view-staff-records', verifyAdmin, viewStaffRecords); // View all staff records
router.post('/system-settings', verifyAdmin, systemSettings); // Manage system settings

export default router;
