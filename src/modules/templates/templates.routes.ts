import { Router } from 'express';
import { TemplateController } from './templates.controller';

const router = Router();

router.get('/', TemplateController.list);
router.post('/:id/render', TemplateController.render);
router.post('/:id/export', TemplateController.export);

export default router;
