const pool = require('../db');

exports.uploadReport = async (req, res) => {
    const { patient_id, test_name, result, file_url } = req.body;
    try {
        const [res_db] = await pool.execute(
            'INSERT INTO lab_reports (patient_id, test_name, result, file_url) VALUES (?, ?, ?, ?)',
            [patient_id, test_name, result, file_url]
        );
        res.status(201).json({ id: res_db.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getReportsByPatient = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM lab_reports WHERE patient_id = ?', [req.params.patientId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
