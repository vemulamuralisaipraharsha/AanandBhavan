import { Router } from 'express';
import * as agentPropertyController from '../controllers/agentpropertycontroller.js';

const router = Router();

router.get('/agent/agentproperty', agentPropertyController.forget);
router.post('/agent/agentproperty', agentPropertyController.forpost);
router.post('/agent/agentproperty/popup', agentPropertyController.forpopup);

export default router;
