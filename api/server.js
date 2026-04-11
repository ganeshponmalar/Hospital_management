const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// ✅ IMPORTANT MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ROUTES (FOLLOWING FINAL EXAMPLE ✅)
const authRoutes = require('./routes/auth.routes');
const patientRoutes = require('./routes/patient.routes');
const doctorRoutes = require('./routes/doctor.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const billingRoutes = require('./routes/billing.routes');
const pharmacyRoutes = require('./routes/pharmacy.routes');
const labRoutes = require('./routes/lab.routes');
const statsRoutes = require('./routes/stats.routes');

app.use('/api', authRoutes); // Auth routes still used for login
app.use('/api', patientRoutes);
app.use('/api', doctorRoutes);
app.use('/api', appointmentRoutes);
app.use('/api', billingRoutes);
app.use('/api', pharmacyRoutes);
app.use('/api', labRoutes);
app.use('/api', statsRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Hospital Management System API' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
