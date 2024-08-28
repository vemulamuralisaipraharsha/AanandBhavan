import { Router } from 'express';
import mainController from '../controllers/maincontroller.js';

const router = Router();

router.get('/', mainController);

export default router;
