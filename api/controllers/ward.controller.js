const db = require('../db');

// Ward Controllers
exports.createWard = async (req, res) => {
    try {
        const { ward_name, ward_type, capacity } = req.body;
        const [result] = await db.query(
            'INSERT INTO wards (ward_name, ward_type, capacity) VALUES (?, ?, ?)',
            [ward_name, ward_type, capacity]
        );
        res.status(201).json({ id: result.insertId, message: 'Ward created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllWards = async (req, res) => {
    try {
        const [wards] = await db.query('SELECT * FROM wards');
        res.json(wards);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Bed Controllers
exports.createBed = async (req, res) => {
    try {
        const { ward_id, bed_number } = req.body;
        const [result] = await db.query(
            'INSERT INTO beds (ward_id, bed_number) VALUES (?, ?)',
            [ward_id, bed_number]
        );
        res.status(201).json({ id: result.insertId, message: 'Bed created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAvailableBeds = async (req, res) => {
    try {
        const [beds] = await db.query(`
            SELECT b.*, w.ward_name, w.ward_type 
            FROM beds b 
            JOIN wards w ON b.ward_id = w.id 
            WHERE b.status = 'available'
        `);
        res.json(beds);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getBedStats = async (req, res) => {
    try {
        const [[stats]] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupied,
                SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available
            FROM beds
        `);
        res.json({
            total: stats.total || 0,
            occupied: stats.occupied || 0,
            available: stats.available || 0
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
