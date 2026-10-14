const express = require('express');
const CustomerController = require('../controllers/CustomerController');
const ReviewController = require('../controllers/ReviewController');
const ProviderController = require('../controllers/ProviderController');

const router = express.Router();


router.get('/', CustomerController.discoverProviders);

router.get('/:id', CustomerController.getProviderDetails);
router.get('/:id/availability', CustomerController.getProviderAvailability);

router.get('/:id/availability', ProviderController.getPublicAvailability);

router.get('/:id/reviews', ReviewController.getByProvider);

module.exports = router;
