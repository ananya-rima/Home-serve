const express = require('express');
const ReviewController = require('../controllers/ReviewController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/', authenticate, authorize('customer'), ReviewController.create);
router.put('/:id', authenticate, authorize('customer'), ReviewController.update);
router.delete('/:id', authenticate, authorize('customer'), ReviewController.remove);

module.exports = router;
