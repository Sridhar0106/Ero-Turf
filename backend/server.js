require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Security & Middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow any localhost port during development
    if (
      origin.startsWith('http://localhost:') ||
      origin === (process.env.FRONTEND_URL || 'http://localhost:5173')
    ) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

const paymentRoutes = require('./routes/payment');

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/turfs', require('./routes/turf'));
app.use('/api/slots', require('./routes/slot'));
app.use('/api/bookings', require('./routes/booking'));
app.use('/api/payments', paymentRoutes);
app.use('/api/cricket', require('./routes/cricket'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/users', require('./routes/user'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', time: new Date().toISOString(), app: 'EROTURF API' });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🏏 EROTURF Server running on port ${PORT} (loaded environment)`);
});

module.exports = app;
