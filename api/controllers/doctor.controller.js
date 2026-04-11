const pool = require('../db');

exports.getAllDoctors = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM doctors');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getDoctorById = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM doctors WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Doctor not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// CREATE DOCTOR (MODIFIED TO MATCH EXAMPLE ✅)
exports.createDoctor = async (req, res) => {
    const {
        name,
        specialization,
        qualification,
        experience,
        phone,
        email,
        consultation_fee,
        available_days,
        available_time
    } = req.body;

    try {
        const [result] = await pool.execute(
            `INSERT INTO doctors 
            (name, specialization, qualification, experience, phone, email, consultation_fee, available_days, available_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                specialization,
                qualification,
                experience || null,
                phone,
                email,
                consultation_fee || null,
                available_days,
                available_time
            ]
        );

        res.status(201).json({
            message: "Doctor created successfully",
            id: result.insertId
        });

    } catch (err) {
        console.error("Doctor Creation Error:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.updateDoctor = async (req, res) => {
    const {
        name, specialization, qualification, experience,
        phone, email, consultation_fee, available_days, available_time
    } = req.body;
    try {
        await pool.execute(
            `UPDATE doctors SET 
                name=?, specialization=?, qualification=?, experience=?, 
                phone=?, email=?, consultation_fee=?, available_days=?, available_time=? 
            WHERE id=?`,
            [
                name, specialization, qualification, experience || null,
                phone, email, consultation_fee || null, available_days, available_time,
                req.params.id
            ]
        );
        res.json({ message: 'Doctor updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteDoctor = async (req, res) => {
    try {
        await pool.execute('DELETE FROM doctors WHERE id = ?', [req.params.id]);
        res.json({ message: 'Doctor deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
