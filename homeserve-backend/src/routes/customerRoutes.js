const express = require('express');
const CustomerController = require('../controllers/CustomerController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(authenticate, authorize('customer'));

router.get('/profile', CustomerController.getProfile);
router.put('/profile', upload.single('profileImage'), CustomerController.updateProfile);

router.post('/addresses', CustomerController.createAddress);
router.get('/addresses', CustomerController.getAddresses);
router.put('/addresses/:id', CustomerController.updateAddress);
router.delete('/addresses/:id', CustomerController.deleteAddress);
router.patch('/addresses/:id/default', CustomerController.setDefaultAddress);

module.exports = router;
