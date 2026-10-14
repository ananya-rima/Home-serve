const express = require('express');
const BookingController = require('../controllers/BookingController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('customer'), BookingController.create);
router.get('/my-bookings', authorize('customer'), BookingController.getMyBookings);
router.get('/:id', BookingController.getById); 
router.patch('/:id/accept', authorize('provider'), BookingController.acceptBooking);
router.patch('/:id/reject', authorize('provider'), BookingController.rejectBooking);
router.patch('/:id/status', authorize('provider'), BookingController.updateStatus);
router.patch('/:id/cancel', authorize('customer'), BookingController.cancelBooking);

module.exports = router;
