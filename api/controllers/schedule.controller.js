const db = require('../db');

// Create Doctor Schedule with Slots
exports.createSchedule = async (req, res) => {
    const { doctor_id, available_date, start_time, end_time, slot_duration } = req.body;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Insert Schedule
        const [scheduleResult] = await connection.query(
            'INSERT INTO doctor_schedule (doctor_id, available_date, start_time, end_time) VALUES (?, ?, ?, ?)',
            [doctor_id, available_date, start_time, end_time]
        );
        const scheduleId = scheduleResult.insertId;

        // 2. Generate Slots
        // Helper to convert time to minutes
        const timeToMinutes = (timeStr) => {
            const [h, m] = timeStr.split(':').map(Number);
            return h * 60 + m;
        };
        const minutesToTime = (mins) => {
            const h = Math.floor(mins / 60).toString().padStart(2, '0');
            const m = (mins % 60).toString().padStart(2, '0');
            return `${h}:${m}:00`;
        };

        const startMins = timeToMinutes(start_time);
        const endMins = timeToMinutes(end_time);
        const duration = parseInt(slot_duration) || 15; // default 15 mins

        const slots = [];
        for (let m = startMins; m + duration <= endMins; m += duration) {
            slots.push([scheduleId, minutesToTime(m)]);
        }

        if (slots.length > 0) {
            await connection.query(
                'INSERT INTO doctor_slots (schedule_id, slot_time) VALUES ?',
                [slots]
            );
        }

        await connection.commit();
        res.status(201).json({
            message: 'Schedule and slots created successfully',
            scheduleId,
            totalSlots: slots.length
        });
    } catch (error) {
        await connection.rollback();
        console.error('Schedule Error:', error);
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};

// Get Doctor Availability
exports.getAvailability = async (req, res) => {
    try {
        const { doctorId, date } = req.query;
        const [slots] = await db.query(`
            SELECT ds.*, s.available_date, s.start_time, s.end_time
            FROM doctor_slots ds
            JOIN doctor_schedule s ON ds.schedule_id = s.id
            WHERE s.doctor_id = ? AND s.available_date = ?
        `, [doctorId, date]);
        res.json(slots);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Book a slot
exports.bookSlot = async (req, res) => {
    try {
        const { slotId } = req.params;
        const [result] = await db.query(
            'UPDATE doctor_slots SET is_booked = TRUE WHERE id = ? AND is_booked = FALSE',
            [slotId]
        );
        if (result.affectedRows === 0) {
            return res.status(400).json({ message: 'Slot already booked or invalid' });
        }
        res.json({ message: 'Slot booked successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
