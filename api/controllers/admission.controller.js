const db = require('../db');

// Admit Patient with Transaction & Validation
exports.admitPatient = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { patient_id, doctor_id, bed_id, reason, admission_type } = req.body;

        await connection.beginTransaction();

        // 1. Check if bed is available
        const [bed] = await connection.query(
            'SELECT status FROM beds WHERE id = ? FOR UPDATE',
            [bed_id]
        );

        if (!bed.length) {
            await connection.rollback();
            return res.status(404).json({ error: 'Bed not found' });
        }

        if (bed[0].status !== 'available') {
            await connection.rollback();
            return res.status(400).json({ error: 'Bed already occupied' });
        }

        // 2. Validate patient_id
        const [patient] = await connection.query(
            'SELECT id FROM patients WHERE id = ?',
            [patient_id]
        );
        if (!patient.length) {
            await connection.rollback();
            return res.status(404).json({ error: 'Patient not found' });
        }

        // 3. Create Admission Record
        const [admissionResult] = await connection.query(
            'INSERT INTO admissions (patient_id, doctor_id, bed_id, reason, admission_type, status) VALUES (?, ?, ?, ?, ?, "admitted")',
            [patient_id, doctor_id, bed_id, reason, admission_type]
        );

        // 4. Update Bed Status to occupied
        await connection.query(
            'UPDATE beds SET status = "occupied" WHERE id = ?',
            [bed_id]
        );

        await connection.commit();
        res.status(201).json({
            id: admissionResult.insertId,
            message: 'Patient admitted successfully',
            bed_id
        });
    } catch (err) {
        await connection.rollback();
        console.error('Admission Error:', err.message);
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
};

// Discharge Patient with Transaction & Validation
exports.dischargePatient = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { admission_id, final_diagnosis, treatment_given, medications, doctor_notes, follow_up_date } = req.body;

        await connection.beginTransaction();

        // 1. Get Admission details and check status
        const [admission] = await connection.query(
            'SELECT id, bed_id, status FROM admissions WHERE id = ? FOR UPDATE',
            [admission_id]
        );

        if (!admission.length) {
            await connection.rollback();
            return res.status(404).json({ error: 'Admission record not found' });
        }

        if (admission[0].status === 'discharged') {
            await connection.rollback();
            return res.status(400).json({ error: 'Already discharged' });
        }

        const bed_id = admission[0].bed_id;

        // 2. Create Discharge Summary
        await connection.query(
            `INSERT INTO discharge_summary (
                admission_id, discharge_date, final_diagnosis, 
                treatment_given, medications, doctor_notes, follow_up_date
            ) VALUES (?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?)`,
            [admission_id, final_diagnosis, treatment_given, medications, doctor_notes, follow_up_date]
        );

        // 3. Update Admission Status
        await connection.query(
            'UPDATE admissions SET status = "discharged" WHERE id = ?',
            [admission_id]
        );

        // 4. Release Bed
        await connection.query(
            'UPDATE beds SET status = "available" WHERE id = ?',
            [bed_id]
        );

        await connection.commit();
        res.json({ message: 'Patient discharged successfully', admission_id, bed_id });
    } catch (err) {
        await connection.rollback();
        console.error('Discharge Error:', err.message);
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
};

// Get Patient Admission History
exports.getPatientAdmissionHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const [history] = await db.query(`
            SELECT a.*, d.name as doctor_name, b.bed_number, w.ward_name, ds.discharge_date
            FROM admissions a
            LEFT JOIN doctors d ON a.doctor_id = d.id
            LEFT JOIN beds b ON a.bed_id = b.id
            LEFT JOIN wards w ON b.ward_id = w.id
            LEFT JOIN discharge_summary ds ON a.id = ds.admission_id
            WHERE a.patient_id = ?
            ORDER BY a.admission_date DESC
        `, [id]);
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAdmissionById = async (req, res) => {
    try {
        const { id } = req.params;
        const [[admission]] = await db.query(`
            SELECT a.*, p.name as patient_name, d.name as doctor_name, b.bed_number, w.ward_name
            FROM admissions a
            JOIN patients p ON a.patient_id = p.id
            JOIN doctors d ON a.doctor_id = d.id
            JOIN beds b ON a.bed_id = b.id
            JOIN wards w ON b.ward_id = w.id
            WHERE a.id = ?
        `, [id]);

        if (!admission) return res.status(404).json({ error: 'Admission not found' });

        res.json(admission);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllAdmissions = async (req, res) => {
    try {
        const [admissions] = await db.query(`
            SELECT a.*, p.name as patient_name, d.name as doctor_name, b.bed_number, w.ward_name
            FROM admissions a
            JOIN patients p ON a.patient_id = p.id
            JOIN doctors d ON a.doctor_id = d.id
            JOIN beds b ON a.bed_id = b.id
            JOIN wards w ON b.ward_id = w.id
            ORDER BY a.admission_date DESC
        `);
        res.json(admissions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
