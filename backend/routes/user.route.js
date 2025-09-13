import express from 'express';
import { protectRoute } from '../middlewares/user.middleware.js';
import { login, logout, register , checarAutenticado} from '../controllers/user.controller.js';
const router = express.Router();
router.post("/login", login);
router.post("/logout", logout);
router.post("/register", register);
router.get("/check", protectRoute, checarAutenticado);
export default router;