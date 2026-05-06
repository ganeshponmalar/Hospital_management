const pool = require('../db');

exports.getAllAppointments = async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT a.*, p.name as patient_name, d.name as doctor_name 
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            JOIN doctors d ON a.doctor_id = d.id
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.bookAppointment = async (req, res) => {
    const { patient_id, doctor_id, appointment_date, reason } = req.body;
    try {
        const [result] = await pool.execute(
            'INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason) VALUES (?, ?, ?, ?)',
            [patient_id, doctor_id, appointment_date, reason]
        );
        res.status(201).json({ id: result.insertId, message: 'Appointment booked successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateAppointmentStatus = async (req, res) => {
    const { status } = req.body;
    try {
        await pool.execute('UPDATE appointments SET status=? WHERE id=?', [status, req.params.id]);
        
        res.json({ message: 'Status updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
