const express = require('express');

const authRoutes = require('./authRoutes');
const categoryRoutes = require('./categoryRoutes');
const serviceRoutes = require('./serviceRoutes');
const customerRoutes = require('./customerRoutes');
const providerRoutes = require('./providerRoutes');
const providerPublicRoutes = require('./providerPublicRoutes');
const bookingRoutes = require('./bookingRoutes');
const reviewRoutes = require('./reviewRoutes');
const complaintRoutes = require('./complaintRoutes');
const adminRoutes = require('./adminRoutes');
const paymentRoutes = require('./paymentRoutes');

const router = express.Router();

router.use('/payments', paymentRoutes);
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/services', serviceRoutes);
router.use('/customer', customerRoutes);
router.use('/provider', providerRoutes);
router.use('/providers', providerPublicRoutes);
router.use('/bookings', bookingRoutes);
router.use('/reviews', reviewRoutes);
router.use('/complaints', complaintRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
