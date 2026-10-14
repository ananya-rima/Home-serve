const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const apiRoutes = require('./routes/index');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();


app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));




app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'HomeServe API is running' });
});


app.use('/api', apiRoutes);


app.use(notFound);
app.use(errorHandler);

module.exports = app;
