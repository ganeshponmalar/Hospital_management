const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
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
const admissionRoutes = require('./routes/admission.routes');
const wardRoutes = require('./routes/ward.routes');
const emrRoutes = require('./routes/emr.routes');
const scheduleRoutes = require('./routes/schedule.routes');
const queueRoutes = require('./routes/queue.routes');

app.use('/api', authRoutes); // Auth routes still used for login
app.use('/api', patientRoutes);
app.use('/api', doctorRoutes);
app.use('/api', appointmentRoutes);
app.use('/api', billingRoutes);
app.use('/api', pharmacyRoutes);
app.use('/api/lab', labRoutes);
app.use('/api', statsRoutes);
app.use('/api', admissionRoutes);
app.use('/api', wardRoutes);
app.use('/api/emr', emrRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/queue', queueRoutes);

// SERVE STATIC FILES IN PRODUCTION
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.get('/{*splat}', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(__dirname, '../client/dist/index.html'));
        }
    });
} else {
    app.get('/', (req, res) => {
        res.json({ message: 'Welcome to Hospital Management System API' });
    });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
