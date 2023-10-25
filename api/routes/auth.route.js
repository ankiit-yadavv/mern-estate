import express from 'express';
import {sigin , signup } from '../controllers/auth.controller.js'

const router = express.Router();

router.post("/signup" , signup)
router.post("/signin" , sigin)

export default router;