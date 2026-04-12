const pool = require('../db');

exports.createBill = async (req, res) => {

    const { patient_id, total_amount, description } = req.body;
    try {
        const [result] = await pool.execute(
            'INSERT INTO billing (patient_id, total_amount, description) VALUES (?, ?, ?)',
            [patient_id, total_amount, description]
        );
        res.status(201).json({ id: result.insertId, status: 'Unpaid' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllBills = async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT b.*, p.name as patient_name 
            FROM billing b
            JOIN patients p ON b.patient_id = p.id
            ORDER BY b.billing_date DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.getBillsByPatient = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM billing WHERE patient_id = ?', [req.params.patientId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateBillStatus = async (req, res) => {
    const { status } = req.body;
    try {
        await pool.execute('UPDATE billing SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Bill status updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
