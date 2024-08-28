import { Router } from 'express';
import * as contactController from '../controllers/contactcontroller.js';

const router = Router();

router.get('/contact', contactController.forget);
router.post('/contact', contactController.forpost);

export default router;
