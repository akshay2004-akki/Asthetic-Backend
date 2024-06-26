import express from 'express';
import {
    addNewAdmin
} from '../controllers/admin.controller.js';
import { verifyAdmin } from '../middlewares/admin.middleware.js'; // assuming you have a middleware to verify admin

const router = express.Router();


export default router;
