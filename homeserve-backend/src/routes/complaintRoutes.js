const express = require('express');
const ComplaintController = require('../controllers/ComplaintController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('customer'), ComplaintController.create);
router.get('/my-complaints', authorize('customer'), ComplaintController.getMyComplaints);
router.get('/:id', ComplaintController.getById); // ownership/admin checked inside controller

module.exports = router;
