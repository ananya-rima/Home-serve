const express = require('express');
const ServiceController = require('../controllers/ServiceController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', ServiceController.getAll);
router.get('/:id', ServiceController.getById);
router.post('/', authenticate, authorize('admin'), upload.single('image'), ServiceController.create);
router.put('/:id', authenticate, authorize('admin'), upload.single('image'), ServiceController.update);
router.delete('/:id', authenticate, authorize('admin'), ServiceController.remove);

module.exports = router;
