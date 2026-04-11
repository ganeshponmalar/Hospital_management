const pool = require('../db');

exports.getDashboardStats = async (req, res) => {
    try {
        const [patients] = await pool.execute('SELECT COUNT(*) AS totalPatients FROM patients');
        const [doctors] = await pool.execute('SELECT COUNT(*) AS totalDoctors FROM doctors');
        const [appointments] = await pool.execute(`
            SELECT COUNT(*) AS todayAppointments 
            FROM appointments 
            WHERE DATE(appointment_date) = CURDATE()
        `);
        const [revenue] = await pool.execute(`
            SELECT SUM(total_amount) AS totalRevenue 
            FROM billing 
            WHERE status = 'Paid'
        `);

        res.json({
            totalPatients: patients[0].totalPatients || 0,
            totalDoctors: doctors[0].totalDoctors || 0,
            todayAppointments: appointments[0].todayAppointments || 0,
            totalRevenue: parseFloat(revenue[0].totalRevenue || 0).toFixed(2)
        });
    } catch (err) {
        console.error('Stats Error:', err);
        res.status(500).json({ error: err.message });
    }
};
