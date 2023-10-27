import express from 'express';
import {google, sigin , signOut, signup } from '../controllers/auth.controller.js'

const router = express.Router();

router.post("/signup" , signup);
router.post("/signin" , sigin);
router.post("/google", google);
router.get('/signout', signOut);

export default router;