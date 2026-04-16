const db = require('../db');

// Create Medical Record with Prescriptions
exports.createRecord = async (req, res) => {
    const { patient_id, doctor_id, diagnosis, notes, prescriptions } = req.body;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Insert Medical Record
        const [recordResult] = await connection.query(
            'INSERT INTO medical_records (patient_id, doctor_id, diagnosis, notes) VALUES (?, ?, ?, ?)',
            [patient_id, doctor_id, diagnosis, notes]
        );
        const recordId = recordResult.insertId;

        // 2. Insert Prescriptions if any
        if (prescriptions && prescriptions.length > 0) {
            const prescriptionData = prescriptions.map(p => [
                recordId,
                p.medicine_name,
                p.dosage,
                p.duration
            ]);
            await connection.query(
                'INSERT INTO prescriptions (record_id, medicine_name, dosage, duration) VALUES ?',
                [prescriptionData]
            );
        }

        await connection.commit();
        res.status(201).json({
            message: 'Medical record and prescriptions created successfully',
            recordId
        });
    } catch (error) {
        await connection.rollback();
        console.error('EMR Error:', error);
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};

// Get Patient History
exports.getPatientHistory = async (req, res) => {
    try {
        const [records] = await db.query(`
            SELECT mr.*, d.name as doctor_name 
            FROM medical_records mr
            JOIN doctors d ON mr.doctor_id = d.id
            WHERE mr.patient_id = ?
            ORDER BY mr.created_at DESC
        `, [req.params.patientId]);

        // Get prescriptions for these records
        for (let record of records) {
            const [prescriptions] = await db.query(
                'SELECT * FROM prescriptions WHERE record_id = ?',
                [record.id]
            );
            record.prescriptions = prescriptions;
        }

        res.json(records);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Single Record details
exports.getRecordDetails = async (req, res) => {
    try {
        const [records] = await db.query(`
            SELECT mr.*, p.name as patient_name, d.name as doctor_name 
            FROM medical_records mr
            JOIN patients p ON mr.patient_id = p.id
            JOIN doctors d ON mr.doctor_id = d.id
            WHERE mr.id = ?
        `, [req.params.id]);

        if (records.length === 0) return res.status(404).json({ message: 'Record not found' });

        const [prescriptions] = await db.query(
            'SELECT * FROM prescriptions WHERE record_id = ?',
            [req.params.id]
        );

        res.json({ ...records[0], prescriptions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
