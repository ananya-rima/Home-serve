require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/database');
const { initSocket } = require('./src/config/socket');
const Booking = require('./src/models/Booking'); 

const PORT = process.env.PORT || 5003;
const server = http.createServer(app);
initSocket(server);


const autoCancelExpiredBookings = async () => {
  try {
    const now = new Date();

    
    const activeBookings = await Booking.find({
      status: { $in: ['Pending', 'Confirmed'] },
    });

    for (const booking of activeBookings) {
      const [startTimeStr] = booking.timeSlot.split('-');
      const [hours, minutes] = (startTimeStr || '00:00').split(':').map(Number);

      const scheduledTime = new Date(booking.bookingDate);
      scheduledTime.setHours(hours || 0, minutes || 0, 0, 0);

      
      const expiryTime = new Date(scheduledTime.getTime() + 60 * 60 * 1000);

      
      if (now > expiryTime) {
        booking.status = 'Cancelled';
        booking.statusHistory.push({
          status: 'Cancelled',
          changedAt: now,
        });
        await booking.save();
        console.log(`[AUTO-CANCEL] Booking #${booking._id} expired and marked as Cancelled.`);
      }
    }
  } catch (error) {
    console.error('Error auto-cancelling expired bookings:', error);
  }
};

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`HomeServe backend running on port ${PORT}`);

    
    autoCancelExpiredBookings();

    
    setInterval(autoCancelExpiredBookings, 10 * 60 * 1000);
  });
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});