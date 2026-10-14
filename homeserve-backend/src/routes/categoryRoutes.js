const express = require('express');
const CategoryController = require('../controllers/CategoryController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getById);
router.post('/', authenticate, authorize('admin'), upload.single('image'), CategoryController.create);
router.put('/:id', authenticate, authorize('admin'), upload.single('image'), CategoryController.update);
router.delete('/:id', authenticate, authorize('admin'), CategoryController.remove);
router.patch('/:id/toggle-status', authenticate, authorize('admin'), CategoryController.toggleStatus);

module.exports = router;
