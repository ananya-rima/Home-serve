
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');

(async () => {
  await connectDB();

  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@homeserve.com').toLowerCase();
  const existing = await User.findOne({ email });

  if (existing) {
    
    if (!existing.isEmailVerified) {
      existing.isEmailVerified = true;
      await existing.save();
      console.log('Existing admin marked as email-verified:', email);
    } else {
      console.log('Admin already exists:', email);
    }
    process.exit(0);
  }

  const admin = await User.create({
    name: process.env.SEED_ADMIN_NAME || 'Super Admin',
    email,
    phone: process.env.SEED_ADMIN_PHONE || '9999999999',
    password: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345',
    role: 'admin',
    status: 'active',
    
    isEmailVerified: true,
  });

  console.log('Admin account created:', admin.email);
  process.exit(0);
})().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
