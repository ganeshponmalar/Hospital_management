const pool = require('../db');

exports.getAllMedicines = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM medicines');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addMedicine = async (req, res) => {
    const { name, stock, price, expiry_date } = req.body;
    try {
        const [result] = await pool.execute(
            'INSERT INTO medicines (name, stock, price, expiry_date) VALUES (?, ?, ?, ?)',
            [name, stock, price, expiry_date]
        );
        res.status(201).json({ id: result.insertId, name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateStock = async (req, res) => {
    const { stock } = req.body;
    try {
        await pool.execute('UPDATE medicines SET stock = ? WHERE id = ?', [stock, req.params.id]);
        res.json({ message: 'Stock updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
