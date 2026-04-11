const pool = require('../db');

// ✅ GET ALL PATIENTS
exports.getAllPatients = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM patients');
        res.json(rows);
    } catch (err) {
        console.error('Fetch Patients Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// ✅ CREATE PATIENT (FIXED)
exports.createPatient = async (req, res) => {
    const {
        name, age, gender, date_of_birth, phone, email,
        address, blood_group, allergies, medical_history,
        emergency_contact_name, emergency_contact_phone
    } = req.body;

    try {
        const [result] = await pool.execute(
            `INSERT INTO patients (
                name, age, gender, date_of_birth, phone, email, 
                address, blood_group, allergies, medical_history, 
                emergency_contact_name, emergency_contact_phone
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                age || null,
                gender,
                date_of_birth || null,
                phone,
                email,
                address,
                blood_group,
                allergies,
                medical_history,
                emergency_contact_name,
                emergency_contact_phone
            ]
        );

        res.status(201).json({
            id: result.insertId,
            name
        });

    } catch (err) {
        console.error('Patient Creation Error:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.updatePatient = async (req, res) => {
    const {
        name, age, gender, date_of_birth, phone, email,
        address, blood_group, allergies, medical_history,
        emergency_contact_name, emergency_contact_phone
    } = req.body;
    try {
        await pool.execute(
            `UPDATE patients SET 
                name=?, age=?, gender=?, date_of_birth=?, phone=?, email=?, 
                address=?, blood_group=?, allergies=?, medical_history=?, 
                emergency_contact_name=?, emergency_contact_phone=? 
            WHERE id=?`,
            [
                name, age || null, gender, date_of_birth || null, phone, email,
                address, blood_group, allergies, medical_history,
                emergency_contact_name, emergency_contact_phone,
                req.params.id
            ]
        );
        res.json({ message: 'Patient updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deletePatient = async (req, res) => {
    try {
        await pool.execute('DELETE FROM patients WHERE id=?', [req.params.id]);
        res.json({ message: 'Patient deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
