const db = require('../db');

// Add Patient to Queue
exports.addToQueue = async (req, res) => {
    const { patient_id, doctor_id, queue_date } = req.body;

    try {
        // 1. Get next token number for this doctor on this date
        const [result] = await db.query(
            'SELECT COALESCE(MAX(token_number), 0) + 1 as next_token FROM queue WHERE doctor_id = ? AND queue_date = ?',
            [doctor_id, queue_date]
        );
        const nextToken = result[0].next_token;

        // 2. Insert into queue
        await db.query(
            'INSERT INTO queue (patient_id, doctor_id, token_number, queue_date) VALUES (?, ?, ?, ?)',
            [patient_id, doctor_id, nextToken, queue_date]
        );

        res.status(201).json({
            message: 'Patient added to queue',
            token_number: nextToken
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Token conflict. Please try again.' });
        }
        res.status(500).json({ error: error.message });
    }
};

// Get Live Queue Status
exports.getQueueStatus = async (req, res) => {
    try {
        const { doctorId, date } = req.query;
        const [queue] = await db.query(`
            SELECT q.*, p.name as patient_name
            FROM queue q
            JOIN patients p ON q.patient_id = p.id
            WHERE q.doctor_id = ? AND q.queue_date = ?
            ORDER BY q.token_number ASC
        `, [doctorId, date]);
        res.json(queue);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Queue Status (Call Patient, Complete, etc.)
exports.updateStatus = async (req, res) => {
    try {
        const { queueId } = req.params;
        const { status } = req.body;
        await db.query(
            'UPDATE queue SET status = ? WHERE id = ?',
            [status, queueId]
        );
        res.json({ message: 'Queue status updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
