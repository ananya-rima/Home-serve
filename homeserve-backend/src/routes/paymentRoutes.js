const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/PaymentController');

router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);

node_modules = module.exports = router;