const express = require('express');
const ProviderController = require('../controllers/ProviderController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(authenticate, authorize('provider'));

router.get('/profile', ProviderController.getProfile);
router.put('/profile', upload.single('profileImage'), ProviderController.updateProfile);

router.post('/services', ProviderController.addService);
router.get('/services', ProviderController.getMyServices);
router.put('/services/:id', ProviderController.updateService);
router.delete('/services/:id', ProviderController.removeService);

router.put('/availability', ProviderController.setAvailability);
router.get('/availability', ProviderController.getAvailability);

router.get('/bookings/requests', ProviderController.getBookingRequests);
router.get('/bookings', ProviderController.getMyBookings);

router.get('/earnings', ProviderController.getEarnings);
router.get('/reviews', ProviderController.getReviews);

module.exports = router;
