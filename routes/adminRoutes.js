import express from 'express';
import {
  getAllUsers,
  updateUser,
  addHomeContent,
  getHomeContent,
  deleteHomeContent,
} from '../controllers/adminController.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(verifyAdmin);

router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.post('/home-content', addHomeContent);
router.get('/home-content', getHomeContent);
router.delete('/home-content/:id', deleteHomeContent);

export default router;
