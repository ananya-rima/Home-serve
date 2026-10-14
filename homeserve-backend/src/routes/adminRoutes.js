const express = require('express');
const AdminController = require('../controllers/AdminController');
const CategoryController = require('../controllers/CategoryController');
const ServiceController = require('../controllers/ServiceController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();


router.use(authenticate, authorize('admin'));


router.get('/dashboard', AdminController.getDashboard);
router.get('/revenue', AdminController.getRevenueReport);
router.get('/top-services', AdminController.getTopServices);
router.get('/top-providers', AdminController.getTopProviders);
router.get('/provider-ratings', AdminController.getProviderRatingSummaries);
router.get('/providers-with-services', AdminController.getProvidersWithServices);


router.get('/customers', AdminController.getCustomers);
router.get('/customers/:id', AdminController.getCustomerDetails);
router.patch('/customers/:id/toggle-block', AdminController.toggleCustomerBlock);


router.get('/providers', AdminController.getProviders);
router.get('/providers/:id', AdminController.getProviderDetails);
router.patch('/providers/:id/approve', AdminController.approveProvider);
router.patch('/providers/:id/reject', AdminController.rejectProvider);
router.patch('/providers/:id/toggle-block', AdminController.toggleProviderBlock);


router.post('/categories', CategoryController.create);
router.put('/categories/:id', CategoryController.update);
router.delete('/categories/:id', CategoryController.remove);
router.patch('/categories/:id/toggle-status', CategoryController.toggleStatus);

router.post('/services', ServiceController.create);
router.put('/services/:id', ServiceController.update);
router.delete('/services/:id', ServiceController.remove);


router.get('/bookings', AdminController.getAllBookings);
router.get('/bookings/:id', AdminController.getBookingDetails);


router.get('/reviews', AdminController.getReviews);
router.delete('/reviews/:id', AdminController.removeReview);


router.get('/complaints', AdminController.getComplaints);
router.patch('/complaints/:id', AdminController.updateComplaint);

module.exports = router;
